import { Platform } from '@angular/cdk/platform';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    Inject,
    isDevMode,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
} from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatSnackBarConfig } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ReactiveFormConfig } from '@rxweb/reactive-form-validators';
import { locale as navigationEnglish } from 'app/navigation/i18n/en';
import { locale as navigationIndonesian } from 'app/navigation/i18n/id';
import { navigation } from 'app/navigation/navigation';
import { environment } from 'environments/environment';
import * as LogRocket from 'logrocket';
import { CookieService } from 'ngx-cookie-service';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { concat, interval, Subject } from 'rxjs';
import { distinctUntilChanged, first, takeUntil } from 'rxjs/operators';
import { IAuth } from './main/pages/core/auth/models';
import { AuthActions } from './main/pages/core/auth/store/actions';
import { AuthSelectors } from './main/pages/core/auth/store/selectors';
import { MaintenanceDialogComponent } from './shared/components/dialogs/maintenance-dialog/maintenance-dialog.component';
import { NavigationService, NoticeService } from './shared/helpers';
import { LifecyclePlatform } from './shared/models/global.model';
import * as fromRoot from './store/app.reducer';

if (environment.logRocketId) {
    LogRocket.init(environment.logRocketId, {
        release: `${environment.appVersion}_${environment.appHash}`,
        network: {
            requestSanitizer: (request) => {
                // Menghapus header authorization dari LogRocket.
                request.headers['authorization'] = null;
                request.headers['Authorization'] = null;
                return request;
            },
            responseSanitizer: (response) => {
                if (response.body) {
                    if ((response.body as unknown as IAuth).token) {
                        // Menghapus token dari body response.
                        (response.body as unknown as IAuth).token = null;
                    }
                }

                return response;
            },
        },
    });
}

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
    idleState = 'Not started.';
    timedOut = false;
    lastPing?: Date = null;
    isNewVersion: boolean;
    fuseConfig: any;
    navigation: any;
    statusOrder: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        @Inject(PLATFORM_ID) private platformId,
        @Inject(DOCUMENT) private document: any,
        private swUpdate: SwUpdate,
        private appRef: ApplicationRef,
        private ngxPermissions: NgxPermissionsService,
        private ngxRoles: NgxRolesService,
        private idle: Idle,
        private keepAlive: Keepalive,
        private store: Store<fromRoot.State>,
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _translateService: TranslateService,
        private _platform: Platform,
        private _$navigation: NavigationService,
        private _$notice: NoticeService,
        private angularFireDatabase: AngularFireDatabase,
        private dialog: MatDialog,
        private _cookieService: CookieService,
        private _router: Router,
    ) {
        // Get default navigation
        this.navigation = navigation;

        // Register the navigation to the service
        this._fuseNavigationService.register('main', this.navigation);
        // this.statusOrder = statusOrder;

        // Set the main navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('main');

        // Add languages
        this._translateService.addLangs(['id', 'en']);

        // Set the default language
        this._translateService.setDefaultLang('id');

        // Set the navigation translations
        this._fuseTranslationLoaderService.loadTranslations(
            navigationIndonesian,
            navigationEnglish
        );

        // Use a language
        this._translateService.use('id');

        // CHECK MAINTENANCE
        this.angularFireDatabase
            .object('/maintenance')
            .valueChanges()
            .subscribe((res: any) => {
                if (res.ssc) {
                    this.dialog.open(MaintenanceDialogComponent, {
                        minHeight: '100vh',
                        minWidth: '100%',
                    });
                } else {
                    this.dialog.closeAll();
                }
            });

        // Move to lifecycle AuthEffect
        if (isPlatformBrowser(this.platformId)) {
            this.store.dispatch(AuthActions.authAutoLogin());
        }

        // Sets an idle timout of 5 seconds
        this.idle.setIdle(5);

        // Sets a timeout period of 30 seconds
        // this.idle.setTimeout(30);

        // Sets the default interrupts
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        this.idle.onIdleEnd.subscribe(() => {
            // console.log('No longer idle');
            this.idleState = 'No longer idle';
        });
        this.idle.onTimeout.subscribe(() => {
            // console.log('Timed out!');
            this.idleState = 'Timed out!';
            this.timedOut = true;
        });
        this.idle.onIdleStart.subscribe(() => {
            // console.log('You gone idle!');
            this.idleState = 'You gone idle!';
        });
        this.idle.onTimeoutWarning.subscribe((countdown) => {
            // console.log(`You will timeout in ${countdown} seconds`);
            this.idleState = 'You will timeout in ' + countdown + ' seconds';
        });

        // Sets the ping interval to 15 seconds
        this.keepAlive.interval(15);

        this.keepAlive.onPing.subscribe(() => {
            // console.log(`Last ping ${new Date()}`);
            this.lastPing = new Date();
        });

        this.idleReset();

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ----------------------------------------------------------------------------------------------------
         */

        /**
         * If you are using a language other than the default one, i.e. Turkish in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'tr'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.

        /* setTimeout(() => {
            this._translateService.setDefaultLang('id');

            console.log('GET DEFAULT LANG', this._translateService.getDefaultLang());
        }, 300); */

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix End
         * ----------------------------------------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.isNewVersion = false;

        if (this.swUpdate.isEnabled) {
            // Allow the app to stabilize first, before starting polling for updates with `interval()`.
            const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable === true));
            const everySixHours$ = interval(6 * 60 * 60 * 1000);
            const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

            everySixHoursOnceAppIsStable$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => this.swUpdate.checkForUpdate());
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        const router = this._router;
        (window as any).sscGoTo = function(goToPath: string){
            if (router) {
                console.info(`[navigation] SSC Route To '${goToPath}'`);
                
                router.navigateByUrl(goToPath);
            }
        }

        this._initPage();

        this.store
            .select(AuthSelectors.getUserState)
            .pipe(distinctUntilChanged(), takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
                if (user) {
                    // Sets a timeout period of 30 seconds
                    this.idle.setTimeout(30);
                } else {
                    if (environment.isSingleSpa) {
                        if (this._cookieService.check(globalThis.SSC_TOKEN)){
                            const payload = {
                                token: this._cookieService.get(globalThis.SSC_TOKEN),
                                user: JSON.parse(localStorage.getItem('ssc-user'))
                            }
                            this.store.dispatch(AuthActions.authLoginSuccess({ payload }));
                            return this.idle.setTimeout(30)
                        }
                    }
                    return this.idle.setTimeout(false);
                }
            });

        if (this.swUpdate.isEnabled) {
            this.swUpdate.available.pipe(takeUntil(this._unsubscribeAll)).subscribe((update) => {
                if (isDevMode()) {
                    console.groupCollapsed('SW Update');
                    console.log(update);
                    console.groupEnd();
                }

                // if (confirm('New version available. Load New Version?')) {
                //     window.location.reload();
                // }

                this.isNewVersion = true;

                const matConfig = new MatSnackBarConfig();
                matConfig.verticalPosition = 'bottom';
                matConfig.horizontalPosition = 'right';

                this._$notice.open('Update version is available', 'info', matConfig, true);

                const noticeUpdate = this._$notice.open(
                    'Update version is available',
                    'info',
                    {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                        duration: 30000,
                    },
                    true
                );

                noticeUpdate
                    .onAction()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe(() => {
                        this.onReload();
                    });
            });
        }

        // this.store.select(isNetworkConnected).subscribe(isOnline => console.log(isOnline));

        // this.store.dispatch(NetworkActions.networkStatusRequest());

        // Subscribe to config changes
        this._fuseConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe((config) => {
            this.fuseConfig = config;

            // Boxed
            if (this.fuseConfig.layout.width === 'boxed') {
                this.document.body.classList.add('boxed');
            } else {
                this.document.body.classList.remove('boxed');
            }

            // Color theme - Use normal for loop for IE11 compatibility
            // for (let i = 0; i < this.document.body.classList.length; i++) {
            for (const [i, v] of this.document.body.classList.entries()) {
                const className = this.document.body.classList[i];

                if (className.startsWith('theme-')) {
                    this.document.body.classList.remove(className);
                }
            }

            this.document.body.classList.add(this.fuseConfig.colorTheme);
        });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);

        (window as any).sscGoTo = null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    private onReload(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.activated.pipe(takeUntil(this._unsubscribeAll)).subscribe((update) => {
                if (isDevMode()) {
                    console.groupCollapsed('SW Activated');
                    console.log(update);
                    console.groupEnd();
                }

                document.location.reload();
            });

            this.swUpdate.activateUpdate();
        }
    }

    private idleReset(): void {
        // console.log('Start/Reset Idle');

        this.idle.watch();
        this.idleState = 'Started';
        this.timedOut = false;
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Unsubscribe from all subscriptions
                this._unsubscribeAll.next();
                this._unsubscribeAll.complete();
                break;

            default:
                ReactiveFormConfig.set({
                    allowDecimalSymbol: '.',
                    validationMessage: {
                        required: 'This field is required',
                    },
                });

                this._$navigation.initNavigation();
                break;
        }
    }
}

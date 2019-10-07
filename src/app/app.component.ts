import { Platform } from '@angular/cdk/platform';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    PLATFORM_ID
} from '@angular/core';
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
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { AuthActions } from './main/pages/core/auth/store/actions';
import { AuthSelectors } from './main/pages/core/auth/store/selectors';
import { statusOrder } from './main/pages/orders/status';
import * as fromRoot from './store/app.reducer';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
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
        private idle: Idle,
        private keepAlive: Keepalive,
        private store: Store<fromRoot.State>,
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _translateService: TranslateService,
        private _platform: Platform
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
            console.log('No longer idle');
            this.idleState = 'No longer idle';
        });
        this.idle.onTimeout.subscribe(() => {
            console.log('Timed out!');
            this.idleState = 'Timed out!';
            this.timedOut = true;
        });
        this.idle.onIdleStart.subscribe(() => {
            console.log('You gone idle!');
            this.idleState = 'You gone idle!';
        });
        this.idle.onTimeoutWarning.subscribe(countdown => {
            console.log(`You will timeout in ${countdown} seconds`);
            this.idleState = 'You will timeout in ' + countdown + ' seconds';
        });

        // Sets the ping interval to 15 seconds
        this.keepAlive.interval(15);

        this.keepAlive.onPing.subscribe(() => {
            console.log(`Last ping ${new Date()}`);
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        ReactiveFormConfig.set({
            validationMessage: {
                required: 'This field is required'
            }
        });

        this.store
            .select(AuthSelectors.getUserState)
            .pipe(
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(user => {
                if (user) {
                    // Sets a timeout period of 30 seconds
                    this.idle.setTimeout(30);
                } else {
                    this.idle.setTimeout(false);
                }
            });

        if (this.swUpdate.isEnabled) {
            this.swUpdate.available.subscribe(update => {
                console.groupCollapsed('SW Update');
                console.log(update);
                console.groupEnd();

                // if (confirm('New version available. Load New Version?')) {
                //     window.location.reload();
                // }

                this.isNewVersion = true;
            });
        }

        // this.store.select(isNetworkConnected).subscribe(isOnline => console.log(isOnline));

        // this.store.dispatch(NetworkActions.networkStatusRequest());

        // Subscribe to config changes
        this._fuseConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.fuseConfig = config;

            // Boxed
            if (this.fuseConfig.layout.width === 'boxed') {
                this.document.body.classList.add('boxed');
            } else {
                this.document.body.classList.remove('boxed');
            }

            // Color theme - Use normal for loop for IE11 compatibility
            for (let i = 0; i < this.document.body.classList.length; i++) {
                const className = this.document.body.classList[i];

                if (className.startsWith('theme-')) {
                    this.document.body.classList.remove(className);
                }
            }

            this.document.body.classList.add(this.fuseConfig.colorTheme);
        });
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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

    onReload(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.activated.subscribe(update => {
                console.groupCollapsed('SW Activated');
                console.log(update);
                console.groupEnd();

                window.location.reload(true);
            });

            this.swUpdate.activateUpdate();
        }
    }

    private idleReset(): void {
        console.log('Start/Reset Idle');

        this.idle.watch();
        this.idleState = 'Started';
        this.timedOut = false;
    }
}

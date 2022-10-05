import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthActions } from 'app/main/pages/core/auth/store/actions';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { navigation } from 'app/navigation/navigation';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiSelectors } from 'app/shared/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { NavigationRulesService } from 'app/shared/helpers';

/**
 *
 *
 * @export
 * @class ToolbarComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, OnDestroy {
    /**
     *
     *
     * @type {boolean}
     * @memberof ToolbarComponent
     */
    horizontalNavbar: boolean;

    /**
     *
     *
     * @type {boolean}
     * @memberof ToolbarComponent
     */
    rightNavbar: boolean;

    /**
     *
     *
     * @type {boolean}
     * @memberof ToolbarComponent
     */
    hiddenNavbar: boolean;

    /**
     *
     *
     * @type {*}
     * @memberof ToolbarComponent
     */
    languages: any;

    /**
     *
     *
     * @type {*}
     * @memberof ToolbarComponent
     */
    navigation: any;

    /**
     *
     *
     * @type {*}
     * @memberof ToolbarComponent
     */
    selectedLanguage: any;

    /**
     *
     *
     * @type {any[]}
     * @memberof ToolbarComponent
     */
    userStatusOptions: any[];

    breadcrumbs$: Observable<IBreadcrumbs[]>;

    /**
     *
     *
     * @type {(Observable<Auth | any>)}
     * @memberof ToolbarComponent
     */
    user$: Observable<Auth | any>;

    /**
     *
     *
     * @private
     * @type {Subject<any>}
     * @memberof ToolbarComponent
     */
    private _unsubscribeAll: Subject<any>;

    /**
     * Creates an instance of ToolbarComponent.
     * @param {Store<fromRoot.State>} store
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} translate
     * @memberof ToolbarComponent
     */
    constructor(
        private store: Store<fromRoot.State>,
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        public translate: TranslateService
    ) {
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon: 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon: 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon: 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id: 'en',
                title: 'English',
                flag: 'us'
            },
            {
                id: 'id',
                title: 'Indonesian',
                flag: 'id'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * OnInit
     * @memberof ToolbarComponent
     */
    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        // Subscribe to the config changes
        this._fuseConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(settings => {
            this.horizontalNavbar = settings.layout.navbar.position === 'top';
            this.rightNavbar = settings.layout.navbar.position === 'right';
            this.hiddenNavbar = settings.layout.navbar.hidden === true;
        });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, {
            id: this.translate.currentLang
        });

        this.breadcrumbs$ = this.store.select(UiSelectors.getBreadcrumbs);

        this.user$ = this.store
            .select(AuthSelectors.getUserState)
            .pipe(startWith({ data: { fullName: '{{ FullName }}' } }));
    }

    /**
     *
     * OnDestroy
     * @memberof ToolbarComponent
     */
    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Toggle sidebar open
     * @param {*} key
     * @memberof ToolbarComponent
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     *
     * Search
     * @param {*} value
     * @memberof ToolbarComponent
     */
    search(value): void {
        // Do your search here...
        console.log(value);
    }

    /**
     *
     * Set the language
     * @param {*} lang
     * @memberof ToolbarComponent
     */
    setLanguage(lang): void {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this.translate.use(lang.id);
    }

    /**
     *
     * Logout event
     * @memberof ToolbarComponent
     */
    onLogout(): void {
        this.store.dispatch(AuthActions.authLogout());
    }
}

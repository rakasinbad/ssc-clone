import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { FuseConfigService } from '@fuse/services/config.service';
import { Store } from '@ngrx/store';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import { Observable, Subject } from 'rxjs';
import { delay, filter, take, takeUntil, startWith } from 'rxjs/operators';

/**
 *
 *
 * @export
 * @class NavbarVerticalStyle1Component
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: 'navbar-vertical-style-1',
    templateUrl: './style-1.component.html',
    styleUrls: ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle1Component implements OnInit, OnDestroy {
    /**
     *
     *
     * @type {*}
     * @memberof NavbarVerticalStyle1Component
     */
    fuseConfig: any;

    /**
     *
     *
     * @type {*}
     * @memberof NavbarVerticalStyle1Component
     */
    navigation: any;

    /**
     *
     *
     * @type {(Observable<Auth | any>)}
     * @memberof NavbarVerticalStyle1Component
     */
    user$: Observable<Auth | any>;

    /**
     *
     *
     * @private
     * @type {FusePerfectScrollbarDirective}
     * @memberof NavbarVerticalStyle1Component
     */
    private _fusePerfectScrollbar: FusePerfectScrollbarDirective;

    /**
     *
     *
     * @private
     * @type {Subject<any>}
     * @memberof NavbarVerticalStyle1Component
     */
    private _unsubscribeAll: Subject<any>;

    /**
     * Creates an instance of NavbarVerticalStyle1Component.
     * @param {Router} router
     * @param {Store<fromRoot.State>} store
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @memberof NavbarVerticalStyle1Component
     */
    constructor(
        private router: Router,
        private store: Store<fromRoot.State>,
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Directive
     * @memberof NavbarVerticalStyle1Component
     */
    @ViewChild(FusePerfectScrollbarDirective, { static: true })
    set directive(theDirective: FusePerfectScrollbarDirective) {
        if (!theDirective) {
            return;
        }

        this._fusePerfectScrollbar = theDirective;

        // Update the scrollbar on collapsable item toggle
        this._fuseNavigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._fusePerfectScrollbar.update();
            });

        // Scroll to the active item position
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                setTimeout(() => {
                    this._fusePerfectScrollbar.scrollToElement('navbar .nav-link.active', -120);
                });
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * OnInit
     * @memberof NavbarVerticalStyle1Component
     */
    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                if (this._fuseSidebarService.getSidebar('navbar')) {
                    this._fuseSidebarService.getSidebar('navbar').close();
                }
            });

        // Subscribe to the config changes
        this._fuseConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.fuseConfig = config;
        });

        // Get current navigation
        this._fuseNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._fuseNavigationService.getCurrentNavigation();
            });

        this.user$ = this.store
            .select(AuthSelectors.getUserState)
            .pipe(startWith({ data: { fullName: '{{ FullName }}' } }));
    }

    /**
     *
     * OnDestroy
     * @memberof NavbarVerticalStyle1Component
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
     * Toggle sidebar opened status
     * @memberof NavbarVerticalStyle1Component
     */
    toggleSidebarOpened(): void {
        this._fuseSidebarService.getSidebar('navbar').toggleOpen();
    }

    /**
     *
     * Toggle sidebar folded status
     * @memberof NavbarVerticalStyle1Component
     */
    toggleSidebarFolded(): void {
        this._fuseSidebarService.getSidebar('navbar').toggleFold();
    }
}

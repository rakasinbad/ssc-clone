import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { Store } from '@ngrx/store';
import { navigation } from 'app/navigation/navigation';
import { UiSelectors } from 'app/shared/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 *
 *
 * @export
 * @class VerticalLayout1Component
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: 'vertical-layout-1',
    templateUrl: './layout-1.component.html',
    styleUrls: ['./layout-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VerticalLayout1Component implements OnInit, OnDestroy {
    /**
     *
     *
     * @type {*}
     * @memberof VerticalLayout1Component
     */
    fuseConfig: any;

    /**
     *
     *
     * @type {*}
     * @memberof VerticalLayout1Component
     */
    navigation: any;

    /**
     *
     *
     * @type {Observable<boolean>}
     * @memberof VerticalLayout1Component
     */
    isShowCustomToolbar$: Observable<boolean>;

    /**
     *
     *
     * @private
     * @type {Subject<any>}
     * @memberof VerticalLayout1Component
     */
    private _unsubscribeAll: Subject<any>;

    /**
     * Creates an instance of VerticalLayout1Component.
     * @param {Store<fromRoot.State>} store
     * @param {FuseConfigService} _fuseConfigService
     * @memberof VerticalLayout1Component
     */
    constructor(
        private store: Store<fromRoot.State>,
        private _fuseConfigService: FuseConfigService
    ) {
        // Set the defaults
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
     * @memberof VerticalLayout1Component
     */
    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        // Subscribe to config changes
        this._fuseConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
            this.fuseConfig = config;
        });

        this.isShowCustomToolbar$ = this.store.select(UiSelectors.getIsShowCustomToolbar);
    }

    /**
     *
     * OnDestroy
     * @memberof VerticalLayout1Component
     */
    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

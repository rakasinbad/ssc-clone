import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models';
import { Observable } from 'rxjs';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { Warehouse } from '../models';
import * as fromWarehouses from '../store/reducers';
import { WarehouseSelectors } from '../store/selectors';
import { UiActions } from 'app/shared/store/actions';
import { WarehouseActions } from '../store/actions';

@Component({
    selector: 'app-warehouse-detail',
    templateUrl: './warehouse-detail.component.html',
    styleUrls: ['./warehouse-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailComponent implements OnInit {
    warehouse$: Observable<Warehouse>;
    isLoading$: Observable<boolean>;

    private _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Warehouse'
        },
        {
            title: 'Warehouse List'
        },
        {
            title: 'Warehouse Detail'
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private store: Store<fromWarehouses.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;

        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state warehouses
                this.store.dispatch(WarehouseActions.clearState());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );

                this.warehouse$ = this.store.select(WarehouseSelectors.getSelectedItem);

                this.store.dispatch(WarehouseActions.fetchWarehouseRequest({ payload: id }));

                this.isLoading$ = this.store.select(WarehouseSelectors.getIsLoading);
                break;
        }
    }
}

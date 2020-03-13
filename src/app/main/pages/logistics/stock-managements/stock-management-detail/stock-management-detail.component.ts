import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { StockManagement } from '../models';
import { StockManagementActions } from '../store/actions';
import * as fromStockManagements from '../store/reducers';
import { StockManagementSelectors } from '../store/selectors';

@Component({
    selector: 'app-stock-management-detail',
    templateUrl: './stock-management-detail.component.html',
    styleUrls: ['./stock-management-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockManagementDetailComponent implements OnInit, OnDestroy {
    warehouse$: Observable<StockManagement>;
    isLoading$: Observable<boolean>;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Warehouse'
        },
        {
            title: 'Stock Management'
        },
        {
            title: 'Stock Detail'
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private store: Store<fromStockManagements.FeatureState>,
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

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;

        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state stock managements
                this.store.dispatch(StockManagementActions.clearState());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );

                this.warehouse$ = this.store.select(StockManagementSelectors.getSelectedItem);

                this.store.dispatch(
                    StockManagementActions.fetchStockManagementRequest({ payload: id })
                );

                this.isLoading$ = this.store.select(StockManagementSelectors.getIsLoading);
                break;
        }
    }
}

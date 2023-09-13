import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { Warehouse } from '../models';
import { WarehouseActions } from '../store/actions';
import * as fromWarehouses from '../store/reducers';
import { WarehouseSelectors } from '../store/selectors';
import { Location } from '@angular/common';

@Component({
    selector: 'app-warehouse-detail',
    templateUrl: './warehouse-detail.component.html',
    styleUrls: ['./warehouse-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseDetailComponent implements OnInit, OnDestroy {
    warehouse$: Observable<Warehouse>;
    isLoading$: Observable<boolean>;
    tabIndex: number = 0;
    section: string = 'general';
    private _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home',
        },
        {
            title: 'Warehouse',
        },
        {
            title: 'Warehouse List',
        },
        {
            title: 'Warehouse Detail',
        },
    ];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private store: Store<fromWarehouses.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private router: Router
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
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    goBack(): void {
        this.location.back();
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0:
                this.section = 'general';
                break;
            case 1:
                this.section = 'location';
                break;
            case 2:
                this.section = 'coverage';
                break;
            case 3:
                this.section = 'sku-and-stock';
                break;
            case 4:
                this.section = 'exclusion-rule';
                this.router.navigateByUrl(
                    `/pages/logistics/warehouses/${this.route.snapshot.params.id}/detail/exclusion`,
                    { replaceUrl: true }
                );
                break;
        }

        if (index !== 4) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                    tab: this.section,
                },
                replaceUrl: true,
                queryParamsHandling: 'merge', // remove to replace all query params by provided
            });
        }
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

                // Reset core state warehouses
                this.store.dispatch(WarehouseActions.clearState());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );

                this.warehouse$ = this.store.select(WarehouseSelectors.getSelectedItem);

                this.store.dispatch(WarehouseActions.fetchWarehouseRequest({ payload: id }));

                this.isLoading$ = this.store.select(WarehouseSelectors.getIsLoading);

                let tab: string = this.route.snapshot.queryParamMap.get('tab');
                if (tab) {
                    this.section = tab;
                    switch (this.section) {
                        case 'general':
                            this.tabIndex = 0;
                            break;
                        case 'location':
                            this.tabIndex = 1;
                            break;
                        case 'coverage':
                            this.tabIndex = 2;
                            break;
                        case 'sku-and-stock':
                            this.tabIndex = 3;
                            break;
                        case 'exclusion-rule':
                            this.tabIndex = 4;
                            break;
                    }
                }
                break;
        }

        this.warehouse$.subscribe((item) => {
            if (item) {
                localStorage.setItem('ssc-warehouse-list-detail', JSON.stringify(item));
            }
        });
    }
}

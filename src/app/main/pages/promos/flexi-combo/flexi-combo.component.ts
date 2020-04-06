import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

import { Store as NgRxStore } from '@ngrx/store';

import { environment } from 'environments/environment';

import { fuseAnimations } from '@fuse/animations';

import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { Observable, Subject } from 'rxjs';

import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';

import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';

import { FeatureState as FlexiComboCoreState } from './store/reducers';

@Component({
    selector: 'flexi-combo',
    templateUrl: './flexi-combo.component.html',
    styleUrls: ['./flexi-combo.component.scss'],
    animations: fuseAnimations
})
export class FlexiComboComponent implements OnInit, OnDestroy {
    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Flexi Combo'
        },
        search: {
            active: true
            // changed: (value: string) => {
            //     switch (this.selectedViewBy) {
            //         case 'sku-assignment-warehouse':
            //             this.SkuAssignmentsStore.dispatch(
            //                 SkuAssignmentsWarehouseActions.setSearchValue({
            //                     payload: value
            //                 })
            //             );
            //             break;
            //         case 'sku-assignment-sku':
            //             this.SkuAssignmentsStore.dispatch(
            //                 SkuAssignmentsSkuActions.setSearchValue({
            //                     payload: value
            //                 })
            //             );
            //             break;

            //         default:
            //             return;
            //     }
            // }
        },
        add: {
            permissions: []
        },
        // viewBy: {
        //     list: [
        //         { id: 'sku-assignment-warehouse', label: 'Warehouse' },
        //         { id: 'sku-assignment-sku', label: 'SKU' }
        //     ],
        //     onChanged: (value: { id: string; label: string }) => this.clickTabViewBy(value.id)
        // },
        export: {
            permissions: [],
            useAdvanced: true,
            pageType: ''
        },
        import: {
            permissions: [],
            useAdvanced: true,
            pageType: ''
        }
    };

    // Untuk menangkap status loading dari state.
    isLoading$: Observable<boolean>;

    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();

    constructor(
        private FlexiComboStore: NgRxStore<FlexiComboCoreState>,
        private fuseNavigation$: FuseNavigationService,
        private fuseTranslationLoader$: FuseTranslationLoaderService,
        private router: Router
    ) {
        //Memuat terjemahan.
        // this.fuseTranslationLoader$.loadTranslations(indonesian, english);
        //Memuat breadcrumb.
        this.FlexiComboStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                    },
                    {
                        title: 'Promo'
                    },
                    {
                        title: 'Flexi Combo',
                        active: true,
                        keepCase: true
                    }
                ]
            })
        );
    }

    ngOnInit(): void {
        // this.buttonViewByActive$ = this.SkuAssignmentsStore.select(
        //     UiSelectors.getCustomToolbarActive
        // );
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/promos/flexi-combo/new');
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        // this.SkuAssignmentsStore.dispatch(UiActions.hideCustomToolbar());
        // this.SkuAssignmentsStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.fuseNavigation$.unregister('customNavigation');
    }
}

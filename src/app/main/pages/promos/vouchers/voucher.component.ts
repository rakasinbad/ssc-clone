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

import { FeatureState as PeriodTargetPromoCoreState } from './store/reducers';

@Component({
    selector: 'voucher',
    templateUrl: './voucher.component.html',
    styleUrls: ['./voucher.component.scss'],
    animations: fuseAnimations,
})
export class VoucherComponent implements OnInit, OnDestroy {
    // Untuk penanda tab mana yang sedang aktif.
    section: 'all' | 'active' | 'inactive' = 'all';

    // tslint:disable-next-line: no-inferrable-types
    search: string = '';
    //
    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Voucher',
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search = value;
            },
        },
        add: {
            permissions: [],
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
            pageType: '',
        },
        import: {
            permissions: [],
            useAdvanced: true,
            pageType: '',
        },
    };

    // Untuk menangkap status loading dari state.
    isLoading$: Observable<boolean>;

    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();

    constructor(
        private PeriodTargetPromoStore: NgRxStore<PeriodTargetPromoCoreState>,
        private fuseNavigation$: FuseNavigationService,
        // private fuseTranslationLoader$: FuseTranslationLoaderService,
        private router: Router
    ) {
        // Memuat terjemahan.
        // this.fuseTranslationLoader$.loadTranslations(indonesian, english);
        // Memuat breadcrumb.
        this.PeriodTargetPromoStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Promo',
                    },
                    {
                        title: 'Supplier Voucher',
                        active: true,
                        keepCase: true,
                    },
                ],
            })
        );
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/promos/voucher/new');
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0:
                this.section = 'all';
                break;
            case 1:
                this.section = 'active';
                break;
            case 2:
                this.section = 'inactive';
                break;
        }
    }

    ngOnInit(): void {
        // this.buttonViewByActive$ = this.SkuAssignmentsStore.select(
        //     UiSelectors.getCustomToolbarActive
        // );
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        // this.SkuAssignmentsStore.dispatch(UiActions.hideCustomToolbar());
        // this.SkuAssignmentsStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.fuseNavigation$.unregister('customNavigation');
    }
}

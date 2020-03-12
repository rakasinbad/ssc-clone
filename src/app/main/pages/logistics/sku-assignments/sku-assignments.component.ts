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

import { locale as english } from './i18n/en';

import { locale as indonesian } from './i18n/id';

import { FeatureState as SkuAssignmentCoreState } from './store/reducers';
import { SkuAssignmentsSkuActions, SkuAssignmentsWarehouseActions } from './store/actions';

@Component({
    selector: 'sku-assignments',
    templateUrl: './sku-assignments.component.html',
    styleUrls: ['./sku-assignments.component.scss'],
    animations: fuseAnimations
})
export class SkuAssignmentsComponent implements OnInit, OnDestroy {
    // Untuk menyimpan jumlah baris dalama 1 halaman tabel.
    readonly defaultPageSize = environment.pageSize;
    // Untuk menyimpan opsi jumlah baris dalam 1 halaman tabel.
    readonly defaultPageOpts = environment.pageSizeTable;

    buttonViewByActive$: Observable<string>;
    // tslint:disable-next-line: no-inferrable-types
    selectedViewBy: string = 'sku-assignment-warehouse';

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'SKU Assignment'
        },
        search: {
            active: true,
            changed: (value: string) => {
                switch (this.selectedViewBy) {
                    case 'sku-assignment-warehouse':
                        this.SkuAssignmentsStore.dispatch(
                            SkuAssignmentsWarehouseActions.setSearchValue({
                                payload: value
                            })
                        );
                        break;
                    case 'sku-assignment-sku':
                        this.SkuAssignmentsStore.dispatch(
                            SkuAssignmentsSkuActions.setSearchValue({
                                payload: value
                            })
                        );
                        break;
        
                    default:
                        return;
                }
            }
        },
        add: {
            permissions: []
        },
        viewBy: {
            list: [
                { id: 'sku-assignment-warehouse', label: 'Warehouse' },
                { id: 'sku-assignment-sku', label: 'SKU' }
            ],
            onChanged: (value: { id: string; label: string }) => this.clickTabViewBy(value.id)
        },
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

    // Untuk menyimpan kolom default.
    initialDisplayedColumns: Array<string> = [
        // 'checkbox',
        'name',
        'email',
        'actions'
    ];

    // Untuk menangkap status loading dari state.
    isLoading$: Observable<boolean>;

    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan kolom-kolom yang ingin ditampilkan pada tabel.
    displayedColumns = this.initialDisplayedColumns;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private SkuAssignmentsStore: NgRxStore<SkuAssignmentCoreState>,
        private fuseNavigation$: FuseNavigationService,
        private fuseTranslationLoader$: FuseTranslationLoaderService,
        private router: Router
    ) {
        // Memuat terjemahan.
        this.fuseTranslationLoader$.loadTranslations(indonesian, english);

        // Memuat breadcrumb.
        this.SkuAssignmentsStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                    },
                    {
                        title: 'Warehouse'
                    },
                    {
                        title: 'SKU Assignment',
                        active: true,
                        keepCase: true,
                    }
                ]
            })
        );
    }

    ngOnInit(): void {
        this.buttonViewByActive$ = this.SkuAssignmentsStore.select(
            UiSelectors.getCustomToolbarActive
        );
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/logistics/sku-assignments/new');
    }

    clickTabViewBy(action: string): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'sku-assignment-warehouse':
                this.selectedViewBy = action;

                this.SkuAssignmentsStore.dispatch(
                    UiActions.setCustomToolbarActive({ payload: 'sku-assignment-warehouse' })
                );
                break;
            case 'sku-assignment-sku':
                this.selectedViewBy = action;

                this.SkuAssignmentsStore.dispatch(
                    UiActions.setCustomToolbarActive({ payload: 'sku-assignment-sku' })
                );
                break;

            default:
                return;
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.SkuAssignmentsStore.dispatch(UiActions.hideCustomToolbar());
        this.SkuAssignmentsStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.fuseNavigation$.unregister('customNavigation');
    }
}

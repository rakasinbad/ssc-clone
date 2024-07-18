import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { fromInternal } from '../store/reducers';
import { InternalActions, TeritoryActions } from '../store/actions';
import { InternalSelectors, TeritorySelectors } from '../store/selectors';
import { Branch, BranchWarehouse } from 'app/shared/models/branch.model';
import { MetaV2 } from 'app/shared/models/global.model';
import { Region } from 'app/shared/models';
import { WHDialogService } from '../services';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'dialog-warehouse',
    templateUrl: './dialog-warehouse.component.html',
    styleUrls: ['./dialog-warehouse.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogWarehouseComponent implements OnInit, OnDestroy {
    private subs$: Subject<void> = new Subject<void>();
    loading$: Observable<boolean>;
    displayedColumns: string[] = ['id', 'name'];
    displayedColumnBranch: string[] = ['id', 'name', 'regionName'];
    displayedColumnWarehouse: string[] = ['id', 'warehouseName', 'branch'];
    dataSource = new MatTableDataSource<Region>([]);
    dataSourceBranch = new MatTableDataSource<Branch>([]);
    dataSourceWarehouse = new MatTableDataSource<BranchWarehouse>([]);
    paginateWarehouse: MetaV2 = { page: 1, perPage: 10, total: 0 };
    paginateBranch: MetaV2 = { page: 1, perPage: 10, total: 0 };
    paginateRegion: MetaV2 = { page: 1, perPage: 10, total: 0 };
    selectedRegion: number[] = [];
    selectedRegion$: Subscription;
    selectedBranch: number[] = [];
    selectedBranch$: Subscription;
    selectedWarehouse: BranchWarehouse[] = [];
    selectedWarehouse$: Subscription;
    listSelectRegion = ['Region', 'Branch', 'Warehouse'];
    activeSelectRegion = 'Region';
    pageSize = 10;
    isEdit: boolean;
    pageType: string;
    constructor(
        private store: Store<fromInternal.FeatureState>,
        private route: ActivatedRoute,
        private router: Router,
        private _$whDialog: WHDialogService,
    ) {
        const { type } = this.route.snapshot.data;

        if (type === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }
    }
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChildren('inputSearch') inputSearch: QueryList<ElementRef<HTMLInputElement>>;

    ngOnInit(): void {
        const { type } = this.route.snapshot.data;
        this.isEdit = false;

        if (type === 'edit') {
            this.isEdit = true;
        }
        // this._initPage();
        // this.dataSource.paginator = this.paginator;

        this.store.dispatch(
            TeritoryActions.fetchTeritoryRegionRequest({
                payload: { page: 1, perPage: this.pageSize },
            })
        );

        // subs
        this.store.select(TeritorySelectors.getAllRegionsTeritory).subscribe((data) => {
            this.dataSource.data = data;
        });
        this.store.select(TeritorySelectors.getAllBranchesTeritory).subscribe((data) => {
            this.dataSourceBranch.data = data;
        });
        this.store.select(TeritorySelectors.getAllWarehousesTeritory).subscribe((data) => {
            this.dataSourceWarehouse.data = data;
        });

        this.loading$ = this.store.pipe(select(TeritorySelectors.getTeritoryIsLoading));

        this.store.select(TeritorySelectors.getRegionsPaginateTeritory).subscribe((data) => {
            this.paginateRegion = data;
        });
        this.store.select(TeritorySelectors.getBranchesPaginateTeritory).subscribe((data) => {
            this.paginateBranch = data;
        });
        this.store.select(TeritorySelectors.getWarehousesPaginateTeritory).subscribe((data) => {
            this.paginateWarehouse = data;
        });

        if (this.pageType === 'edit') {
            this.selectedRegion$ = this._$whDialog.currentSelectedRegions.subscribe((csr) => this.selectedRegion = csr);
            this.selectedBranch$ = this._$whDialog.currentSelectedBranches.subscribe((csb) => this.selectedBranch = csb);
            this.selectedWarehouse$ = this._$whDialog.currentSelectedWarehouses.subscribe((csw) => this.selectedWarehouse = csw);
            // this.store.select(InternalSelectors.getSelectedInternalRegionIds).subscribe((data) => {
            //     this.selectedRegion = data.map(d => Number(d));
            // });

            // this.store.select(InternalSelectors.getSelectedInternalBranchIds).subscribe((data) => {
            //     this.selectedBranch = data.map(d => Number(d));
            // });
            
            // this.store.select(InternalSelectors.getSelectedInternalWarehouses).subscribe((data) => {
            //     this.selectedWarehouse = data;
            // });
        }
    }

    ngOnDestroy(): void {
        this._initPage(LifecyclePlatform.OnDestroy);
        this.selectedRegion$.unsubscribe();
        this.selectedBranch$.unsubscribe();
        this.selectedWarehouse$.unsubscribe();
    }

    ngAfterViewInit(): void {
        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                break;

            case LifecyclePlatform.OnDestroy:
                this.subs$.next();
                this.subs$.complete();
                break;

            default:
                break;
        }
    }

    applySearch(event: Event) {
        const search = (event.target as HTMLInputElement).value;

        if (this.activeSelectRegion == 'Region') {
            this.paginator.firstPage();
            this.store.dispatch(
                TeritoryActions.fetchTeritoryRegionRequest({
                    payload: {
                        perPage: this.pageSize,
                        search: [{ fieldName: 'search', keyword: search }],
                    },
                })
            );
        }

        if (this.activeSelectRegion == 'Branch') {
            this.paginator.firstPage();
            this.store.dispatch(
                TeritoryActions.fetchTeritoryBranchesRequest({
                    payload: {
                        regionIds: this.selectedRegion,
                        perPage: this.pageSize,
                        search: [{ fieldName: 'search', keyword: search }],
                    },
                })
            );
        }

        if (this.activeSelectRegion == 'Warehouse') {
            if (this.selectedBranch.length) {
                this.paginator.firstPage();
                this.store.dispatch(
                    TeritoryActions.fetchTeritoryWarehousesRequest({
                        payload: {
                            branchIds: this.selectedBranch,
                            perPage: this.pageSize,
                            search: [{ fieldName: 'search', keyword: search }],
                        },
                    })
                );
            }
        }
    }

    selectTypeRegion(val: string) {
        if (val !== this.activeSelectRegion) {
            this.inputSearch.first.nativeElement.value = '';
            this.paginator.firstPage();
            this.activeSelectRegion = val;
            if (val == 'Region') {
            }
            if (val == 'Branch') {
                if (this.pageType === 'new') {
                    this.selectedBranch = [];
                }
                
                if (this.selectedRegion.length) {
                    this.store.dispatch(
                        TeritoryActions.fetchTeritoryBranchesRequest({
                            payload: { regionIds: this.selectedRegion },
                        })
                    );
                }
            }
            if (val == 'Warehouse') {
                if (this.pageType === 'new') {
                    this.selectedWarehouse = [];
                }
                
                if (this.selectedBranch.length) {
                    this.store.dispatch(
                        TeritoryActions.fetchTeritoryWarehousesRequest({
                            payload: {
                                branchIds: this.selectedBranch,
                                perPage: this.pageSize,
                            },
                        })
                    );
                }
            }
        }
    }

    handleCheckbox(status: boolean, row: Region | Branch | BranchWarehouse) {
        if (this.activeSelectRegion == 'Region') {
            if (status) {
                this.selectedRegion.push(row.id);
            } else {
                this.selectedRegion = this.selectedRegion.filter((item) => item !== row.id);
                this.selectedBranch = [];
                this.selectedWarehouse = [];
            }
        }

        if (this.activeSelectRegion == 'Warehouse') {
            const warehouse = row as BranchWarehouse;
            const isExist = this.selectedWarehouse.some((i) => i.id == warehouse.id);
            if (isExist) {
                this.selectedWarehouse = this.selectedWarehouse.filter((i) => warehouse.id != i.id);
            } else {
                this.selectedWarehouse.push(warehouse);
            }
        }
        if (this.activeSelectRegion == 'Branch') {
            const indexToRemove = this.selectedBranch.indexOf(row.id);
            if (indexToRemove !== -1) {
                this.selectedBranch.splice(indexToRemove, 1);
                this.selectedWarehouse = [];
            } else {
                this.selectedBranch.push(row.id);
            }
        }
    }

    isWarehouseChecked(id: number): boolean {
        return this.selectedWarehouse.some((i) => i.id == id);
    }

    isBranchChecked(id: number): boolean {
        return this.selectedBranch.some((i) => i == id);
    }

    isRegionChecked(id: number) {
        return this.selectedRegion.includes(id);
    }

    handlePaginate(e: PageEvent) {
        const search = this.inputSearch.first.nativeElement.value;
        this.pageSize = e.pageSize;
        if (this.activeSelectRegion == 'Region') {
            this.store.dispatch(
                TeritoryActions.fetchTeritoryRegionRequest({
                    payload: {
                        perPage: this.pageSize,
                        page: e.pageIndex + 1,
                        search: [{ fieldName: 'search', keyword: search }],
                    },
                })
            );
        }
        if (this.activeSelectRegion == 'Branch') {
            this.store.dispatch(
                TeritoryActions.fetchTeritoryBranchesRequest({
                    payload: {
                        regionIds: this.selectedRegion,
                        perPage: this.pageSize,
                        page: e.pageIndex + 1,
                        search: [{ fieldName: 'search', keyword: search }],
                    },
                })
            );
        }
        if (this.activeSelectRegion == 'Warehouse') {
            this.store.dispatch(
                TeritoryActions.fetchTeritoryWarehousesRequest({
                    payload: {
                        branchIds: this.selectedBranch,
                        perPage: this.pageSize,
                        page: e.pageIndex + 1,
                        search: [{ fieldName: 'search', keyword: search }],
                    },
                })
            );
        }
    }

    lengthPaginator(): number {
        if (this.activeSelectRegion == 'Region') return this.paginateRegion.total;
        if (this.activeSelectRegion == 'Branch') return this.paginateBranch.total;
        if (this.activeSelectRegion == 'Warehouse') return this.paginateWarehouse.total;
    }

    isCheckedAll(): boolean {
        if (this.activeSelectRegion == 'Region') {
            if (!Boolean(this.dataSource.data.length)) return false;

            const matchingItems = this.dataSource.data.filter((item) =>
                this.selectedRegion.includes(item.id)
            );

            return matchingItems.length === this.dataSource.data.length;
        }
        if (this.activeSelectRegion == 'Branch') {
            if (!Boolean(this.dataSourceBranch.data.length)) return false;

            const matchingItems = this.dataSourceBranch.data.filter((item) =>
                this.selectedBranch.includes(item.id)
            );
            return matchingItems.length === this.dataSourceBranch.data.length;
        }
        if (this.activeSelectRegion == 'Warehouse') {
            if (!Boolean(this.dataSourceWarehouse.data.length)) return false;

            const matchingItems = this.dataSourceWarehouse.data.filter((i) =>
                this.selectedWarehouse.some((j) => j.id == i.id)
            );
            return matchingItems.length === this.dataSourceWarehouse.data.length;
        }
        return false;
    }

    handleSelectAll(status: boolean) {
        if (this.activeSelectRegion == 'Region') {
            if (this.isCheckedAll()) {
                const currentPageData = this.dataSource.data.map((item) => item.id);
                this.selectedRegion = this.selectedRegion.filter(
                    (item) => !currentPageData.includes(item)
                );
                this.selectedBranch = [];
                this.selectedWarehouse = [];
            } else {
                this.dataSource.data.map((item) => {
                    if (!this.selectedRegion.includes(item.id)) {
                        this.selectedRegion.push(item.id);
                    }
                });
            }
            return void 0;
        }
        if (this.activeSelectRegion == 'Branch') {
            if (this.isCheckedAll()) {
                this.selectedBranch = [];
                this.selectedWarehouse = [];
            } else {
                this.selectedBranch = this.dataSourceBranch.data.map((i) => i.id);
                
            }
            return void 0;
        }
        if (this.activeSelectRegion == 'Warehouse') {
            if (this.isCheckedAll()) {
                this.selectedWarehouse = [];
            } else {
                this.selectedWarehouse = this.dataSourceWarehouse.data;
            }
            return void 0;
        }
    }

    handleCancel() {
        this._$whDialog.currentSelectedRegions.subscribe(csr => this.selectedRegion = csr);
        this._$whDialog.currentSelectedBranches.subscribe(csb => this.selectedBranch = csb);
        this._$whDialog.currentSelectedWarehouses.subscribe(csw => this.selectedWarehouse = csw);
    }

    handleSaveSelectedWarehouseData(): void {
        this._$whDialog.changeRegions(this.selectedRegion);
        this._$whDialog.changeBranches(this.selectedBranch);
        this._$whDialog.changeWarehouses(this.selectedWarehouse);
        this.store.dispatch(
            TeritoryActions.saveSelectedWarehouse({ payload: this.selectedWarehouse })
        );
    }
}

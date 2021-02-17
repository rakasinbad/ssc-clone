import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    Input,
    SimpleChanges,
    OnChanges,
    ChangeDetectorRef
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';
import { PromoHierarchyActions } from '../../store/actions';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil, flatMap, filter } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { FeatureState as PromoHierarchyCoreState } from '../../store/reducers';
import { IQueryParamsVoucher } from 'app/shared/models/query.model';
// import { LifecyclePlatform } from 'app/shared/models/global.model';
import { PromoHierarchy } from '../../models';
import { PromoHierarchySelectors } from '../../store/selectors';
import { HelperService } from 'app/shared/helpers';

const listHierarchy = [
        {
            "id": "332",
            "name": "Promo 332",
            "supplierId": "1",
            "status": "inactive", 
            "promoAllocation": "promo_slot",
            "promoSlot": 3, 
            "planSlot": 5, 
            "promoBudget": null, 
            "planBudget": null,
            "promoSellerId": "A002",
            "promoType": "flexi",
            "promoGroup": "none",
            "layer": 0
        },
        {
            "id": "338",
            "name": "Promo 338",
            "supplierId": "1",
            "status": "inactive", 
            "promoAllocation": "promo_slot",
            "promoSlot": 2, 
            "planSlot": 2, 
            "promoBudget": null, 
            "planBudget": null,
            "promoSellerId": "A008",
            "promoType": "flexi",
            "promoGroup": "distributor",
            "layer": 3
        },
        {
            "id": "333",
            "name": "Promo 333",
            "supplierId": "1",
            "status": "active", 
            "promoAllocation": "promo_budget",
            "promoSlot": null, 
            "planSlot": null, 
            "promoBudget": 15000,
            "planBudget": 1200000,
            "promoSellerId": "A003",
            "promoType": "crossSelling",
            "promoGroup": "principle",
            "layer": 0
        },
        {
            "id": "333",
            "name": "Promo 334",
            "supplierId": "1",
            "status": "active", 
            "promoAllocation": "promo_budget",
            "promoSlot": null, 
            "planSlot": null, 
            "promoBudget": 150000,
            "planBudget": 1200000,
            "promoSellerId": "A004",
            "promoType": "crossSelling",
            "promoGroup": "sinbad_promo",
            "layer": 3
        },
        {
            "id": "335",
            "name": "Promo 335",
            "supplierId": "1",
            "status": "inactive",
            "promoAllocation": "none",
            "promoSlot": null, 
            "planSlot": null,
            "promoBudget": null,
            "planBudget": null,
            "promoSellerId": "A005",
            "promoType": "voucher",
            "promoGroup": "none",
            "layer": 0
        },
        {
            "id": "336",
            "name": "Promo 336",
            "supplierId": "1",
            "status": "inactive", 
            "promoAllocation": "none",
            "promoSlot": null, 
            "planSlot": null, 
            "promoBudget": null, 
            "planBudget": null,
            "promoSellerId": "A006",
            "promoType": "flexi",
            "promoGroup": "payment_promo",
            "layer": 2
        },
        {
            "id": "337",
            "name": "Promo 337",
            "supplierId": "1",
            "status": "inactive",
            "promoAllocation": "none",
            "promoSlot": null, 
            "planSlot": null,
            "promoBudget": null,
            "planBudget": null,
            "promoSellerId": "A007",
            "promoType": "voucher",
            "promoGroup": "none",
            "layer": 2
        },
];

type PromoHierarchyType = 'layer0' | 'layer1' | 'layer2' | 'layer3' | 'layer4';

@Component({
  selector: 'app-list-promo-hierarchy',
  templateUrl: './list-promo-hierarchy.component.html',
  styleUrls: ['./list-promo-hierarchy.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ListPromoHierarchyComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @Input() selectedStatus: PromoHierarchyType = 'layer0';
    // tslint:disable-next-line: no-inferrable-types
    @Input() searchValue: string = '';
    @Input() viewByPromo: string = '';

    search: FormControl = new FormControl();

    displayedColumns = [
        'promo-seller-id',
        'promo-name',
        'promo-allocation',
        'allocation-value',
        'promo-type',
        'promo-group',
        'status',
        'actions',
    ];

    selection: SelectionModel<PromoHierarchy>;
    dataSource = [];
    totalDataSource: number;
    // dataSource$: Observable<Array<PromoHierarchy>>;
    totalDataSource$: Observable<number>;
    // isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private subs$: Subject<void> = new Subject<void>();

    constructor(
        // private route: ActivatedRoute,
        // private readonly sanitizer: DomSanitizer,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private ngxPermissionsService: NgxPermissionsService,
        private PromoHierarchyStore: NgRxStore<PromoHierarchyCoreState>
    ) {}

    ngOnInit(): void {
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<PromoHierarchy>(true, []);
        // this.dataSource$ = this.PromoHierarchyStore.select(PromoHierarchySelectors.getAllPromoHierarchy).pipe(
        //     takeUntil(this.subs$)
        // );
        // this.totalDataSource$ = this.PromoHierarchyStore.select(PromoHierarchySelectors.getTotalItem);

        // this.isLoading$ = this.PromoHierarchyStore.select(PromoHierarchySelectors.getLoadingState).pipe(
        //     takeUntil(this.subs$)
        // );

        this._initTable();

        this.cdRef.detectChanges();

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['searchValue']) {
            if (!changes['searchValue'].isFirstChange()) {
                this.search.setValue(changes['searchValue'].currentValue);
                setTimeout(() => this._initTable());
            }
        }

        if (changes['selectedStatus']) {
            if (!changes['selectedStatus'].isFirstChange()) {
                this.selectedStatus = changes['selectedStatus'].currentValue;
                setTimeout(() => this._initTable());
            }
        }
   
        if (changes['viewByPromo']) {
            if (!changes['viewByPromo'].isFirstChange()) {
                this.viewByPromo = changes['viewByPromo'].currentValue;
                setTimeout(() => this._initTable());
            }
        }

        this.cdRef.detectChanges();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.sort.sortChange
            .pipe(takeUntil(this.subs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this.subs$))
            .subscribe(() => {
                this._initTable();
            });

        // this.PromoHierarchyStore.select(PromoHierarchySelectors.getRefreshStatus)
        //     .pipe(takeUntil(this.subs$))
        //     .subscribe((needRefresh) => {
        //         if (needRefresh) {
        //             this._initTable();
        //         }

        //         this.PromoHierarchyStore.dispatch(PromoHierarchyActions.setRefreshStatus({ payload: false }));
        //     });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data: IQueryParamsVoucher = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex
        };

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        }
        // this.table.nativeElement.scrollTop = 0;
    }

    settingPromoHierarchy(value) {
        console.log('isi value setting->', value)
    }

    openDetailPage(promoId: string): void {
        this.router.navigate([`/pages/promos/promo-hierarchy/view/${promoId}`]);
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        HelperService.debug('IS ALL SELECTED', { numSelected, numRows });

        return numSelected === numRows;
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParamsVoucher = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            if (this.sort.direction) {
                if (this.sort.active === 'total-order-value') {
                    data['totalOrderValue'] = this.sort.direction === 'desc' ? 'DESC' : 'ASC';
                } else if (this.sort.active === 'collected') {
                    data['collected'] = this.sort.direction === 'desc' ? 'DESC' : 'ASC';
                }  else if (this.sort.active === 'used') {
                    data['used'] = this.sort.direction === 'desc' ? 'DESC' : 'ASC';
                } 
                
            } 

            data['paginate'] = true;
            data['keyword'] = this.search.value;

            if (this.searchValue !== '') {
                switch(this.viewByPromo) {
                    case 'all':
                        switch(this.selectedStatus) {
                            case 'layer0':
                                this.dataSource = listHierarchy.filter(d => d.layer == 0 && d.name == this.searchValue);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer1':
                                this.dataSource = listHierarchy.filter(d => d.layer == 1 && d.name == this.searchValue);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer2':
                                this.dataSource = listHierarchy.filter(d => d.layer == 2 && d.name == this.searchValue);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer3':
                                this.dataSource = listHierarchy.filter(d => d.layer == 3 && d.name == this.searchValue);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer4':
                                this.dataSource = listHierarchy.filter(d => d.layer == 4 && d.name == this.searchValue);
                                this.totalDataSource = this.dataSource.length;
                            break;
                        }
                    break;
                case 'flexi':
                        let dataFlexi = listHierarchy.filter(d => d.promoType == 'flexi' && d.name == this.searchValue);
                        switch(this.selectedStatus) {
                            case 'layer0':
                                this.dataSource = dataFlexi.filter(d => d.layer == 0);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer1':
                                this.dataSource = dataFlexi.filter(d => d.layer == 1);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer2':
                                this.dataSource = dataFlexi.filter(d => d.layer == 2);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer3':
                                this.dataSource = dataFlexi.filter(d => d.layer == 3);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer4':
                                this.dataSource = dataFlexi.filter(d => d.layer == 4);
                                this.totalDataSource = this.dataSource.length;
                            break;
                        };
                    break;
                case 'crossSelling':
                    let dataCrossSelling = listHierarchy.filter(d => d.promoType == 'crossSelling' && d.name == this.searchValue);
                    switch(this.selectedStatus) {
                        case 'layer0':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 0);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer1':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 1);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer2':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 2);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer3':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 3);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer4':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 4);
                            this.totalDataSource = this.dataSource.length;
                        break;
                    };
                    break;
                case 'voucher':
                    let dataVoucher = listHierarchy.filter(d => d.promoType == 'voucher' && d.name == this.searchValue);
                    switch(this.selectedStatus) {
                        case 'layer0':
                            this.dataSource = dataVoucher.filter(d => d.layer == 0);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer1':
                            this.dataSource = dataVoucher.filter(d => d.layer == 1);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer2':
                            this.dataSource = dataVoucher.filter(d => d.layer == 2);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer3':
                            this.dataSource = dataVoucher.filter(d => d.layer == 3);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer4':
                            this.dataSource = dataVoucher.filter(d => d.layer == 4);
                            this.totalDataSource = this.dataSource.length;
                        break;
                    };
                    break;
        
                default:
                    switch(this.selectedStatus) {
                        case 'layer0':
                            this.dataSource = listHierarchy.filter(d => d.layer == 0 && d.name == this.searchValue);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer1':
                            this.dataSource = listHierarchy.filter(d => d.layer == 1 && d.name == this.searchValue);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer2':
                            this.dataSource = listHierarchy.filter(d => d.layer == 2 && d.name == this.searchValue);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer3':
                            this.dataSource = listHierarchy.filter(d => d.layer == 3 && d.name == this.searchValue);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer4':
                            this.dataSource = listHierarchy.filter(d => d.layer == 4 && d.name == this.searchValue);
                            this.totalDataSource = this.dataSource.length;
                        break;
                    }
                    return;
                };
            } else {
                switch(this.viewByPromo) {
                    case 'all':
                        switch(this.selectedStatus) {
                            case 'layer0':
                                this.dataSource = listHierarchy.filter(d => d.layer == 0);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer1':
                                this.dataSource = listHierarchy.filter(d => d.layer == 1);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer2':
                                this.dataSource = listHierarchy.filter(d => d.layer == 2);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer3':
                                this.dataSource = listHierarchy.filter(d => d.layer == 3);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer4':
                                this.dataSource = listHierarchy.filter(d => d.layer == 4);
                                this.totalDataSource = this.dataSource.length;
                            break;
                        }
                    break;
                case 'flexi':
                        let dataFlexi = listHierarchy.filter(d => d.promoType == 'flexi');
                        switch(this.selectedStatus) {
                            case 'layer0':
                                this.dataSource = dataFlexi.filter(d => d.layer == 0);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer1':
                                this.dataSource = dataFlexi.filter(d => d.layer == 1);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer2':
                                this.dataSource = dataFlexi.filter(d => d.layer == 2);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer3':
                                this.dataSource = dataFlexi.filter(d => d.layer == 3);
                                this.totalDataSource = this.dataSource.length;
                            break;
                            case 'layer4':
                                this.dataSource = dataFlexi.filter(d => d.layer == 4);
                                this.totalDataSource = this.dataSource.length;
                            break;
                        };
                    break;
                case 'crossSelling':
                    let dataCrossSelling = listHierarchy.filter(d => d.promoType == 'crossSelling');
                    switch(this.selectedStatus) {
                        case 'layer0':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 0);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer1':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 1);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer2':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 2);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer3':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 3);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer4':
                            this.dataSource = dataCrossSelling.filter(d => d.layer == 4);
                            this.totalDataSource = this.dataSource.length;
                        break;
                    };
                    break;
                case 'voucher':
                    let dataVoucher = listHierarchy.filter(d => d.promoType == 'voucher');
                    switch(this.selectedStatus) {
                        case 'layer0':
                            this.dataSource = dataVoucher.filter(d => d.layer == 0);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer1':
                            this.dataSource = dataVoucher.filter(d => d.layer == 1);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer2':
                            this.dataSource = dataVoucher.filter(d => d.layer == 2);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer3':
                            this.dataSource = dataVoucher.filter(d => d.layer == 3);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer4':
                            this.dataSource = dataVoucher.filter(d => d.layer == 4);
                            this.totalDataSource = this.dataSource.length;
                        break;
                    };
                    break;
        
                default:
                    switch(this.selectedStatus) {
                        case 'layer0':
                            this.dataSource = listHierarchy.filter(d => d.layer == 0);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer1':
                            this.dataSource = listHierarchy.filter(d => d.layer == 1);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer2':
                            this.dataSource = listHierarchy.filter(d => d.layer == 2);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer3':
                            this.dataSource = listHierarchy.filter(d => d.layer == 3);
                            this.totalDataSource = this.dataSource.length;
                        break;
                        case 'layer4':
                            this.dataSource = listHierarchy.filter(d => d.layer == 4);
                            this.totalDataSource = this.dataSource.length;
                        break;
                    }
                    return;
                };
            }
            
        this.cdRef.detectChanges();

            // if (this.selectedStatus !== 'all') {
            //     data['status'] = this.selectedStatus;
            // }

            // this.PromoHierarchyStore.dispatch(PromoHierarchyActions.resetPromoHierarchy());
            // this.PromoHierarchyStore.dispatch(
            //     PromoHierarchyActions.fetchPromoHierarchyRequest({
            //         payload: data,
            //     })
            // );
        }
    }

}


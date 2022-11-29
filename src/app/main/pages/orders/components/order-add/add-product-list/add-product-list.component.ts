import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
    OnDestroy,
    Input,
    SimpleChanges,
    OnChanges,
    ChangeDetectorRef,
    AfterViewInit,
    Output,
    EventEmitter,
    SecurityContext,
    Inject,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { environment } from 'environments/environment';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Observable, Subject, merge } from 'rxjs';
import { IQueryParams } from 'app/shared/models/query.model';
import { DomSanitizer } from '@angular/platform-browser';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { takeUntil } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { ProductList } from '../../../models';
import { MatStepper } from '@angular/material/stepper';
import { Store as NgRxStore } from '@ngrx/store';
import { FeatureStateAddProduct as ProductListCoreFeatureState } from '../../../store/reducers/add-product.reducer';
import { ProductListActions } from '../../../store/actions';
import { ProductListSelectors } from '../../../store/selectors';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderHelperService } from '../../../services';
import { assetUrl } from 'single-spa/asset-url';

@Component({
    selector: 'app-add-product-list',
    templateUrl: './add-product-list.component.html',
    styleUrls: ['./add-product-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class AddProductListComponent implements OnInit, AfterViewInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatStepper, { static: true }) private stepper: MatStepper;
    @Output() counterChange = new EventEmitter<number>();

    public labelNoRecord = 'No Record found';
    public status: string;
    public buttonRejectDisabled: boolean;
    private _unSubs$: Subject<void> = new Subject<void>();

    dataSource$: Observable<Array<ProductList>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    selectedRowIndex$: Observable<number>;

    setDataProduct: ProductList = null;
    selection: SelectionModel<ProductList>;
    dataSource = [];
    highlightRow: Number;
    currentStepIdx: number = 0;
    isOptional: boolean = false;
    totalRp: number = 0;
    totalQty: number = 0;
    counterValue: number = 0;
    totalDataSource: number = 0;
    form: FormGroup;
    search: string = '';
    statMaxQty: boolean = false;
    statMinQty: boolean = false;
    addingData: ProductList[];
    statusLabel: boolean = false;
    statusError: string = '';
    stock: number = 0;
    minQty: number = 0;
    maxQty: number = 0;
    multipleQty: number = 0;

    paramStore = {
        date: null,
        storeId: null,
        storeChannelId: null,
        storeClusterId: null,
        storeGroupId: null,
        storeTypeId: null,
    };

    displayedColumnsProductList = [
        'order-sku-id',
        'order-sku-supplier',
        'order-product-name',
        'order-price',
        'order-tax',
        'adv-price',
    ];

    // Assets
    sinbadNoPhoto = assetUrl('images/catalogue/no_photo.png');

    constructor(
        @Inject(MAT_DIALOG_DATA) public dataStore: any,
        private readonly sanitizer: DomSanitizer,
        private fb: FormBuilder,
        private fuseNavigation$: FuseNavigationService,
        private cdRef: ChangeDetectorRef,
        private productListStore: NgRxStore<ProductListCoreFeatureState>,
        private matDialogRef: MatDialogRef<AddProductListComponent>,
        private orderHelperService: OrderHelperService
    ) {
        // Memuat terjemahan.
        // this.fuseTranslationLoader$.loadTranslations(indonesian, english);
    }

    ngOnInit() {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this._initTable();
        this.paginator.pageSize = this.defaultPageSize;
        this.paramStore = this.dataStore.value;
        this.isOptional = false;
        this.initForm();
        this.buttonRejectDisabled = true;
        this.selection = new SelectionModel<ProductList>(true, []);
        this._initPage();
    }

    ngAfterViewInit(): void {
        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.cdRef.detectChanges();
    }

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        }

        this.table.nativeElement.scrollTop = 0;
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable();
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state CrossSellingPromoActions
                this.productListStore.dispatch(ProductListActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.selection = new SelectionModel<any>(true, []);

                this.dataSource$ = this.productListStore
                    .select(ProductListSelectors.selectAll)
                    .pipe(takeUntil(this._unSubs$));

                this.totalDataSource$ = this.productListStore.select(
                    ProductListSelectors.selectTotalItem
                );

                this.isLoading$ = this.productListStore
                    .select(ProductListSelectors.selectIsLoading)
                    .pipe(takeUntil(this._unSubs$));

                this._initTable();

                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            data['paginate'] = true;
            data['keyword'] = this.search;
            // if (data['keyword'] !== null) {
            //     data['skip'] = 0;
            // }

            data['orderDate'] = this.paramStore.date;
            data['storeId'] = this.paramStore.storeId;
            data['storeChannelId'] = this.paramStore.storeChannelId;
            data['storeClusterId'] = this.paramStore.storeClusterId;
            data['storeGroupId'] = this.paramStore.storeGroupId;
            data['storeTypeId'] = this.paramStore.storeTypeId;

            this.productListStore.dispatch(
                ProductListActions.fetchProductListRequest({
                    payload: data,
                })
            );
        }
    }

    onSearch(ev: string) {
        const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, ev);
        this.search = searchValue;
        this._initTable();
    }

    onStepperChange(ev: any) {
        this.currentStepIdx = ev.selectedIndex;
        if (this.currentStepIdx === 0) {
            this.setDataProduct = null;
        }
        this.cdRef.detectChanges();
    }
    onClickBtn(type: string) {
        if (type == 'next') {
            this.stepper.next();
        } else if (type == 'back') {
            this.stepper.previous();
            this.setDataProduct = null;
            this.form.get('qtyValue').setValue(0);
            this.totalQty = 0;
            this.totalRp = 0;
            this.statMaxQty = false;
            this.statMinQty = false;
            this.statusLabel = false;
            this.statusError = '';
            this.minQty = 0;
            this.maxQty = 0;
            this.stock = 0;
            this.multipleQty = 0;
        }
        this.cdRef.detectChanges();
    }

    onClickDetail(data) {
        this.setDataProduct = data;
        this.highlightRow = data.catalogueId;
        //jika unlimitedstoknya true -> nilai stock tidak di baca
        if (this.setDataProduct.isUnlimitedStock === true) {
            if (this.setDataProduct.minQty) {
                this.form.get('qtyValue').setValue(this.setDataProduct.minQty);
                this.totalQty = this.form.get('qtyValue').value;
                this.statMinQty = false;
                this.statMaxQty = false;
                this.statusLabel = false;
                this.statusError = '';
                
                //for handle total
                if (this.setDataProduct.advancePrice) {
                    this.totalRp = this.totalQty * this.setDataProduct.advancePrice;
                } else if (this.setDataProduct.discountPrice) {
                    this.totalRp = this.totalQty * this.setDataProduct.discountPrice;
                } else {
                    this.totalRp = this.totalQty * this.setDataProduct.price;
                }
            }

            //jika unlimited false
        } else {
            //nilai stok dibaca
            if (this.setDataProduct.stock > 0) {
                //jika memiliki minQty
                if (this.setDataProduct.minQty) {
                    this.form.get('qtyValue').setValue(this.setDataProduct.minQty);
                    this.totalQty = this.form.get('qtyValue').value;

                    //jika totalQty == minQty & stok > totalQty
                    // if (
                    //     this.setDataProduct.minQty === this.totalQty &&
                    //     this.setDataProduct.stock > this.totalQty
                    // ) {
                    //     this.statMaxQty = false;
                    //     this.statMinQty = false;

                    //     //jika totalQty == minQty & stok == totalQty
                    // } else if (
                    //     this.setDataProduct.minQty === this.totalQty &&
                    //     this.setDataProduct.stock == this.totalQty
                    // ) {
                    //     this.statMaxQty = false;
                    //     this.statMinQty = false;
                    // } else
                    if (this.setDataProduct.maxQty && this.setDataProduct.stock >= this.totalQty) {
                        if (this.setDataProduct.maxQty < this.totalQty) {
                            this.statusLabel = true;
                            this.statusError = 'maxqty';
                            this.maxQty = this.setDataProduct.maxQty;
                        }
                    } else if (
                        this.setDataProduct.maxQty &&
                        this.setDataProduct.stock < this.totalQty
                    ) {
                        this.statusLabel = true;
                        this.statusError = 'stock';
                        this.stock = this.setDataProduct.stock;
                    }

                    //for handle total
                    if (this.setDataProduct.advancePrice) {
                        this.totalRp = this.totalQty * this.setDataProduct.advancePrice;
                    } else if (this.setDataProduct.discountPrice) {
                        this.totalRp = this.totalQty * this.setDataProduct.discountPrice;
                    } else {
                        this.totalRp = this.totalQty * this.setDataProduct.price;
                    }
                }
                //jika stok 0
            } else {
                this.form.get('qtyValue').setValue(0);
                this.totalQty = this.form.get('qtyValue').value;
                this.statMaxQty = true;
                this.statMinQty = true;
                this.totalRp = 0;
                this.statusLabel = true;
                this.statusError = 'stock';
                this.stock = this.setDataProduct.stock;
            }
        }

        this.setDataProduct = { ...this.setDataProduct, orderQty: Number(this.totalQty),  errorQty: null };

        this.cdRef.detectChanges();
    }

    keyUpQty(event: any) {
        this.totalQty = 0;
        if (Number(event.target.value)) {
            this.totalQty = Number(event.target.value);
        }
        this.form.get('qtyValue').setValue(this.totalQty);

        this.setTotalQty(this.totalQty);
    }

    numberFormat(num) {
        if (num) {
            const number = Math.round(num);
            return 'Rp' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        return '-';
    }

    priceFormat(num) {
        if (num) {
            const number = Math.round(num);
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        return '0';
    }

    initForm() {
        this.form = this.fb.group({
            searchValue: '',
            qtyValue: 0,
        });
    }

    setTotalQty(value: number) {
        this.totalQty = value;
        this.form.get('qtyValue').setValue(this.totalQty);
        this.statusLabel = false;

        //jika status unlimited true (tidak melihat stok)
        if (this.setDataProduct.isUnlimitedStock === true) {
            if (this.totalQty > 0) {
                this.statMinQty = false;
                if (this.setDataProduct.minQty) {
                    if (this.setDataProduct.minQty > this.totalQty) {
                        this.statMaxQty = false;
                        this.statusLabel = true;
                        this.statusError = 'minqty';
                        this.minQty = this.setDataProduct.minQty;
                        return;
                    }
                }

                //jika pny multipleqty & kelipatannya jika dimodulo !== 0 (tidak sesuai kelipatan)
                // Revisi TSEP-1850: multipleQty itu nilai increment, bukan kelipatan, jika minQty itu 1 dan multipleQty itu 3
                //   maka angka yang boleh masuk itu 1, 4, 7, 10, dst.
                if (this.setDataProduct.multipleQty) {
                    if ( ((this.totalQty - this.setDataProduct.minQty) % this.setDataProduct.multipleQty) !== 0) {
                        this.statusLabel = true;
                        this.statusError = 'multiple';
                        this.multipleQty = this.setDataProduct.multipleQty;
                        return;
                    }
                }

                //by max (stok tidak dibaca)
                if (this.setDataProduct.maxQty) {
                    if (this.setDataProduct.maxQty < this.totalQty) {
                        this.statusLabel = true;
                        this.statusError = 'maxqty';
                        this.maxQty = this.setDataProduct.maxQty;
                        return;
                    }
                }
            } else {
                this.totalQty = 0;
                this.totalRp = this.totalQty * 0;
                this.setDataProduct = { ...this.setDataProduct, orderQty: 0 };
                this.statMaxQty = false;
                this.statMinQty = true;
                this.statusLabel = true;
                this.statusError = 'minqty';
                this.minQty = this.setDataProduct.minQty;
                return;
            }
        } else {
            //jika unlimited false maka check by stok
            if (this.setDataProduct.stock > 0) {
                this.statMinQty = false;

                if (this.totalQty === 0) {
                    this.statMinQty = true;
                }

                //min
                if (this.setDataProduct.minQty) {
                    //jika total inputan 0

                    if (this.setDataProduct.minQty > this.totalQty) {
                        this.statMaxQty = false;
                        this.statusLabel = true;
                        this.statusError = 'minqty';
                        this.minQty = this.setDataProduct.minQty;
                        return;
                    }
                }

                //jika pny multipleqty & kelipatannya jika dimodulo !== 0 (tidak sesuai kelipatan)
                // Revisi TSEP-1850: multipleQty itu nilai increment, bukan kelipatan, jika minQty itu 1 dan multipleQty itu 3
                //   maka angka yang boleh masuk itu 1, 4, 7, 10, dst.
                if (this.setDataProduct.multipleQty) {
                    if (((this.totalQty - this.setDataProduct.minQty) % this.setDataProduct.multipleQty) !== 0) {
                        this.statusLabel = true;
                        this.statusError = 'multiple';
                        this.multipleQty = this.setDataProduct.multipleQty;
                        return;
                    }
                }

                //max
                if (this.setDataProduct.stock >= this.totalQty) {
                    if (this.setDataProduct.maxQty) {
                        if (this.setDataProduct.maxQty < this.totalQty) {
                            this.statusLabel = true;
                            this.statusError = 'maxqty';
                            this.maxQty = this.setDataProduct.maxQty;
                            return;
                        }
                    }
                } else if (this.setDataProduct.stock < this.totalQty) {
                    this.statusLabel = true;
                    this.statusError = 'stock';
                    this.stock = this.setDataProduct.stock;
                    return;
                }
            } else {
                //jika stok 0 btn disabled
                this.statusLabel = true;
                this.statMaxQty = true;
                this.statMinQty = true;
                this.totalQty = 0;
                this.form.get('qtyValue').setValue(this.totalQty);
                this.statusLabel = true;
                this.statusError = 'stock';
                this.maxQty = this.setDataProduct.stock;
                return;
            }
        }

        //for handle total
        if (this.setDataProduct.advancePrice) {
            this.totalRp = this.totalQty * this.setDataProduct.advancePrice;
        } else if (this.setDataProduct.discountPrice) {
            this.totalRp = this.totalQty * this.setDataProduct.discountPrice;
        } else {
            this.totalRp = this.totalQty * this.setDataProduct.price;
        }

        //jika total Rp > Rp 100000000000000
        if (this.totalRp > 100000000000000) {
            this.statMaxQty = true;
            this.statMinQty = false;
        }

        this.setDataProduct = { ...this.setDataProduct, orderQty: Number(this.totalQty), errorQty: null };

        this.counterChange.emit(this.totalQty);
    }

    decrement(multiple: number) {
        if (multiple) {
            if (this.totalQty - multiple < 0) {
                this.totalQty = 0;
            } else {
                this.totalQty = this.totalQty - multiple;
            }
        } else {
            this.totalQty--;
        }
        this.setTotalQty(this.totalQty);
    }

    increment(multiple: number) {
        if (multiple) {
            this.totalQty = this.totalQty + multiple;
        } else {
            this.totalQty++;
        }
        this.setTotalQty(this.totalQty);
    }

    validasiOrderQty(product, value: number) {
        let errorQty = null;

        //jika status unlimited true (tidak melihat stok)
        if (product.isUnlimitedStock === true) {
            if (value > 0) {
                if (product.minQty) {
                    if (product.minQty > value) {
                        errorQty = 'minimum Qty '+product.minQty;
                        return {value, errorQty};

                    }
                }

                //jika pny multipleqty & kelipatannya jika dimodulo !== 0 (tidak sesuai kelipatan)
                if (product.multipleQty) {
                    if ((value - product.minQty) % product.multipleQty !== 0) {
                        errorQty = 'please input multiple ' + product.multipleQty;
                        return {value, errorQty};
                    }
                }

                //by max (stok tidak dibaca)
                if (product.maxQty) {
                    if (product.maxQty < value) {
                        errorQty = 'maximum Qty '+ product.maxQty;
                        return {value, errorQty};
                    }
                }
            } else {
                value = 0;
                errorQty = 'minimum Qty '+product.minQty;
                return {value, errorQty};
            }
        } else {
            //jika unlimited false maka check by stok
            if (product.stock > 0) {

                //min
                if (product.minQty) {
                    //jika total inputan 0

                    if (product.minQty > value) {
                        errorQty = 'minimum Qty '+product.minQty;
                        return {value, errorQty};
                    }
                }

                //jika pny multipleqty & kelipatannya jika dimodulo !== 0 (tidak sesuai kelipatan)
                if (product.multipleQty) {
                    if (value % product.multipleQty !== 0) {
                        errorQty = 'please input multiple ' + product.multipleQty;
                        return {value, errorQty};
                    }
                }

                //max
                if (product.stock >= value) {
                    if (product.maxQty) {
                        if (product.maxQty < value) {
                            errorQty = 'maximum Qty '+ product.maxQty;
                            return {value, errorQty};
                        }
                    }
                } else if (product.stock < value) {
                    errorQty = 'out of stock (stock='+ product.stock +')';
                    return {value, errorQty};

                }
            } else {
                value = 0;
                errorQty = 'out of stock (stock='+ product.stock +')';
                return {value, errorQty};

            }
        }

        return {value, errorQty};
    }

    onClickSubmit() {
        //check data product list ada atau tidaknya
        let dataOrder = this.orderHelperService.getOrderDataList();

        if (dataOrder) {
            //jika data order tidak null/kosong

            if (dataOrder.find((item) => item.catalogueId === this.setDataProduct.catalogueId)) {
                dataOrder.map((value) => {
                    if (value.catalogueId === this.setDataProduct.catalogueId) {
                       let newOrderQty =  value.orderQty + this.setDataProduct.orderQty;
                       const {value: qty, errorQty} = this.validasiOrderQty(value, newOrderQty)
                       value.orderQty = qty;
                       value.errorQty = errorQty;
                    }
                });
            } else {
                dataOrder.push(this.setDataProduct);
            }

            this.addingData = dataOrder;
            this.orderHelperService.setOrderDataList(this.addingData);
        } else {
            //set data new order to json string
            let dataProduct = [this.setDataProduct];
            this.addingData = dataProduct;
            this.orderHelperService.setOrderDataList(this.addingData);
        }

        this.matDialogRef.close(this.addingData);
    }

    onPageChange(event: any) {
        this._initTable();
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();

        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this.fuseNavigation$.unregister('customNavigation');

        this._initPage(LifecyclePlatform.OnDestroy);
    }
}

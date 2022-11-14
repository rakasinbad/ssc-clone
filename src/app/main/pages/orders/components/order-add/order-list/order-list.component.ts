import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { AddProductListComponent } from '../add-product-list/add-product-list.component';
import {
    ProductList,
} from '../../../models';
import { MatTableDataSource } from '@angular/material/table';
import { ImportProductsComponent } from '../import-products/import-products.component';
import { MatDialog, MatPaginator } from '@angular/material';
import { OrderHelperService } from '../../../services';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FormStatus } from 'app/shared/models';
import { takeUntil, tap } from 'rxjs/operators';
import { HelperService } from 'app/shared/helpers';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import {debounce} from 'lodash';

export interface IFormStatusChange {
    formStatus: FormStatus;
    totalProducts: number;
}

@Component({
    selector: 'app-order-list',
    templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class OrderListComponent implements OnInit, AfterViewInit {
    public labelNoRecord = 'No data available';
    totalDataSource: number = 0;
    form: FormGroup;
    formList: FormGroup = this.fb.group({ order: this.fb.array([]) });
    private unSubs$: Subject<void> = new Subject<void>();

    isAddProductDisabled = true;
    search: string = '';
    // dataSource: ProductList[];
    dataSource: MatTableDataSource<ProductList>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    displayedColumnsOrderList = [
        'order-sku-id',
        'order-sku-supplier',
        'order-product-name',
        'order-qty',
        'order-uom',
        'order-price',
        'order-tax',
        'order-action',
    ];

    @Output() formStatusChange: EventEmitter<IFormStatusChange> = new EventEmitter<IFormStatusChange>();
    @Input() onChangeFormOrderStoreAndShipment: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();

    constructor(
        private fb: FormBuilder,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private dialog: MatDialog,
        private fuseNavigation$: FuseNavigationService,
        private orderHelperService: OrderHelperService,
    ) {
        this.changeQty = debounce(this.changeQty, 1000);
        
        // Memuat terjemahan.
        // this.fuseTranslationLoader$.loadTranslations(indonesian, english);
    }

    get order(): FormArray {
        return this.formList.get('order') as FormArray;
    }

    ngOnInit() {
        this.initForm();
        const dataOrder = this.orderHelperService.getOrderDataList();
        if (dataOrder) {
            this.dataSource = new MatTableDataSource(dataOrder);
            this.totalDataSource = this.dataSource.data.length;
        } else {
            this.dataSource = new MatTableDataSource();
            this.totalDataSource = 0;
        }

        this.onChangeFormOrderStoreAndShipment.pipe(
            tap((val) => HelperService.debug('[OrderListComponent] ngOnInit - onChangeFormOrderStoreAndShipment - tap', val)),
            takeUntil(this.unSubs$)
        ).subscribe({
            next: (res: FormStatus) => {
                const isOrderListReset = this.orderHelperService.getOrderDataListReset();
                if (isOrderListReset || res !== 'VALID') {
                    this.form.reset();
                    this.formList.reset();
                    this.dataSource = new MatTableDataSource([]);
                    this.totalDataSource = 0;
                }
                const orderStore = this.orderHelperService.getOrderStoreAndShipmentInformation();
                if (res === 'VALID' && orderStore && orderStore.storeId) {
                    this.isAddProductDisabled = false;
                } else {
                    this.isAddProductDisabled = true;
                }
                this.orderHelperService.setOrderDataListReset(false);
                this.checkFormStatus(this.totalDataSource);

                HelperService.debug('[OrderListComponent] ngOnInit - onChangeFormOrderStoreAndShipment - this.totalDataSource', {
                    totalDataSource: this.totalDataSource,
                    orderStore,
                    isOrderListReset
                });
            }
        })

        this.filterTable();
    }

    ngAfterViewInit() {
        this.checkFormStatus(this.totalDataSource);
    }

    // mappingData(data) {}

    numberFormat(num) {
        if (num) {
            const number = Math.round(num);
            return (
                'Rp' +
                number
                .toFixed(0)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
            );
        }

        return '-';
    }

    filterTable() {
        this.dataSource.filterPredicate = (data: ProductList, filter: string): boolean => {
          return (
            data.skuSupplier.toLocaleLowerCase().includes(filter) ||
            data.productName.toLocaleLowerCase().includes(filter) 
          )
        }
      } 

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue;
    }

    keyUpKeyword(event: any) {
        this.form.get('searchValue').setValue(event.target.value);

        if (event.keyCode === 13) {
            this.searchKeyword();
        }
    }

    searchKeyword(): void {
        this.search = this.form.get('searchValue').value;
        this.dataSource.filter = this.search.toLowerCase();
    }

    deleteOrderList(row) {
        const dataOrder = this.orderHelperService.getOrderDataList();
        if (dataOrder) {
            // convert data string to valid object
            this.dataSource.data = dataOrder;

            // remove find data by ID
            const data = this.dataSource.data;
            let filterData = data.filter((item) => item.catalogueId !== row.catalogueId);
            this.dataSource.data = filterData;

            this.totalDataSource = this.dataSource.data.length;
            // this.mappingData(this.dataSource.data);
            this.checkFormStatus(this.totalDataSource);

            this.orderHelperService.setOrderDataList(this.dataSource.data);
        }
        this.cdRef.detectChanges();
    }

    initForm() {
        this.form = this.fb.group({
            searchValue: '',
        });
    }

    changeQty(e, catalogueId) {
        let qty = null;
        if (Number(e.target.value)) {
            qty = Number(e.target.value);
        }
        const dataOrder = this.orderHelperService.getOrderDataList();
        if (dataOrder) {
            const orderProduct = this.dataSource.data.find(product => product.catalogueId === catalogueId);
            const updatedDataOrder = dataOrder.map(product => {
                if (product.catalogueId === catalogueId) {
                    const {value, errorQty} = this.setTotalQty(product, qty);
                   
                    return {
                        ...product,
                        ...orderProduct,
                        orderQty: Number(value),
                        errorQty
                    }
                } else {
                    return product;
                }
            });
            this.dataSource.data = updatedDataOrder;
            this.orderHelperService.setOrderDataList(updatedDataOrder);
            this.checkFormStatus(this.totalDataSource);
        }

        this.cdRef.detectChanges();
    }

    setTotalQty(product, value: number) {
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
                    if (value % product.multipleQty !== 0) {
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

    addProduct() {
        const dataStoreVal = this.orderHelperService.getOrderStoreAndShipmentInformation();
        //for remove value di kolom search
        this.form.get('searchValue').setValue('');

        // default params
        let dataStore = {
            date: this.formatDate(new Date()),
            storeId: null,
            storeChannelId: null,
            storeClusterId: null,
            storeGroupId: null,
            storeTypeId: null,
        };

        //check data ada atau tidak
        if (dataStoreVal) {
            dataStore = {
                date: dataStoreVal.date,
                storeId: dataStoreVal.storeId,
                storeChannelId: dataStoreVal.storeChannelId,
                storeClusterId: dataStoreVal.storeClusterId,
                storeGroupId: dataStoreVal.storeGroupId,
                storeTypeId: dataStoreVal.storeTypeId,
            };
        } else {
            dataStore = {
                date: this.formatDate(new Date()),
                storeId: null,
                storeChannelId: null,
                storeClusterId: null,
                storeGroupId: null,
                storeTypeId: null,
            };
        }

        const dialogRef = this.dialog.open(AddProductListComponent, {
            width: '1140px',
            height: '620px',
            data: { value: dataStore },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result.status === 'cancel') {
                    return;
                } else {
                    this.dataSource = new MatTableDataSource(result);
                    this.totalDataSource = this.dataSource.data.length;
                    // this.mappingData(this.dataSource.data);
                    this.checkFormStatus(this.totalDataSource);

                    this.filterTable();
                    this.cdRef.markForCheck();
                }
            }
        });
    }

    importProduct() {
        //for remove value di kolom search
        this.form.get('searchValue').setValue('');

        const dialogRef = this.dialog.open(ImportProductsComponent, {
            width: '50vw',
        });

        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                if (res.status === 'cancel') {
                    return;
                }
                this.dataSource = new MatTableDataSource();
                this.dataSource.data = res;
                this.totalDataSource = this.dataSource.data.length;
                // this.mappingData(this.dataSource.data);
                this.checkFormStatus(this.totalDataSource);

                this.filterTable();
                this.cdRef.markForCheck();
            }
        });
    }

    formatDate(date) {
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 101).toString().substring(1);
        var day = (date.getDate() + 100).toString().substring(1);
        return day + '-' + month + '-' + year;
    }

    checkFormStatus(totalProducts: number) {
        HelperService.debug('[OrderListComponent] checkFormStatus - totalProducts', totalProducts)
        if (totalProducts > 0) {
            if (this.dataSource.data.find(item => item.errorQty)) {
                this.formStatusChange.emit({
                    formStatus: 'DISABLED',
                    totalProducts
                });
            } else {
                this.formStatusChange.emit({
                    formStatus: 'VALID',
                    totalProducts
                });
            }
        } else {
            this.formStatusChange.emit({
                formStatus: 'DISABLED',
                totalProducts
            });
        }
    }

    ngOnDestroy(): void {
        this.fuseNavigation$.unregister('customNavigation');
    }
}

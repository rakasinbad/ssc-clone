import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { locale as english } from '../../../i18n/en';
import { locale as indonesian } from '../../../i18n/id';

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
    formList: FormGroup;
    search: string = '';

    dataSource = [
        {
            skuId: '1',
            skuSupplier: '123ABC',
            productName: 'test sgm',
            qty: 1,
            uom: 'PCS',
            price: 10000,
            tax: 10,
        },
        {
            skuId: '2',
            skuSupplier: '456ABC',
            productName: 'test sgm2',
            qty: 1,
            uom: 'PCS',
            price: 34000,
            tax: 10,
        },
        {
            skuId: '3',
            skuSupplier: '567 coba',
            productName: 'bango kecap',
            qty: 100,
            uom: 'PCS',
            price: 10000,
            tax: 5,
        },
        {
            skuId: '4',
            skuSupplier: '89 test unilever',
            productName: 'rinso',
            qty: 12,
            uom: 'PCS',
            price: 34000,
            tax: 11,
        },
        {
          skuId: '5',
          skuSupplier: '123ABC',
          productName: 'test sgm',
          qty: 1,
          uom: 'PCS',
          price: 10000,
          tax: 10,
      },
      {
          skuId: '6',
          skuSupplier: '456ABC',
          productName: 'test sgm2',
          qty: 1,
          uom: 'PCS',
          price: 34000,
          tax: 10,
      },
      {
          skuId: '7',
          skuSupplier: '567 coba',
          productName: 'bango kecap',
          qty: 100,
          uom: 'PCS',
          price: 10000,
          tax: 5,
      },
      {
          skuId: '8',
          skuSupplier: '89 test unilever',
          productName: 'rinso',
          qty: 12,
          uom: 'PCS',
          price: 34000,
          tax: null,
      },
    ];
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

    constructor(
        private fb: FormBuilder,
        private fuseNavigation$: FuseNavigationService,
        // private fuseTranslationLoader$: FuseTranslationLoaderService
    ) {
        // Memuat terjemahan.
        // this.fuseTranslationLoader$.loadTranslations(indonesian, english);
    }

    keyUpKeyword(event: any) {
        this.form.get('searchValue').setValue(event.target.value);
        if (event.keyCode === 13) {
            this.searchKeyword();
        }
    }

    searchKeyword(): void {
        this.search = this.form.get('searchValue').value;
    }

    ngOnInit() {
      this.initForm();

        this.totalDataSource = this.dataSource.length;
    }

    ngAfterViewInit() {
        this.mappingData();
    }

    mappingData(){
        for (let i = 0; i < this.dataSource.length; i++) {
            this.formList.setValue(this.dataSource[i]);
        }
        // console.log('this formlist->', this.formList)
    }

    numberFormat(num) {
        if (num) {
            return (
                'Rp' +
                num
                    .toFixed(0)
                    .replace('.', ',')
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
            );
        }

        return '-';
    }

    deleteOrderList(val) {
        console.log('isi delete ->', val);
    }

    initForm() {
        this.form = this.fb.group({
            searchValue: '',
            qty: 0
        });

        this.formList = this.fb.group({
            skuId: '',
            skuSupplier: '',
            productName: '',
            qty: 0,
            uom: '',
            price: 0,
            tax: 0,
        });
    }

    addProduct(){
      
    }

    ngOnDestroy(): void {
        this.fuseNavigation$.unregister('customNavigation');
    }
}

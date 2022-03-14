import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { locale as english } from '../../../i18n/en';
import { locale as indonesian } from '../../../i18n/id';
import { MatDialog } from '@angular/material/dialog';
import { AddProductListComponent } from '../add-product-list/add-product-list.component';

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
            catalogueId: 112001203,
            skuSupplier: '11500032',
            productName: 'test sgm',
            qty: 1,
            uom: 'PCS',
            price: 10000,
            tax: 10,
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
        },
        {
            catalogueId: 11200120323,
            skuSupplier: '11500032SK',
            productName: 'test sgm2',
            qty: 1,
            uom: 'PCS',
            price: 34000,
            tax: 10,
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
        },
        {
            catalogueId: 112001123203,
            skuSupplier: '11500032222',
            productName: 'bango kecap',
            qty: 100,
            uom: 'PCS',
            price: 10000,
            tax: 5,
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
        },
        {
            catalogueId: 11200120312121,
            skuSupplier: '115000dwdw32',
            productName: 'rinso',
            qty: 12,
            uom: 'PCS',
            price: 34000,
            tax: 11,
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
        },
        {
            catalogueId: 112001203222111,
            skuSupplier: '1150003233dddd',
            productName: 'test sgm',
            qty: 1,
            uom: 'PCS',
            price: 10000,
            tax: 10,
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
        },
        {
            catalogueId: 112001203678,
            skuSupplier: '115000332fdf2',
            productName: 'test sgm2',
            qty: 1,
            uom: 'PCS',
            price: 34000,
            tax: 10,
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
        },
        {
            catalogueId: 1120012033464,
            skuSupplier: '11500032ffdg',
            productName: 'bango kecap',
            qty: 100,
            uom: 'PCS',
            price: 10000,
            tax: 5,
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
        },
        {
            catalogueId: 1120012034343,
            skuSupplier: '1150003rrrr2',
            productName: 'rinso',
            qty: 12,
            uom: 'PCS',
            price: 34000,
            tax: null,
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
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
        private dialog: MatDialog // private fuseTranslationLoader$: FuseTranslationLoaderService
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

    mappingData() {
        for (let i = 0; i < this.dataSource.length; i++) {
            this.formList.setValue(this.dataSource[i]);
        }
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
        });

        this.formList = this.fb.group({
            catalogueId: '',
            skuSupplier: '',
            productName: '',
            qty: 0,
            uom: '',
            price: 0,
            tax: 0,
            productImage: '',
        });
    }

    addProduct() {
        const dialogRef = this.dialog.open(AddProductListComponent, {
            width: '1140px',
            height: '620px',
        });
    }

    ngOnDestroy(): void {
        this.fuseNavigation$.unregister('customNavigation');
    }
}

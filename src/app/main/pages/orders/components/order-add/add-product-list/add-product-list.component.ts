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
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { environment } from 'environments/environment';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';

@Component({
    selector: 'app-add-product-list',
    templateUrl: './add-product-list.component.html',
    styleUrls: ['./add-product-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class AddProductListComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    public labelNoRecord = 'No data available';
    totalDataSource: number = 0;
    form: FormGroup;
    formList: FormGroup;
    search: string = '';

    public status: string;
    public buttonRejectDisabled: boolean;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Select Product',
        },
        search: {
            active: true,
        },
    };

    dataSource = [
        {
            catalogueId: 112001203,
            skuSupplier: '11500032',
            productName: 'BONTABUR ',
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
            UOM: 'PCS',
            price: 333,
            discountPrice: 33,
            tax: 10,
            taxType: 'percent',
            advancePrice: 555,
            minQty: 1,
            minQtyType: 'PCS',
            multipleQty: 1,
            multipleQtyType: 'PCS',
            packageQty: 0,
            maxQty: 10,
        },
        {
            catalogueId: 11200120345,
            skuSupplier: '1150003222322',
            productName: 'Revlon Lipstick ',
            productImage:
                'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/prod/catalogue-images/33408/image_1642432599187.png',
            UOM: 'PCS',
            price: 10000,
            discountPrice: 333,
            tax: 11,
            taxType: 'percent',
            advancePrice: null,
            minQty: 1,
            minQtyType: 'PCS',
            multipleQty: 3,
            multipleQtyType: 'PCS',
            packageQty: 0,
            maxQty: 5,
        },
    ];
    displayedColumnsOrderList = [
        'order-sku-id',
        'order-sku-supplier',
        'order-product-name',
        'order-price',
        'order-tax',
        'adv-price',

    ];

    constructor(
        private fb: FormBuilder,
        private fuseNavigation$: FuseNavigationService 
    ) {
        // Memuat terjemahan.
        // this.fuseTranslationLoader$.loadTranslations(indonesian, english);
    }

    ngOnInit() {
        this.initForm();
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this.paginator.pageSize = this.defaultPageSize;
        this.totalDataSource = this.dataSource.length;
        this.status = 'false';
        this.buttonRejectDisabled = true;
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

    initForm() {
        this.formList = this.fb.group({
          catalogueId: 0,
          skuSupplier: '',
          productName: ' ',
          productImage: '',
          UOM: '',
          price: 0,
          discountPrice: 0,
          tax: 0,
          taxType: '',
          advancePrice: 0,
          minQty: 0,
          minQtyType: '',
          multipleQty: 1,
          multipleQtyType: '',
          packageQty: 0,
          maxQty: 0,
        });
    }


    ngOnDestroy(): void {
        this.fuseNavigation$.unregister('customNavigation');
    }
}

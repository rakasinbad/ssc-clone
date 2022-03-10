import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-order-list',
    templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class OrderListComponent implements OnInit {
    public labelNoRecord = 'No data available';
    totalDataSource: number = 0;

    dataSource = [
        {
            skuId: '1',
            skuSupplier: '123ABC',
            productName: 'test sgm',
            qty: 1,
            uom: 'PCS',
            price: 10000,
            tax: '10%',
        },
        {
            skuId: '2',
            skuSupplier: '456ABC',
            productName: 'test sgm2',
            qty: 1,
            uom: 'PCS',
            price: 34000,
            tax: '10%',
        },
        {
          skuId: '3',
          skuSupplier: '567 coba',
          productName: 'bango kecap',
          qty: 100,
          uom: 'PCS',
          price: 10000,
          tax: '5%',
      },
      {
          skuId: '4',
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

    constructor() {}

    ngOnInit() {
        this.totalDataSource = this.dataSource.length;
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
}

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
    ChangeDetectorRef,
    SecurityContext,
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject, merge } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { IQueryParams } from 'app/shared/models/query.model';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil, flatMap, filter } from 'rxjs/operators';

@Component({
    selector: 'app-list-collection',
    templateUrl: './list-collection.component.html',
    styleUrls: ['./list-collection.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ListCollectionComponent implements OnInit {
    @Input() viewByPromo: string = 'cStatus';

    public totalLength: number = 10;
    public size: number = 5;
    public totalDataSource: number;
    public totalDataSourceBilling: number;

    public dataSource = [
        {
            id: 501,
            supplierId: 'GGSTR000000203',
            supplierName: 'Tiga Raksa',
            collectionCode: 'C00201202108000018',
            collectionMethodName: 'Tunai',
            referenceCode: '',
            totalAmount: 800000,
            createdAt: '2021-08-12 13:46:56',
            invalidDate: null,
            approvalStatus: 'approved',
            salesmanName: 'Test Owner1',
            storeExternalId: '101001010',
            storeName: 'Test Owner Store',
            orderCode: ['SNB0010100011', 'SNB0010100012', 'SNB0010100013'],
            orderRef: ['A0010100011', 'A0010100022', 'A0010100033'],
            reason: null,
        },
        {
            id: 502,
            supplierId: 'GGSTR000000203',
            supplierName: 'Tiga Raksa',
            collectionCode: 'C00201202108000018',
            collectionMethodName: 'Tunai',
            referenceCode: '',
            totalAmount: 800000,
            createdAt: '2021-08-12 13:46:56',
            invalidDate: null,
            approvalStatus: 'approved',
            salesmanName: 'Test Owner2',
            storeExternalId: '101001010',
            storeName: 'Test Owner Store',
            orderCode: ['SNB0010100011', 'SNB0010100012', 'SNB0010100013'],
            orderRef: ['A0010100011', 'A0010100022', 'A0010100033'],
            reason: null,
        },
    ];

    public dataSourceBilling = [
        {
          "id": 25,
          "stampNominal": 3000,
          "reason": "males bayar",
          "paidByCollectionMethod": 5000000,
          "paidAmount": 50003000,
          "billingPaymentCode": "bpdf323233",
          "createdAt": "2021-03-04 02:01:56",
          "approvalStatus": "pending",
          "paymentCollectionMethod:": {
            "id": 232,
            "collectionCode": "csf3232",
            "collectionRef": "csf3232",
            "amount": 50000000,
            "balance": 300000,
            "approvalStatus": "pending",
            "createdAt": "2021-03-04 02:01:56",
            "user": {
              "id": 1,
              "fullName": "ansor"
            },
            "principal": {
              "id": 3,
              "externalId": "10302291"
            },
            "stamp": {
              "id": 2,
              "nominal": 3000
            }
          },
          "billing": {
            "id": 123,
            "orderParcel": {
              "id": 34,
              "orderCode": "snbd42323",
              "orderDueDate": "2021-03-04 02:01:56",
              "paymentStatus": "waiting_for_payment",
              "orderRef": "asfasd",
              "deliveredParcelFinalPriceBuyer": "400000",
              "order": {
                "id": 2,
                "store": {
                  "id": 32,
                  "name": "store123"
                }
              }
            }
          }
        },
        {
            "id": 26,
            "stampNominal": 3000,
            "reason": "males bayar",
            "paidByCollectionMethod": 5000000,
            "paidAmount": 50003000,
            "billingPaymentCode": "bpdf323233",
            "createdAt": "2021-03-04 02:01:56",
            "approvalStatus": "pending",
            "paymentCollectionMethod:": {
              "id": 232,
              "collectionCode": "csf3232",
              "collectionRef": "csf3232",
              "amount": 50000000,
              "balance": 300000,
              "approvalStatus": "pending",
              "createdAt": "2021-03-04 02:01:56",
              "user": {
                "id": 1,
                "fullName": "ansor"
              },
              "principal": {
                "id": 3,
                "externalId": "10302291"
              },
              "stamp": {
                "id": 2,
                "nominal": 3000
              }
            },
            "billing": {
              "id": 123,
              "orderParcel": {
                "id": 34,
                "orderCode": "snbd42323",
                "orderDueDate": "2021-03-04 02:01:56",
                "paymentStatus": "waiting_for_payment",
                "orderRef": "asfasd",
                "deliveredParcelFinalPriceBuyer": "400000",
                "order": {
                  "id": 2,
                  "store": {
                    "id": 32,
                    "name": "store123"
                  }
                }
              }
            }
          }
      ];

    displayedColumnsCollection = [
        'finance-collection-code',
        'finance-collection-method',
        'finance-collection-ref',
        'finance-collection-amount',
        'finance-collection-date',
        'finance-collection-due-date',
        'finance-collection-status',
        'finance-sales-rep',
        'finance-external-id',
        'finance-store-name',
        'finance-order-code',
        'finance-order-ref',
        'finance-reason',
    ];

    displayedColumnsBilling = [
        'finance-external-id',
        'finance-store-name',
        'finance-order-code',
        'finance-order-ref',
        'finance-total-amount',
        'finance-order-due-date',
        'finance-payment-status',
        'finance-sales-rep',
        'finance-collect-code',
        'finance-collection-ref',
        'finance-collection-amount',
        'finance-collection-date',
        'finance-collection-status',
        'finance-billing-code',
        'finance-materai',
        'finance-total-bill-amount',
        'finance-bill-date',
        'finance-bill-status',
        'finance-reason',
    ];

    constructor() {}

    ngOnInit() {
        this.totalDataSource = this.dataSource.length;
        this.size = 5;
        this.totalDataSourceBilling = this.dataSourceBilling.length;
    }

    openDetailCollectionStatus(id) {
        console.log('isi id->', id)
    }
}

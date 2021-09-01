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
import { environment } from 'environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-detail-collection-table',
    templateUrl: './detail-collection-table.component.html',
    styleUrls: ['./detail-collection-table.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCollectionTableComponent implements OnInit {
    public totalDataSourceBilling: number;

    public dataSourceBilling = [
      {
          id: 25,
          stampNominal: 3000,
          reason: 'males bayar',
          paidByCollectionMethod: 5000000,
          paidAmount: 50003000,
          billingPaymentCode: 'bpdf323233',
          createdAt: '2021-03-04 02:01:56',
          approvalStatus: 'pending',
          paymentCollectionMethod: {
              id: 232,
              collectionCode: 'csf3232',
              collectionRef: 'csf3232',
              amount: 50000000,
              balance: 300000,
              approvalStatus: 'pending',
              createdAt: '2021-03-04 02:01:56',
              user: {
                  id: 1,
                  fullName: 'ansor',
              },
              principal: {
                  id: 3,
                  externalId: '10302291',
              },
              stamp: {
                  id: 2,
                  nominal: 3000,
              },
          },
          billing: {
              id: 123,
              orderParcel: {
                  id: 34,
                  orderCode: 'snbd42323',
                  orderDueDate: '2021-03-04 02:01:56',
                  paymentStatus: 'waiting_for_payment',
                  orderRef: 'asfasd',
                  deliveredParcelFinalPriceBuyer: '400000',
                  order: {
                      id: 2,
                      store: {
                          id: 32,
                          name: 'store123',
                      },
                  },
              },
          },
      },
      {
          id: 26,
          stampNominal: 3000,
          reason: 'males bayar',
          paidByCollectionMethod: 5000000,
          paidAmount: 50003000,
          billingPaymentCode: 'bpdf323233',
          createdAt: '2021-03-04 02:01:56',
          approvalStatus: 'pending',
          paymentCollectionMethod: {
              id: 232,
              collectionCode: 'csf3232',
              collectionRef: 'csf3232',
              amount: 50000000,
              balance: 300000,
              approvalStatus: 'pending',
              createdAt: '2021-03-04 02:01:56',
              user: {
                  id: 1,
                  fullName: 'ansor',
              },
              principal: {
                  id: 3,
                  externalId: '10302291',
              },
              stamp: {
                  id: 2,
                  nominal: 3000,
              },
          },
          billing: {
              id: 123,
              orderParcel: {
                  id: 34,
                  orderCode: 'snbd42323',
                  orderDueDate: '2021-03-04 02:01:56',
                  paymentStatus: 'waiting_for_payment',
                  orderRef: 'asfasd',
                  deliveredParcelFinalPriceBuyer: '400000',
                  order: {
                      id: 2,
                      store: {
                          id: 32,
                          name: 'store123',
                      },
                  },
              },
          },
      },
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
        this.totalDataSourceBilling = this.dataSourceBilling.length;
    }

    getOrderCode(value): string {
        if (value && value.length > 0) {
            const lengthValue = value.length;
            const orderCodes = value[0] + ' (+' + (lengthValue - 1) + ' more)';

            return orderCodes.length > 0 ? orderCodes : '-';
        }

        return '-';
    }

    getOrderRef(value): string {
        if (value && value.length > 0) {
            const lengthValue = value.length;
            const orderRefs = value[0] + ' (+' + (lengthValue - 1) + ' more)';

            return orderRefs.length > 0 ? orderRefs : '-';
        }

        return '-';
    }

    numberFormat(num) {
        if (num) {
            return num
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
    }

    numberFormatFromString(num) {
        let value = parseInt(num);
        if (num) {
            return value
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
    }
}

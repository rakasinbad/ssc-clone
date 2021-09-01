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
import { fuseAnimations } from '@fuse/animations';
// import { MatPaginator, MatSort, PageEvent } from '@angular/material';
// import { Observable, Subject, merge } from 'rxjs';
// import { NgxPermissionsService } from 'ngx-permissions';
// import { IQueryParams } from 'app/shared/models/query.model';
// import { DomSanitizer } from '@angular/platform-browser';
// import { takeUntil, flatMap, filter } from 'rxjs/operators';
// import { environment } from 'environments/environment';
// import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-detail-collection-table',
    templateUrl: './detail-collection-table.component.html',
    styleUrls: ['./detail-collection-table.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCollectionTableComponent implements OnInit {
    @Input() detailData;
    public totalDataSourceBilling: number;
    public dataTable = [];
   
    displayedColumnsBilling = [
        'finance-external-id',
        'finance-store-name',
        'finance-order-code',
        'finance-order-ref',
        'finance-total-amount',
        'finance-order-due-date',
        'finance-payment-status',
        'finance-sales-rep',
        'finance-billing-code',
        'finance-bill-amount',
        'finance-materai',
        'finance-total-bill-amount',
        'finance-bill-date',
        'finance-bill-status',
        'finance-reason',
    ];

    constructor() {}

    ngOnInit() {
      this.dataTable = this.detailData[0].billingPayment;
      // console.log('isi datatable->', this.dataTable)
        this.totalDataSourceBilling = this.dataTable.length;
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

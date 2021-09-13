import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef,
    ViewEncapsulation,
    Input,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { FinanceDetailCollection } from '../../../models';
import * as collectionStatus from '../../../store/reducers';
import { CollectionDetailSelectors } from '../../../store/selectors';
import { Router } from '@angular/router';
import { BillingStatus, CollectionStatus } from '../../../models';
import { BillingSelectors, CollectionSelectors } from '../../../store/selectors';
import * as StatusPaymentLabel from '../../../constants';

@Component({
    selector: 'app-detail-collection-table',
    templateUrl: './detail-collection-table.component.html',
    styleUrls: ['./detail-collection-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCollectionTableComponent implements OnInit, OnDestroy {
    @Input() detailData;
    public totalDataSourceBilling: number = 0;
    public dataTable = [];
    detailCollection$: Observable<FinanceDetailCollection>;
    isLoading$: Observable<boolean>;
    public subs: Subscription;

    // private _unSubs$: Subject<void> = new Subject<void>();

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

    constructor(
        private store: Store<collectionStatus.FeatureState>,
        private cdRef: ChangeDetectorRef,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.detailCollection$ = this.store.select(CollectionDetailSelectors.getSelectedItem);
        this.isLoading$ = this.store.select(CollectionDetailSelectors.getLoadingState);

        this.subs = this.detailCollection$.subscribe((res) => {
            if (res != undefined) {
                console.log('res->', res);
                let dataBilling = [];
                this.dataTable = res['data']['billingPayments'];
                this.totalDataSourceBilling = dataBilling.length;
                console.log('isi res dan total->', this.dataTable, this.totalDataSourceBilling);
            }
        });
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

    totalAmountFormat(num) {
        let value = parseInt(num);
        if (num) {
            return value
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '0';
    }

    statusLabel(status) {
        switch (status) {
            case StatusPaymentLabel.VALUE_APPROVED_LABEL:
                return StatusPaymentLabel.STATUS_APPROVED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PENDING_LABEL:
                return StatusPaymentLabel.STATUS_PENDING_LABEL;
                break;
            case StatusPaymentLabel.VALUE_OVERDUE_LABEL:
                return StatusPaymentLabel.STATUS_OVERDUE_LABEL;
                break;
            case StatusPaymentLabel.VALUE_REJECTED_LABEL:
                return StatusPaymentLabel.STATUS_REJECTED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_WAITING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PAYMENT_FAILED_LABEL:
                return StatusPaymentLabel.STATUS_PAYMENT_FAILED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_WAITING_PAYMENT_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_PAYMENT_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PAID_LABEL:
                return StatusPaymentLabel.STATUS_PAID_LABEL;
                break;
            default:
                return '-';
                break;
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}

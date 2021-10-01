import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FinanceDetailCollection } from '../../../models';
import * as collectionStatus from '../../../store/reducers';
import { CollectionDetailSelectors } from '../../../store/selectors';
import * as StatusPaymentLabel from '../../../constants';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-detail-collection-table',
    templateUrl: './detail-collection-table.component.html',
    styleUrls: ['./detail-collection-table.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCollectionTableComponent implements OnInit {
    detailCollection$: Observable<FinanceDetailCollection>;
    isLoading$: Observable<boolean>;

    displayedColumnsBilling = [
        'finance-external-id',
        'finance-store-name',
        'finance-order-code',
        'finance-order-ref',
        'finance-total-invoice-amount',
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
        private store: Store<collectionStatus.FeatureState>
    ) {}

    ngOnInit() {
        this.detailCollection$ = this.store.select(CollectionDetailSelectors.getSelectedItem);
        this.isLoading$ = this.store.select(CollectionDetailSelectors.getLoadingState);
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
            case StatusPaymentLabel.VALUE_PENDING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
            case StatusPaymentLabel.VALUE_OVERDUE_LABEL:
                return StatusPaymentLabel.STATUS_OVERDUE_LABEL;
            case StatusPaymentLabel.VALUE_REJECTED_LABEL:
                return StatusPaymentLabel.STATUS_REJECTED_LABEL;
            case StatusPaymentLabel.VALUE_WAITING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
            case StatusPaymentLabel.VALUE_PAYMENT_FAILED_LABEL:
                return StatusPaymentLabel.STATUS_PAYMENT_FAILED_LABEL;
            case StatusPaymentLabel.VALUE_WAITING_PAYMENT_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_PAYMENT_LABEL;
            case StatusPaymentLabel.VALUE_PAID_LABEL:
                return StatusPaymentLabel.STATUS_PAID_LABEL;
            default:
                return '-';
        }
    }
}

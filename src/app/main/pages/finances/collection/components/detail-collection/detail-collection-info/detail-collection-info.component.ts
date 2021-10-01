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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { FinanceDetailCollection } from '../../../models';
import * as collectionStatus from '../../../store/reducers';
import { CollectionDetailSelectors } from '../../../store/selectors';
import * as StatusPaymentLabel from '../../../constants';

@Component({
    selector: 'app-detail-collection-info',
    templateUrl: './detail-collection-info.component.html',
    styleUrls: ['./detail-collection-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCollectionInfoComponent implements OnInit, OnDestroy {
    detailCollection$: Observable<FinanceDetailCollection>;
    isLoading$: Observable<boolean>;
    public subs: Subscription;
    public idDetail: number;
    
    CHECK = StatusPaymentLabel.CHECK;
    GIRO = StatusPaymentLabel.GIRO;

    constructor(
        private store: Store<collectionStatus.FeatureState>,
    ) {}

    ngOnInit() {
        this.detailCollection$ = this.store.select(CollectionDetailSelectors.getSelectedItem);
    }

    numberFormat(num) {
        if (num) {
            return num
                .toFixed(2)
                .replace(',', '.')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }

        return '-';
    }

    numberMateraiFormat(num) {
        if (num) {
            return num
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '0.00';
    }

    statusLabel(status) {
        switch (status) {
            case StatusPaymentLabel.VALUE_APPROVED_LABEL:
                return StatusPaymentLabel.STATUS_APPROVED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PENDING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
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

    ngOnDestroy(): void {}
}

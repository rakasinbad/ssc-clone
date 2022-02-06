import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as StatusPaymentLabel from '../../../constants';

@Component({
    selector: 'app-modal-detail-table-billing',
    templateUrl: './modal-detail-table-billing.component.html',
    styleUrls: ['./modal-detail-table-billing.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalDetailTableBillingComponent implements OnInit {
    item: any;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.item = this.data;
    }

    numberFormat(num) {
        if (num) {
            return 'Rp' + num
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
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

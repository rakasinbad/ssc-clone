import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as StatusPaymentLabel from '../../../constants';

@Component({
  selector: 'app-approve-reject-collection-billing',
  templateUrl: './approve-reject-collection-billing.component.html',
  styleUrls: ['./approve-reject-collection-billing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveRejectCollectionBillingComponent implements OnInit {

  public title: string;
  public type: string;
  public status: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.type = this.data.type;
    this.title = this.data.title;
    this.status = this.data.status;
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

}

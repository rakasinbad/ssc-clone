import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FinanceDetailBillingV1 } from '../../../../models/billing.model';

@Component({
    selector: 'app-detail-billing-generalinfo',
    templateUrl: './detail-billing-generalinfo.component.html',
    styleUrls: ['./detail-billing-generalinfo.component.scss'],
})
export class DetailBillingGeneralinfoComponent implements OnInit {
    constructor() {}
    @Input() dataDetail$: any ;

    ngOnInit() {
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
}

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '../../../../../../@fuse/animations';
import { MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { FuseTranslationLoaderService } from '../../../../../../@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from '../../../../../shared/helpers';
import { fromPaymentStatus } from '../store/reducers';

import printJS from 'print-js';

@Component({
    selector: 'app-invoices-view',
    templateUrl: './payment-status-view-invoices.component.html',
    styleUrls: ['./payment-status-view-invoices.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentStatusViewInvoicesComponent implements OnInit, OnDestroy{

    private id: number;

    constructor(
        private route: ActivatedRoute,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public translate: TranslateService,
        private _$log: LogService,
        private store: Store<fromPaymentStatus.FeatureState>,
    ) {
        this.id = this.route.snapshot.params['id'];
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {

    }


    print(): void {
        printJS('https://realsport-assest.s3-ap-southeast-1.amazonaws.com/realsport-assest/SINBAD+-+PSBB+2+-+Week+21-29sept.pdf');
    }

}

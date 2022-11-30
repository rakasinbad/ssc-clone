import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '../../../../../../@fuse/animations';
import { MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { FuseTranslationLoaderService } from '../../../../../../@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from '../../../../../shared/helpers';
import { fromPaymentStatus } from '../store/reducers';

import printJS from 'print-js';
import { PaymentStatusActions } from '../store/actions';
import { combineLatest, Observable, ObservedValueOf, Subject } from 'rxjs';
import { PaymentStatusSelectors } from '../store/selectors';
import { takeUntil } from 'rxjs/operators';
import { Browser } from 'leaflet';
import win = Browser.win;
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-invoices-view',
    templateUrl: './payment-status-view-invoices.component.html',
    styleUrls: ['./payment-status-view-invoices.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentStatusViewInvoicesComponent implements OnInit, OnDestroy {

    private id: string;
    isLoading$: Observable<boolean>;
    invoice$: Observable<{ fileName: string; url: string }>;
    private url: string;
    private fileName: string;
    private _unSubs$: Subject<void> = new Subject<void>();


    constructor(
        private route: ActivatedRoute,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public translate: TranslateService,
        private _$log: LogService,
        private store: Store<fromPaymentStatus.FeatureState>,
        private http: HttpClient
    ) {
        this.id = this.route.snapshot.params['id'];

    }


    ngOnInit(): void {
        this.store.dispatch(PaymentStatusActions.fetchInvoiceOrder({ payload: this.id }));
        this.invoice$ = this.store.select(PaymentStatusSelectors.getInvoice);
        this.invoice$.subscribe((value) => {
            this.url = value.url;
            this.fileName = value.fileName;
        });
    }

    ngOnDestroy(): void {
    }


    print(): void {
        const url = this.url; // Url from API
        this.http.get(url, { // fetch file from s3 as blob data
            responseType: 'blob'
        }).subscribe(
            (response) => {
                const blob = new Blob([response], {type: 'application/pdf'}); // response convert to javascript blob
                const blobUrl = URL.createObjectURL(blob); // blob get convert and save on browser memory
                const iframe = document.createElement('iframe'); // create element html
                iframe.style.display = 'none'; // set iframe not to diplay in html
                iframe.src = blobUrl; // set iframe src
                document.body.appendChild(iframe); // append iframe to dom

                iframe.contentWindow.focus();
                iframe.contentWindow.print(); // print element inside iframe
            });
    }
}

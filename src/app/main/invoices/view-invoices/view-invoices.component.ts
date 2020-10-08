import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '../../../../@fuse/animations';
import { MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { FuseTranslationLoaderService } from '../../../../@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';


import printJS from 'print-js';
import { combineLatest, Observable, ObservedValueOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Browser } from 'leaflet';
import win = Browser.win;
import { HttpClient } from '@angular/common/http';
import { FuseConfigService } from '../../../../@fuse/services/config.service';

@Component({
    selector: 'app-invoices-view',
    templateUrl: './view-invoices.component.html',
    styleUrls: ['./view-invoices.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewInvoicesComponent implements OnInit, OnDestroy {

     fileName: string;
     url: string;


    constructor(
        private route: ActivatedRoute,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public translate: TranslateService,
        private http: HttpClient,
        private _fuseConfigService: FuseConfigService,
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
        this.url = decodeURIComponent(this.route.snapshot.queryParamMap.get('url'));
    }


    ngOnInit(): void {

    }

    ngOnDestroy(): void {
    }


    print(): void {
        const url = this.url; // Url from API
        this.http.get(url, { // fetch file from s3 as blob data
            responseType: 'blob',
            headers: {}
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

import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import * as fromRoot from 'app/store/app.reducer';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-sr-target',
    templateUrl: './sr-target.component.html',
    styleUrls: ['./sr-target.component.scss'],
})
export class SrTargetComponent implements OnInit {
    url: SafeResourceUrl;
    isLoading = true;

    private readonly breadcrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Sales Management',
        },
        {
            title: 'SR Target',
        },
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private store: Store<fromRoot.State>,
        private storage: StorageMap
    ) {}

    ngOnInit(): void {
        this.store.dispatch(UiActions.createBreadcrumb({ payload: this.breadcrumbs }));

        this.storage.get('user').subscribe((data: any) => {
            this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(
                `${environment.microSiteHost}/salesreptarget?token=${data.token}`
            );
        });
    }

    onLoad(): void {
        this.isLoading = false;
    }
}
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import * as fromRoot from 'app/store/app.reducer';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-pjp',
    templateUrl: './pjp.component.html',
    styleUrls: ['./pjp.component.scss'],
})
export class SrTargetComponent implements OnInit {
    url$: BehaviorSubject<SafeResourceUrl> = new BehaviorSubject<SafeResourceUrl>('');
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    private readonly breadcrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Sales Management',
        },
        {
            title: 'Permanent Journey Plan',
            keepCase: true,
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
            const safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
                `${environment.microSiteHost}/salesmanagement/pjp?token=${data.token}`
            );
            
            this.url$.next(safeUrl);
        });
    }

    ngOnDestroy(): void {
        this.url$.next('');
        this.url$.complete();

        this.isLoading$.next(false);
        this.isLoading$.complete();
    }

    onLoad(): void {
        this.isLoading$.next(false);
    }
}

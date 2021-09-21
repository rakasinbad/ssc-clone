import { Component, OnInit, OnDestroy, } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import * as fromRoot from 'app/store/app.reducer';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd, } from "@angular/router";

@Component({
    selector: 'app-sales-team',
    templateUrl: './sales-team.component.html',
    styleUrls: ['./sales-team.component.scss'],
})
export class SrTargetComponent implements OnInit, OnDestroy {
    url$: BehaviorSubject<SafeResourceUrl> = new BehaviorSubject<SafeResourceUrl>('');
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    navigationSubscription;     

    private readonly breadcrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Sales Management',
        },
        {
            title: 'Sales Team',
            keepCase: true,
        },
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        private router: Router
    ) {
        this.navigationSubscription = this.router.events.subscribe((e: any) => {
            // If it is a NavigationEnd event re-initalise the component
            if (e instanceof NavigationEnd) {
                this.onLoadIframe()
            }
        });
    }

    ngOnInit(): void {
        this.store.dispatch(UiActions.createBreadcrumb({ payload: this.breadcrumbs }));

        this.onLoadIframe()
    }

    ngOnDestroy(): void {
        this.url$.next('');
        this.url$.complete();

        this.isLoading$.next(false);
        this.isLoading$.complete();

        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    onLoad(): void {
        this.isLoading$.next(false);
    }

    onLoadIframe(): void {
        this.storage.get('user').subscribe((data: any) => {
            const safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
                `${environment.microSiteHost}/salesmanagement/salesteam?token=${data.token}`
            );
            
            this.url$.next(safeUrl);
        });
    }
}

import { Component, OnInit, OnDestroy, } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import * as fromRoot from 'app/store/app.reducer';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd, } from "@angular/router";
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';

@Component({
    selector: 'app-workday-setting',
    templateUrl: './workday-setting.component.html',
    styleUrls: ['./workday-setting.component.scss'],
})
export class WorkdaySettingComponent implements OnInit, OnDestroy {
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
            title: 'Workday Setting',
        },
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private store: Store<fromRoot.State>,
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
        this.store.select(AuthSelectors.getUserState).subscribe(({ token }) => {
            const safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
                `${environment.microSiteHost}/salessetting?token=${token}`
            );

            this.url$.next(safeUrl);
        });
    }
}

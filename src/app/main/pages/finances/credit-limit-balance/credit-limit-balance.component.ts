import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseConfig } from '@fuse/types';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { CreditLimitBalanceActions } from './store/actions';
import { fromCreditLimitBalance } from './store/reducers';
import { CreditLimitBalanceSelectors } from './store/selectors';

@Component({
    selector: 'app-credit-limit-balance',
    templateUrl: './credit-limit-balance.component.html',
    styleUrls: ['./credit-limit-balance.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitBalanceComponent implements OnInit, OnDestroy {
    search: FormControl = new FormControl('');
    links = [
        {
            path: 'stores',
            label: 'Store List'
        },
        {
            path: 'group',
            label: 'Set Credit Limit Group'
        }
    ];
    urlActive = false;
    today = new Date();

    fuseConfig$: Observable<FuseConfig>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromCreditLimitBalance.FeatureState>,
        private _fuseConfigService: FuseConfigService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        this.fuseConfig$ = this._fuseConfigService.config;

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Finance',
                        translate: 'BREADCRUMBS.FINANCE'
                    },
                    {
                        title: 'Credit Limit / Balance',
                        translate: 'BREADCRUMBS.CREDIT_LIMIT_BALANCE',
                        active: true
                    }
                ]
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        // { outlets: { 'credit-limit-balance': 'stores' } }
        this.router.navigate(['stores'], {
            relativeTo: this.route,
            skipLocationChange: true
        });

        this.router.events
            .pipe(
                filter(ev => ev instanceof NavigationEnd),
                takeUntil(this._unSubs$)
            )
            .subscribe((ev: NavigationEnd) => {
                // this.urlActive = ev.url.endsWith('credit-limit-balance');
                this.urlActive = ev.url.endsWith('stores');

                if (ev.url.endsWith('credit-limit-balance')) {
                    this.router.navigate(['stores'], {
                        relativeTo: this.route,
                        skipLocationChange: true
                    });
                }

                // if (routerEvent instanceof NavigationEnd) {
                //     if (routerEvent.url.endsWith('credit-limit-balance')) {
                //         this.urlActive = true;

                //         this.router.navigate(['stores'], {
                //             relativeTo: this.route,
                //             skipLocationChange: true
                //         });
                //     }
                // }
            });

        this.totalDataSource$ = this.store.select(
            CreditLimitBalanceSelectors.getTotalCreditLimitStore
        );

        this.isLoading$ = this.store.select(CreditLimitBalanceSelectors.getIsLoading);

        // this.search.valueChanges
        //     .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
        //     .subscribe(v => {
        //         this.store.dispatch(
        //             CreditLimitBalanceActions.searchCreditLimitStore({ payload: v })
        //         );
        //     });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(CreditLimitBalanceActions.resetCoreState());

        this._unSubs$.next();
        this._unSubs$.complete();
    }
}

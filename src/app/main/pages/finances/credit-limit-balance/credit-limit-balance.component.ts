import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseConfig } from '@fuse/types';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { fromCreditLimitBalance } from './store/reducers';

@Component({
    selector: 'app-credit-limit-balance',
    templateUrl: './credit-limit-balance.component.html',
    styleUrls: ['./credit-limit-balance.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitBalanceComponent implements OnInit, OnDestroy {
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

    fuseConfig$: Observable<FuseConfig>;

    private _unSubs$: Subject<void>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromCreditLimitBalance.FeatureState>,
        private _fuseConfigService: FuseConfigService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        this.fuseConfig$ = this._fuseConfigService.config;
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject();
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
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

        // { outlets: { 'credit-limit-balance': 'stores' } }
        this.router.navigate(['stores'], {
            relativeTo: this.route,
            skipLocationChange: true
        });

        this.router.events.pipe(takeUntil(this._unSubs$)).subscribe(routerEvent => {
            if (routerEvent instanceof NavigationEnd) {
                if (routerEvent.url.endsWith('credit-limit-balance')) {
                    this.router.navigate(['stores'], {
                        relativeTo: this.route,
                        skipLocationChange: true
                    });
                }
            }
        });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));

        this._unSubs$.next();
        this._unSubs$.complete();
    }
}

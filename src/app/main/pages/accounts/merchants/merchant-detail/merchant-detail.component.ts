import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseConfig } from '@fuse/types';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { BrandStoreActions } from '../store/actions';
import { fromMerchant } from '../store/reducers';
import { BrandStoreSelectors } from '../store/selectors';

@Component({
    selector: 'app-merchant-detail',
    templateUrl: './merchant-detail.component.html',
    styleUrls: ['./merchant-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantDetailComponent implements OnInit, OnDestroy {
    links = [
        {
            path: 'info',
            label: 'Store'
        },
        {
            path: 'employee',
            label: 'Karyawan'
        },
        {
            path: 'location',
            label: 'Location'
        }
    ];

    fuseConfig$: Observable<FuseConfig>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseConfigService: FuseConfigService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        this.fuseConfig$ = this._fuseConfigService.config;
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Account',
                        translate: 'BREADCRUMBS.ACCOUNT',
                        url: '/pages/account/stores'
                    },
                    {
                        title: 'Store',
                        translate: 'BREADCRUMBS.STORE',
                        active: true
                    }
                ]
            })
        );

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();

        this.store
            .select(BrandStoreSelectors.getGoPage)
            .pipe(
                filter(page => !!page),
                takeUntil(this._unSubs$)
            )
            .subscribe(page => {
                console.log('GO PAGE', page);

                if (page) {
                    this.router.navigate([{ outlets: { 'store-detail': page } }], {
                        relativeTo: this.route,
                        skipLocationChange: true
                    });
                }
            });
        this.isLoading$ = this.store.select(BrandStoreSelectors.getIsLoading);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        // this.store.dispatch(BrandStoreActions.resetGoPage());

        this._unSubs$.next();
        this._unSubs$.complete();
    }
}

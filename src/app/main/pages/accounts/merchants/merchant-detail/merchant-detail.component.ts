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
import { filter, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { StoreActions } from '../store/actions';
import { fromMerchant } from '../store/reducers';
import { StoreSelectors } from '../store/selectors';

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
            label: 'Employee'
        },
        {
            path: 'location',
            label: 'Location'
        }
    ];
    urlActive = false;
    urlStore = false;

    fuseConfig$: Observable<FuseConfig>;
    totalDataSource$: Observable<number>;
    isEditLocation$: Observable<boolean>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromMerchant.FeatureState>,
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
                        title: 'Account',
                        translate: 'BREADCRUMBS.ACCOUNT'
                    },
                    {
                        title: 'Store',
                        translate: 'BREADCRUMBS.STORE',
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

        // Only show loading when url is active "(store-detail:employee)"
        this.router.events
            .pipe(
                filter(ev => ev instanceof NavigationEnd),
                takeUntil(this._unSubs$)
            )
            .subscribe(ev => {
                this.urlActive = this.router.url.endsWith('(store-detail:employee)');
                this.urlStore = this.router.url.endsWith('(store-detail:location)');
            });

        // Handle nav tab change
        this.store
            .select(StoreSelectors.getGoPage)
            .pipe(
                filter(page => !!page),
                takeUntil(this._unSubs$)
            )
            .subscribe(page => {
                if (page) {
                    this.router.navigate([{ outlets: { 'store-detail': page } }], {
                        relativeTo: this.route,
                        skipLocationChange: true
                    });
                }
            });

        this.isEditLocation$ = this.store.select(StoreSelectors.getIsEditLocation);

        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.resetBreadcrumb());
        // this.store.dispatch(BrandStoreActions.resetGoPage());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    onEditLocation(): void {
        this.store.dispatch(StoreActions.setEditLocation());
    }
}

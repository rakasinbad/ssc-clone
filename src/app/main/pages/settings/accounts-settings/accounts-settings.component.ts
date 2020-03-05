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

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { SettingsActions } from './store/actions';
import { fromSettings } from './store/reducers';
import { SettingsSelectors } from './store/selectors';

/** State Management */
@Component({
    selector: 'app-accounts-settings',
    templateUrl: './accounts-settings.component.html',
    styleUrls: ['./accounts-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsSettingsComponent implements OnInit, OnDestroy {
    links = [
        {
            path: 'information',
            label: 'Informasi Diri'
        },
        {
            path: 'password',
            label: 'Ubah Password'
        }
    ];
    urlActive: boolean;

    fuseConfig$: Observable<FuseConfig>;
    isRequesting$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromSettings.FeatureState>,
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
                        title: 'Accounts Settings',
                        translate: 'BREADCRUMBS.ACCOUNTS_SETTINGS',
                        active: true
                    }
                ]
            })
        );
    }

    ngOnInit(): void {
        this._unSubs$ = new Subject<void>();
        this.urlActive = false;

        this.router.navigate(['information'], {
            relativeTo: this.route,
            skipLocationChange: true
        });

        this.router.events
            .pipe(
                filter(ev => ev instanceof NavigationEnd),
                takeUntil(this._unSubs$)
            )
            .subscribe((ev: NavigationEnd) => {
                this.urlActive = ev.url.endsWith('information');

                if (ev.url.endsWith('accounts')) {
                    this.router.navigate(['information'], {
                        relativeTo: this.route,
                        skipLocationChange: true
                    });
                }
            });

        this.isRequesting$ = this.store.select(SettingsSelectors.getRequestStatus);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(SettingsActions.resetUser());

        this._unSubs$.next();
        this._unSubs$.complete();
    }
}

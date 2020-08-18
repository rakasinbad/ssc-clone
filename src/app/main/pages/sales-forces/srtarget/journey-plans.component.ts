import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Subject } from 'rxjs';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import * as fromJourneyPlans from './store/reducers';

@Component({
    selector: 'app-journey-plans',
    templateUrl: './journey-plans.component.html',
    styleUrls: ['./journey-plans.component.scss'],
    animations: [
        fuseAnimations,
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    encapsulation: ViewEncapsulation.None,
})
export class JourneyPlansComponent implements OnInit, OnDestroy {
    url: SafeResourceUrl;

    private _unSubs$: Subject<void> = new Subject<void>();

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
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
        private cdRef: ChangeDetectorRef,
        private domSanitizer: DomSanitizer,
        private store: Store<fromJourneyPlans.FeatureState>,
        private storage: StorageMap,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs,
            })
        );

        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset core state sales reps

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Load translate
                this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

                this.storage.get('user').subscribe((data: any) => {
                    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(
                        `https://micro-dev.sinbad.web.id/salesreptarget?token=${data.token}`
                    );
                    this.cdRef.detectChanges();
                });
                break;
        }
    }
}

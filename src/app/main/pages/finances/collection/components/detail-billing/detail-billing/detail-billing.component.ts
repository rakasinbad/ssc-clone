import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import * as collectionStatus from '../../../store/reducers';
import { locale as english } from '../../../i18n/en';
import { locale as indonesian } from '../../../i18n/id';
import { UiActions } from 'app/shared/store/actions';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { BillingDetailSelectors } from '../../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { BillingActions } from '../../../store/actions';
import { FinanceDetailBillingV1 } from '../../../models';
import { MatDialog } from '@angular/material';
import { ApproveRejectCollectionBillingComponent } from '../../modal/approve-reject-collection-billing/approve-reject-collection-billing.component';

@Component({
    selector: 'app-detail-billing',
    templateUrl: './detail-billing.component.html',
    styleUrls: ['./detail-billing.component.scss'],
    animations: fuseAnimations, // for enabled directive animate
})
export class DetailBillingComponent implements OnInit, OnDestroy {
    detailBilling$: Observable<FinanceDetailBillingV1>;
    isLoading$: Observable<boolean>;
    public idDetail: number;
    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Finance',
        },
        {
            title: 'Collection',
        },
        {
            title: 'Billing Details',
            active: true,
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private store: Store<collectionStatus.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    ngOnInit() {
        this._initPage();
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs,
            })
        );
    }

    ngOnDestroy() {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    onClickBack(): void {
        this.router.navigateByUrl('/pages/finances/collection');
        // localStorage.clear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;
        this.idDetail = id;

        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state flexiCombos
                this.store.dispatch(BillingActions.clearState());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );
                const { id } = this.route.snapshot.params;
                this.detailBilling$ = this.store.select(BillingDetailSelectors.getSelectedItem);

                const parameter: IQueryParams = {};
                parameter['splitRequest'] = true;

                this.store.dispatch(
                    BillingActions.fetchBillingDetailRequest({ payload: { id: id } })
                );

                this.isLoading$ = this.store.select(BillingDetailSelectors.getLoadingState);
                break;
        }
    }
}

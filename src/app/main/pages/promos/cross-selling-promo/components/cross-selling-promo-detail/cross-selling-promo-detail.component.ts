import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { CrossSelling } from '../../models';
import { CrossSellingPromoActions } from '../../store/actions';
import * as fromCrossSellingPromo from '../../store/reducers';
import { CrossSellingPromoSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';

@Component({
  selector: 'app-cross-selling-promo-detail',
  templateUrl: './cross-selling-promo-detail.component.html',
  styleUrls: ['./cross-selling-promo-detail.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingPromoDetailComponent implements OnInit, OnDestroy {
    crossSellingPromo$: Observable<CrossSelling>;
    isLoading$: Observable<boolean>;

    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Promo',
        },
        {
            title: 'Cross Selling Promo',
        },
        {
            title: 'Detail Cross Selling Promo',
            active: true,
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private store: Store<fromCrossSellingPromo.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;

        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state crossSellingPromo
                this.store.dispatch(CrossSellingPromoActions.clearState());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );

                this.crossSellingPromo$ = this.store.select(CrossSellingPromoSelectors.getSelectedItem);

                const parameter: IQueryParams = {};
                parameter['splitRequest'] = true;

                this.store.dispatch(CrossSellingPromoActions.fetchCrossSellingPromoDetailRequest({ payload: { id, parameter } }));

                this.isLoading$ = this.store.select(CrossSellingPromoSelectors.getIsLoading);
                break;
        }
    }
}

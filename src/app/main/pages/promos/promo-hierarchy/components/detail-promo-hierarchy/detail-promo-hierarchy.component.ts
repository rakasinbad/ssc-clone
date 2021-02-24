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
import { PromoHierarchy } from '../../models';
import { PromoHierarchyActions } from '../../store/actions';
import * as fromPromoHierarchy from '../../store/reducers';
import { PromoHierarchySelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail-promo-hierarchy',
  templateUrl: './detail-promo-hierarchy.component.html',
  styleUrls: ['./detail-promo-hierarchy.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailPromoHierarchyComponent implements OnInit, OnDestroy {
    public dataDetail: any;
    promoHierarchy$: Observable<PromoHierarchy>;
    isLoading$: Observable<boolean>;
    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Promo',
        },
        {
            title: 'Promo Hierarchy',
        },
        {
            title: 'Promo Hierarchy Detail',
            active: true,
        },
    ];
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromPromoHierarchy.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
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

    onClickBack(): void {
        this.router.navigateByUrl('/pages/promos/promo-hierarchy');
        localStorage.clear();

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

                // Reset core state promohierarchy
                this.store.dispatch(PromoHierarchyActions.resetPromoHierarchy());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );
                this.dataDetail = JSON.parse(localStorage.getItem('item'));
                this.promoHierarchy$ = this.store.select(PromoHierarchySelectors.getSelectedItem);

                const parameter: IQueryParams = {};
                parameter['splitRequest'] = true;
                parameter['type'] = this.dataDetail.type;
                parameter['supplierId'] = this.dataDetail.supplierId;
                
                this.store.dispatch(PromoHierarchyActions.fetchPromoHierarchyDetailRequest({ payload: { id, parameter } }));
                this.isLoading$ = this.store.select(PromoHierarchySelectors.getLoadingState);
                break;
        }
    }
}

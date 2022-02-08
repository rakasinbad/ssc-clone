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
import { Location } from '@angular/common';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { FinanceDetailCollection } from '../../models';
import { CollectionActions } from '../../store/actions';
import * as collectionStatus from '../../store/reducers';
import { CollectionDetailSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-detail-collection',
    templateUrl: './detail-collection.component.html',
    styleUrls: ['./detail-collection.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCollectionComponent implements OnInit, OnDestroy {

    detailCollection$: Observable<FinanceDetailCollection>;
    isLoading$: Observable<boolean>;

    public idDetail: number;
    public dataDetail: any;

    

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
            title: 'Collection Details',
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
        this.location.back();
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
                this.store.dispatch(CollectionActions.clearState());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );

                this.detailCollection$ = this.store.select(CollectionDetailSelectors.getSelectedItem);

                const parameter: IQueryParams = {};
                parameter['splitRequest'] = true;

                this.store.dispatch(
                    CollectionActions.fetchCollectionDetailRequest({ payload: id })
                );

                this.isLoading$ = this.store.select(CollectionDetailSelectors.getLoadingState);
                break;
        }
    }
}

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
import { FlexiCombo } from '../../models';
import { FlexiComboActions } from '../../store/actions';
import * as fromFlexiCombos from '../../store/reducers';
import { FlexiComboSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-flexi-combo-detail',
    templateUrl: './flexi-combo-detail.component.html',
    styleUrls: ['./flexi-combo-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailComponent implements OnInit, OnDestroy {
    flexiCombo$: Observable<FlexiCombo>;
    isLoading$: Observable<boolean>;

    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Promo',
        },
        {
            title: 'Flexi Combo',
        },
        {
            title: 'Flexi Combo Detail',
            active: true,
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromFlexiCombos.FeatureState>,
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
        this.router.navigateByUrl('/pages/promos/flexi-combo', { replaceUrl: true });
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

                // Reset core state flexiCombos
                this.store.dispatch(FlexiComboActions.clearState());
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );

                this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem);

                const parameter: IQueryParams = {};
                parameter['splitRequest'] = true;

                this.store.dispatch(FlexiComboActions.fetchFlexiComboRequest({ payload: { id, parameter } }));

                this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);
                break;
        }
    }
}

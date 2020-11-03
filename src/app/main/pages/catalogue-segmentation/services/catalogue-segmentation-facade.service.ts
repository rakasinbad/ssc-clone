import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { Observable } from 'rxjs';
import { CatalogueSegmentationModule } from '../catalogue-segmentation.module';
import { CatalogueSegmentation } from '../models';
import { CatalogueSegmentationActions } from '../store/actions';
import { fromCatalogueSegmentation } from '../store/reducers';
import { CatalogueSegmentationSelectors } from '../store/selectors';

@Injectable({ providedIn: CatalogueSegmentationModule })
export class CatalogueSegmentationFacadeService {
    readonly catalogueSegmentation$: Observable<CatalogueSegmentation> = this.store.select(
        CatalogueSegmentationSelectors.selectCurrentItem
    );
    readonly catalogueSegmentations$: Observable<CatalogueSegmentation[]> = this.store.select(
        CatalogueSegmentationSelectors.selectAll
    );
    readonly isLoading$: Observable<boolean> = this.store.select(
        CatalogueSegmentationSelectors.selectIsLoading
    );
    readonly isRefresh$: Observable<boolean> = this.store.select(
        CatalogueSegmentationSelectors.selectIsRefresh
    );
    readonly totalItem$: Observable<number> = this.store.select(
        CatalogueSegmentationSelectors.selectTotalItem
    );

    readonly clickCancelBtn$: Observable<boolean> = this.store.select(
        FormSelectors.getIsClickCancelButton
    );
    readonly clickSaveBtn$: Observable<boolean> = this.store.select(
        FormSelectors.getIsClickSaveButton
    );

    constructor(private store: Store<fromCatalogueSegmentation.FeatureState>) {}

    getWithQuery(params: IQueryParams): void {
        this.store.dispatch(
            CatalogueSegmentationActions.fetchCatalogueSegmentationsRequest({ payload: params })
        );
    }

    createBreadcrumb(breadcrumbs: IBreadcrumbs[]): void {
        this.store.dispatch(UiActions.createBreadcrumb({ payload: breadcrumbs }));
    }

    clearBreadcrumb(): void {
        this.store.dispatch(UiActions.resetBreadcrumb());
    }

    setCancelButton(): void {
        this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
    }

    setFooterConfig(config: IFooterActionConfig): void {
        this.store.dispatch(UiActions.setFooterActionConfig({ payload: config }));
    }

    showFooter(): void {
        this.store.dispatch(UiActions.showFooterAction());
    }

    hideFooter(): void {
        this.store.dispatch(UiActions.hideFooterAction());
    }

    setFormValid(): void {
        this.store.dispatch(FormActions.setFormStatusValid());
    }

    setFormInvalid(): void {
        this.store.dispatch(FormActions.setFormStatusInvalid());
    }

    resetCancelBtn(): void {
        this.store.dispatch(FormActions.resetClickCancelButton());
        this.store.dispatch(FormActions.resetCancelButtonAction());
    }

    resetFormStatus(): void {
        this.store.dispatch(FormActions.resetFormStatus());
    }

    resetSaveBtn(): void {
        this.store.dispatch(FormActions.resetClickSaveButton());
    }

    resetAllFooter(): void {
        this.resetCancelBtn();
        this.resetFormStatus();
        this.resetSaveBtn();
    }
}

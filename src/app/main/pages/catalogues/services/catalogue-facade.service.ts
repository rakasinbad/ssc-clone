import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';
import { CataloguesModule } from '../catalogues.module';
import { Catalogue } from '../models';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';

@Injectable({ providedIn: CataloguesModule })
export class CatalogueFacadeService {
    catalogue$: Observable<Catalogue> = this.store.select(
        CatalogueSelectors.getSelectedCatalogueEntity
    );
    totalCatalogueSegmentation$: Observable<number> = this.store.select(
        CatalogueSelectors.getTotalCataloguePriceSettings
    );
    isLoading$: Observable<boolean> = this.store.select(CatalogueSelectors.getIsLoading);

    constructor(private store: Store<fromCatalogue.FeatureState>) {}

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

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { Observable } from 'rxjs';
import { CatalogueSegmentationModule } from '../catalogue-segmentation.module';
import { CatalogueSegmentation, CreateCatalogueSegmentationDto } from '../models';
import {
    CatalogueSegmentationActions,
    CatalogueSegmentationDetailActions,
    CatalogueSegmentationFormActions,
} from '../store/actions';
import { fromCatalogueSegmentation } from '../store/reducers';
import { DataCatalogueSegmentationSelectors } from '../store/selectors';
import { NoticeService } from './../../../../shared/helpers/notice.service';
import { CatalogueSegmentationApiService } from './catalogue-segmentation-api.service';

@Injectable({ providedIn: CatalogueSegmentationModule })
export class CatalogueSegmentationFacadeService {
    readonly catalogueSegmentation$: Observable<CatalogueSegmentation> = this.store.select(
        DataCatalogueSegmentationSelectors.selectCurrentItem
    );
    readonly catalogueSegmentations$: Observable<CatalogueSegmentation[]> = this.store.select(
        DataCatalogueSegmentationSelectors.selectAll
    );
    readonly isLoading$: Observable<boolean> = this.store.select(
        DataCatalogueSegmentationSelectors.selectIsLoading
    );
    readonly isRefresh$: Observable<boolean> = this.store.select(
        DataCatalogueSegmentationSelectors.selectIsRefresh
    );
    readonly totalItem$: Observable<number> = this.store.select(
        DataCatalogueSegmentationSelectors.selectTotalItem
    );

    readonly clickCancelBtn$: Observable<boolean> = this.store.select(
        FormSelectors.getIsClickCancelButton
    );
    readonly clickSaveBtn$: Observable<boolean> = this.store.select(
        FormSelectors.getIsClickSaveButton
    );

    constructor(
        private store: Store<fromCatalogueSegmentation.FeatureState>,
        private dataService: CatalogueSegmentationApiService,
        private _notice: NoticeService
    ) {}

    createCatalogueSegmentation(body: CreateCatalogueSegmentationDto): void {
        this.store.dispatch(
            CatalogueSegmentationFormActions.createCatalogueSegmentationRequest({ payload: body })
        );
    }

    getById(id: string): void {
        this.store.dispatch(
            CatalogueSegmentationDetailActions.fetchCatalogueSegmentationRequest({ id })
        );
    }

    getWithQuery(params: IQueryParams): void {
        this.store.dispatch(
            CatalogueSegmentationActions.fetchCatalogueSegmentationsRequest({ payload: params })
        );
    }

    resetState(): void {
        this.store.dispatch(CatalogueSegmentationActions.resetState());
    }

    //delete catalogue segments by id
    delete(idCatalogueSegment: number): void {
        this.store.dispatch(
            CatalogueSegmentationActions.DeleteCatalogueSegmentationsSuccess({
                payload: { id: idCatalogueSegment },
            })
        );
    }

    //delete catalogue segments by id
    deleteWithQuery(idCatalogueSegment: string): void {
        this.dataService.deleteWithQuery(idCatalogueSegment).subscribe(
            (data: any) => {
                this.store.dispatch(
                    CatalogueSegmentationActions.refreshTable({ payload: { refreshStatus: true } })
                );
                this._notice.open('Your selected Catalogue has been deleted.', 'success', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000,
                });
            },
            (err) => {
                this._notice.open(err.message, 'error', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000,
                });
            }
        );
    }

    //isRefresh use after delete success
    isRefresh(status: boolean): void {
        this.store.dispatch(
            CatalogueSegmentationActions.refreshTable({ payload: { refreshStatus: status } })
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

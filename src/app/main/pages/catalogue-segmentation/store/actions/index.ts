import * as CatalogueSegmentationDetailActions from './catalogue-segmentation-detail.actions';
import * as CatalogueSegmentationFormActions from './catalogue-segmentation-form.actions';
import * as CatalogueSegmentationActions from './catalogue-segmentation.actions';
import * as CatalogueActions from './catalogue.actions';

export type CatalogueSegmentationDetailFailureActions = CatalogueSegmentationDetailActions.FailureActions;
export type CatalogueSegmentationFormFailureActions = CatalogueSegmentationFormActions.FailureActions;
export type CatalogueSegmentationFailureActions = CatalogueSegmentationActions.FailureActions;
export type CatalogueFailureActions = CatalogueActions.FailureActions;

export { CatalogueSegmentationDetailActions, CatalogueSegmentationFormActions, CatalogueSegmentationActions, CatalogueActions };

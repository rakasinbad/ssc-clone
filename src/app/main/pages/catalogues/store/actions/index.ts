import * as BrandActions from './brand.actions';
import * as CataloguePriceSegmentationActions from './catalogue-price-segmentation.actions';
import * as CatalogueActions from './catalogue.actions';

export type CataloguePriceSegmentationFailureActions = CataloguePriceSegmentationActions.FailureActions;
export type FailureActionNames = CatalogueActions.FailureActionNames;

export { BrandActions, CataloguePriceSegmentationActions, CatalogueActions };

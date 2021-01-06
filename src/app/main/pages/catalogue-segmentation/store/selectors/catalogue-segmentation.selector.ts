import { createFeatureSelector } from '@ngrx/store';
import { fromCatalogueSegmentation } from '../reducers';

export const selectCatalogueSegmentationState = createFeatureSelector<
    fromCatalogueSegmentation.FeatureState,
    fromCatalogueSegmentation.State
>(fromCatalogueSegmentation.catalogueSegmentationFeatureKey);

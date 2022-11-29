import { createFeatureSelector } from '@ngrx/store';
import { fromAddProduct } from '../reducers';

export const selectAddProductState = createFeatureSelector<
    fromAddProduct.FeatureStateAddProduct,
    fromAddProduct.State
>(fromAddProduct.addProductFeatureKey);

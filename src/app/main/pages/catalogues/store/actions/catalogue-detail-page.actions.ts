import { createAction, props } from '@ngrx/store';
import { AdjustCataloguePriceDto } from '../../models';

enum Actions {
    AdjustPriceSettingRequest = '[Catalogue Detail Page] Adjust Price Setting Request',
    AdjustPriceSettingSuccess = '[Catalogue Detail Page] Adjust Price Setting Success',
    AdjustPriceSettingFailure = '[Catalogue Detail Page] Adjust Price Setting Failure',
}

export const adjustPriceSettingRequest = createAction(
    Actions.AdjustPriceSettingRequest,
    props<{ payload: AdjustCataloguePriceDto }>()
);

export const adjustPriceSettingSuccess = createAction(Actions.AdjustPriceSettingSuccess);

export const adjustPriceSettingFailure = createAction(Actions.AdjustPriceSettingFailure);

export type FailureActions = 'adjustPriceSettingFailure';

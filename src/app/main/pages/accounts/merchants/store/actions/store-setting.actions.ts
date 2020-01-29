import { createAction, props } from '@ngrx/store';
import { IQueryParams, IErrorHandler } from 'app/shared/models';
import { StoreSetting } from '../../models/store-setting.model';

export type storeSettingFailureActionNames =
    'fetchStoreSettingsFailure' | 'updateStoreSettingFailure' | 'createStoreSettingFailure'
;

// -----------------------------------------------------------------------------------------------------
// Fetch Store Settings
// -----------------------------------------------------------------------------------------------------

export const fetchStoreSettingsRequest = createAction(
    '[Store Setting API] Fetch Store Settings Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreSettingsFailure = createAction(
    '[Store Setting API] Fetch Store Settings Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreSettingsSuccess = createAction(
    '[Store Setting API] Fetch Store Settings Success',
    props<{ payload: { data: Array<StoreSetting>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE STORE SETTING] Store Setting
// -----------------------------------------------------------------------------------------------------

export const createStoreSettingRequest = createAction(
    '[Store Setting API] Create Store Setting Request',
    props<{ payload: { body: Partial<StoreSetting>; } }>()
);

export const createStoreSettingFailure = createAction(
    '[Store Setting API] Create Store Setting Failure',
    props<{ payload: IErrorHandler }>()
);

export const createStoreSettingSuccess = createAction(
    '[Store Setting API] Create Store Setting Success',
    props<{ payload: StoreSetting }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE STORE SETTING] Store Setting
// -----------------------------------------------------------------------------------------------------

export const updateStoreSettingRequest = createAction(
    '[Store Setting API] Update Store Setting Request',
    props<{ payload: { body: Partial<StoreSetting>; id: string } }>()
);

export const updateStoreSettingFailure = createAction(
    '[Store Setting API] Update Store Setting Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStoreSettingSuccess = createAction(
    '[Store Setting API] Update Store Setting Success',
    props<{ payload: StoreSetting }>()
);

// -----------------------------------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------------------------------

export const setSelectedStoreSettingId = createAction(
    '[Store Setting] Set Selected Store Setting ID',
    props<{ payload: string }>()
);

export const confirmUpdateStoreSetting = createAction(
    '[Store Setting] Confirm Update Store Setting',
    props<{ payload: { body: Partial<StoreSetting>; id: string } }>()
);

export const resetSelectedStoreSettingId = createAction('[Store Setting] Reset Selected Store Setting ID');

export const truncateStoreSetting = createAction('[Store Setting] Truncate Store Settings');

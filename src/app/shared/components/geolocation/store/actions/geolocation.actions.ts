import { createAction, props } from '@ngrx/store';
import { Urban } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { Province } from 'app/shared/models/location.model';
import { ErrorHandler } from 'app/shared/models/global.model';

export type failureActionNames =
    'fetchProvincesFailure' |
    'fetchCitiesFailure' |
    'fetchDistrictsFailure' |
    'fetchUrbansFailure'
;

// Province
export const fetchProvincesRequest = createAction(
    '[Geolocation API] Fetch Provinces Request',
    props<{ payload: IQueryParams }>()
);

export const fetchProvincesFailure = createAction(
    '[Geolocation API] Fetch Provinces Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchProvincesSuccess = createAction(
    '[Geolocation API] Fetch Provinces Success',
    props<{ payload: { data: Array<Province>; total: number } }>()
);

export const selectProvince = createAction(
    '[Geolocation] Select Province',
    props<{ payload: string }>()
);

export const deselectProvince = createAction('[Geolocation] Deselect Province');

export const truncateProvinces = createAction('[Geolocation] Truncate Provinces');


// City
export const fetchCitiesRequest = createAction(
    '[Geolocation API] Fetch Cities Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCitiesFailure = createAction(
    '[Geolocation API] Fetch Cities Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCitiesSuccess = createAction(
    '[Geolocation API] Fetch Cities Success',
    props<{ payload: { cities: Array<string>; total: number } }>()
);

export const selectCity = createAction(
    '[Geolocation] Select City',
    props<{ payload: string }>()
);

export const deselectCity = createAction('[Geolocation] Deselect City');

export const truncateCities = createAction('[Geolocation] Truncate Cities');


// District
export const fetchDistrictsRequest = createAction(
    '[Geolocation API] Fetch Districts Request',
    props<{ payload: IQueryParams }>()
);

export const fetchDistrictsFailure = createAction(
    '[Geolocation API] Fetch Districts Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchDistrictsSuccess = createAction(
    '[Geolocation API] Fetch Districts Success',
    props<{ payload: { districts: Array<string>; total: number } }>()
);

export const selectDistrict = createAction(
    '[Geolocation] Select District',
    props<{ payload: string }>()
);

export const deselectDistrict = createAction('[Geolocation] Deselect District');

export const truncateDistricts = createAction('[Geolocation] Truncate Districts');

// Urban
export const fetchUrbansRequest = createAction(
    '[Geolocation API] Fetch Urbans Request',
    props<{ payload: IQueryParams }>()
);

export const fetchUrbansFailure = createAction(
    '[Geolocation API] Fetch Districts Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchUrbansSuccess = createAction(
    '[Geolocation API] Fetch Urbans Success',
    props<{ payload: { urbans: Array<Urban>; total: number } }>()
);

export const selectUrban = createAction(
    '[Geolocation] Select Urban',
    props<{ payload: string }>()
);

export const deselectUrban = createAction('[Geolocation] Deselect Urban');

export const truncateUrbans = createAction('[Geolocation] Truncate Urbans');

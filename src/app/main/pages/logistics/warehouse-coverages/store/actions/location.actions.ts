import { createAction, props } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models/query.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { Province, Urban } from 'app/shared/models/location.model';

export type failureActionNames =
    'fetchProvincesFailure' |
    'fetchCitiesFailure' |
    'fetchDistrictsFailure' |
    'fetchUrbansFailure'
;

// Province
export const fetchProvincesRequest = createAction(
    '[WH/WH Coverage/Locations API] Fetch Provinces Request',
    props<{ payload: IQueryParams }>()
);

export const fetchProvincesFailure = createAction(
    '[WH/WH Coverage/Locations API] Fetch Provinces Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchProvincesSuccess = createAction(
    '[WH/WH Coverage/Locations API] Fetch Provinces Success',
    props<{ payload: { data: Array<Province>; total: number } }>()
);

export const selectProvince = createAction(
    '[WH/WH Coverage/Locations] Select Province',
    props<{ payload: string }>()
);

export const deselectProvince = createAction('[WH/WH Coverage/Locations] Deselect Province');

export const truncateProvinces = createAction('[WH/WH Coverage/Locations] Truncate Provinces');


// City
export const fetchCitiesRequest = createAction(
    '[WH/WH Coverage/Locations API] Fetch Cities Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCitiesFailure = createAction(
    '[WH/WH Coverage/Locations API] Fetch Cities Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCitiesSuccess = createAction(
    '[WH/WH Coverage/Locations API] Fetch Cities Success',
    props<{ payload: { cities: Array<string>; total: number } }>()
);

export const selectCity = createAction(
    '[WH/WH Coverage/Locations] Select City',
    props<{ payload: string }>()
);

export const deselectCity = createAction('[WH/WH Coverage/Locations] Deselect City');

export const truncateCities = createAction('[WH/WH Coverage/Locations] Truncate Cities');


// District
export const fetchDistrictsRequest = createAction(
    '[WH/WH Coverage/Locations API] Fetch Districts Request',
    props<{ payload: IQueryParams }>()
);

export const fetchDistrictsFailure = createAction(
    '[WH/WH Coverage/Locations API] Fetch Districts Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchDistrictsSuccess = createAction(
    '[WH/WH Coverage/Locations API] Fetch Districts Success',
    props<{ payload: { districts: Array<string>; total: number } }>()
);

export const selectDistrict = createAction(
    '[WH/WH Coverage/Locations] Select District',
    props<{ payload: string }>()
);

export const deselectDistrict = createAction('[WH/WH Coverage/Locations] Deselect District');

export const truncateDistricts = createAction('[WH/WH Coverage/Locations] Truncate Districts');

// Urban
export const fetchUrbansRequest = createAction(
    '[WH/WH Coverage/Locations API] Fetch Urbans Request',
    props<{ payload: IQueryParams }>()
);

export const fetchUrbansFailure = createAction(
    '[WH/WH Coverage/Locations API] Fetch Districts Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchUrbansSuccess = createAction(
    '[WH/WH Coverage/Locations API] Fetch Urbans Success',
    props<{ payload: { urbans: Array<Urban>; total: number } }>()
);

export const selectUrban = createAction(
    '[WH/WH Coverage/Locations] Select Urban',
    props<{ payload: string }>()
);

export const deselectUrban = createAction('[WH/WH Coverage/Locations] Deselect Urban');

export const truncateUrbans = createAction('[WH/WH Coverage/Locations] Truncate Urbans');

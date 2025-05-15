import { createAction, props } from '@ngrx/store';
import { IErrorHandler, PaginateResponseV2, TStatus } from 'app/shared/models/global.model';
import { Branch, IQueryParamsBranchTeritory } from 'app/shared/models/branch.model';
import {
    BranchWarehouse,
    IQueryParamsBranchWarehouseTeritory,
} from 'app/shared/models/branch.model';
import { Region, IQueryParamsRegion } from 'app/shared/models';

// -----------------------------------------------------------------------------------------------------
// Fetch Teritory Region
// -----------------------------------------------------------------------------------------------------

export const fetchTeritoryRegionRequest = createAction(
    '[Teritory Regions API] Fetch Teritory Regions Request',
    props<{ payload: IQueryParamsRegion }>()
);

export const fetchTeritoryRegionFailure = createAction(
    '[Teritory Regions API] Fetch Teritory Regions Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchTeritoryRegionSuccess = createAction(
    '[Teritory Regions API] Fetch Teritory Regions Success',
    props<{ payload: PaginateResponseV2<Region> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Teritory Branches
// -----------------------------------------------------------------------------------------------------

export const fetchTeritoryBranchesRequest = createAction(
    '[Teritory Branches API] Fetch Teritory Branches Request',
    props<{ payload: IQueryParamsBranchTeritory }>()
);

export const fetchTeritoryBranchesFailure = createAction(
    '[Teritory Branches API] Fetch Teritory Branches Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchTeritoryBranchesSuccess = createAction(
    '[Teritory Branches API] Fetch Teritory Branches Success',
    props<{ payload: PaginateResponseV2<Branch> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Teritory Warehouses
// -----------------------------------------------------------------------------------------------------

export const fetchTeritoryWarehousesRequest = createAction(
    '[Teritory Warehouses API] Fetch Teritory Warehouses Request',
    props<{ payload: IQueryParamsBranchWarehouseTeritory }>()
);

export const fetchTeritoryWarehousesFailure = createAction(
    '[Teritory Warehouses API] Fetch Teritory Warehouses Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchTeritoryWarehousesSuccess = createAction(
    '[Teritory Warehouses API] Fetch Teritory Warehouses Success',
    props<{ payload: PaginateResponseV2<BranchWarehouse> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Teritory Warehouses
// -----------------------------------------------------------------------------------------------------

export const saveSelectedWarehouse = createAction(
    '[Teritory Action] Save Selected Warehouse',
    props<{ payload: BranchWarehouse[] }>()
);

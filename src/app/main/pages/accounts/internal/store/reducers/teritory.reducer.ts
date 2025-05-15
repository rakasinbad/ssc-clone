import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, PaginateResponse, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { TeritoryActions } from '../actions';
import { Branch, BranchWarehouse } from 'app/shared/models/branch.model';
import { Region } from 'app/shared/models';

export const FEATURE_KEY = 'teritories';

interface ErrorState extends EntityState<IErrorHandler> {}

export interface StateRegions extends EntityState<Region> {
    total: number;
    meta: Paginate;
}
export interface StateBranches extends EntityState<Branch> {
    total: number;
}
export interface StateWarehouses extends EntityState<BranchWarehouse> {
    total: number;
    meta: Paginate;
}
interface Paginate {
    page: number;
    perPage: number;
    total: number;
}
export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    source: TSource;
    regions: StateRegions;
    branches: StateBranches;
    warehouses: StateWarehouses;
    regionPaginate: Paginate;
    branchPaginate: Paginate;
    warehousePaginate: Paginate;
    selectedWarehouse: BranchWarehouse[];
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const initialPaginate: Paginate = {
    perPage: 10,
    page: 1,
    total: 0,
};
const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const adapterRegionsTeritory = createEntityAdapter<Region>({
    selectId: (row) => row.id,
});
const initialRegionsTeritoryState = adapterRegionsTeritory.getInitialState({
    total: 0,
    meta: initialPaginate,
});

const adapterBranchesTeritory = createEntityAdapter<Branch>({
    selectId: (row) => row.id,
});
const initialBranchesTeritoryState = adapterBranchesTeritory.getInitialState({
    total: 0,
});

const adapterWarehousesTeritory = createEntityAdapter<any>({
    selectId: (row) => row.id,
});
const initialWarehousesTeritoryState = adapterWarehousesTeritory.getInitialState({
    total: 0,
    meta: initialPaginate,
});

const adapterWarehousesPaginate = createEntityAdapter<Paginate>({});
const initialWarehousesPaginateState = adapterWarehousesPaginate.getInitialState({
    page: 1,
    perPage: 10,
    total: 0,
});

export const initialState: State = {
    isLoading: false,
    source: 'fetch',
    regions: initialRegionsTeritoryState,
    branches: initialBranchesTeritoryState,
    warehouses: initialWarehousesTeritoryState,
    regionPaginate: initialPaginate,
    branchPaginate: initialPaginate,
    warehousePaginate: initialPaginate,
    selectedWarehouse: [],
    errors: initialErrorState,
};

const internalReducer = createReducer(
    initialState,
    on(
        TeritoryActions.fetchTeritoryRegionRequest,
        TeritoryActions.fetchTeritoryBranchesRequest,
        TeritoryActions.fetchTeritoryWarehousesRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        TeritoryActions.fetchTeritoryRegionFailure,
        TeritoryActions.fetchTeritoryBranchesFailure,
        TeritoryActions.fetchTeritoryWarehousesFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors),
        })
    ),
    on(TeritoryActions.fetchTeritoryRegionSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        regions: adapterRegionsTeritory.addAll(payload.data, { ...state.regions }),
        regionPaginate: payload.meta,
        errors: adapterError.removeOne('fetchTeritoryRegionsFailure', state.errors),
    })),
    on(TeritoryActions.fetchTeritoryBranchesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        branches: adapterBranchesTeritory.addAll(payload.data, { ...state.branches }),
        branchPaginate: payload.meta,
        errors: adapterError.removeOne('fetchTeritoryBranchesFailure', state.errors),
    })),
    on(TeritoryActions.fetchTeritoryWarehousesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        warehouses: adapterWarehousesTeritory.addAll(payload.data, {
            ...state.warehouses,
            meta: payload.meta,
        }),
        warehousePaginate: payload.meta,
        errors: adapterError.removeOne('fetchTeritoryWarehousesFailure', state.errors),
    })),
    on(TeritoryActions.saveSelectedWarehouse, (state, { payload }) => {
        return {
            ...state,
            selectedWarehouse: payload,
        };
    })
);

export function reducer(state: State | undefined, action: Action): State {
    return internalReducer(state, action);
}

const getRegionsState = (state: State) => state.regions;
const getBranchesState = (state: State) => state.branches;
const getWarehousesState = (state: State) => state.warehouses;

export const {
    selectAll: selectAllRegions,
    selectEntities: selectRegionsEntities,
    selectIds: selectRegionsIds,
    selectTotal: selectRegionsTotal,
} = adapterRegionsTeritory.getSelectors(getRegionsState);

export const {
    selectAll: selectAllBranches,
    selectEntities: selectBranchesEntities,
    selectIds: selectBranchesIds,
    selectTotal: selectBranchesTotal,
} = adapterBranchesTeritory.getSelectors(getBranchesState);

export const {
    selectAll: selectAllWarehouses,
    selectEntities: selectWarehousesEntities,
    selectIds: selectWarehousesIds,
    selectTotal: selectWarehousesTotal,
} = adapterWarehousesTeritory.getSelectors(getWarehousesState);

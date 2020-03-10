import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from 'environments/environment';
import { SkuAssignments } from '../../models/sku-assignments.model';
import { SkuAssignmentsActions } from '../actions';
import { Catalogue } from 'app/main/pages/catalogues/models';

// Set reducer's feature key
export const FEATURE_KEY = 'skuAssignments';

// Store's SkuAssignments
interface _SkuAssignmentsState extends EntityState<SkuAssignments> {
    isLoading: boolean;
    limit: number;
    skip: number;
    total: number;
}

export const adapterSkuAssignments: EntityAdapter<SkuAssignments> = createEntityAdapter<
    SkuAssignments
>({
    selectId: skuAssignments => skuAssignments.id as string
});

// New SKU's Warehouse
interface NewCatalogueState extends EntityState<Catalogue> {
    selectedIds: Array<string>;
}
export const adapterNewCatalogue: EntityAdapter<Catalogue> = createEntityAdapter<Catalogue>({
    selectId: catalogue => catalogue.id as string
});

// Initial value for SkuAssignments State.
const initialSkuAssignmentsState: _SkuAssignmentsState = adapterSkuAssignments.getInitialState<
    Omit<_SkuAssignmentsState, 'ids' | 'entities'>
>({
    isLoading: false,
    total: 0,
    limit: environment.pageSize,
    skip: 0
});

const intialNewCatalogueState = adapterNewCatalogue.getInitialState({
    selectedIds: []
});

export interface SkuAssignmentsState {
    skuAssignment: _SkuAssignmentsState;
    newSku: NewCatalogueState;
}

const intialState: SkuAssignmentsState = {
    newSku: intialNewCatalogueState,
    skuAssignment: initialSkuAssignmentsState
};

// Create the reducer.
export const reducer = createReducer(
    intialState,
    /**
     * REQUEST STATES.
     */
    on(
        SkuAssignmentsActions.fetchSkuAssignmentsRequest,
        SkuAssignmentsActions.addSkuAssignmentsRequest,
        SkuAssignmentsActions.updateSkuAssignmentsRequest,
        SkuAssignmentsActions.removeSkuAssignmentsRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    /**
     * FAILURE STATES.
     */
    on(
        SkuAssignmentsActions.fetchSkuAssignmentsFailure,
        SkuAssignmentsActions.addSkuAssignmentsFailure,
        SkuAssignmentsActions.updateSkuAssignmentsFailure,
        SkuAssignmentsActions.removeSkuAssignmentsFailure,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    /**
     * FETCH SUCCESS STATE.
     */
    on(SkuAssignmentsActions.fetchSkuAssignmentsSuccess, (state, { payload }) => ({
        ...state,
        skuAssignment: adapterSkuAssignments.upsertMany(payload.data, {
            ...state.skuAssignment,
            total: payload.total
        })
    })),
    /**
     * ADD & UPDATE SUCCESS STATES.
     */
    on(
        SkuAssignmentsActions.addSkuAssignmentsSuccess,
        (state, { payload }) => {
            if (!payload) {
                return {
                    ...state,
                    skuAssignment: {
                        ...state.skuAssignment,
                        isLoading: false
                    }
                };
            } else {
                return {
                    ...state,
                    skuAssignment: adapterSkuAssignments.upsertOne(payload, {
                        ...state.skuAssignment,
                        isLoading: false,
                    })
                };
            }
        }
    ),
    on(
        SkuAssignmentsActions.updateSkuAssignmentsSuccess,
        (state, { payload }) => ({
            ...state,
            skuAssignment: adapterSkuAssignments.upsertOne(payload, {
                ...state.skuAssignment
            })
        })
    ),
    /**
     * REMOVE SUCCESS STATE.
     */
    on(SkuAssignmentsActions.removeSkuAssignmentsSuccess, (state, { payload }) => ({
        ...state,
        skuAssignment: adapterSkuAssignments.removeOne(payload.id, {
            ...state.skuAssignment
        })
    })),
    on(SkuAssignmentsActions.addSelectedCatalogues, (state, { payload }) => {
        const newCatalogues = (payload as Array<Catalogue>).map(store => {
            const nC = new Catalogue(store);
            nC.isSelected = true;
            return nC;
        });

        return {
            ...state,
            newSku: adapterNewCatalogue.upsertMany(newCatalogues, {
                ...state.newSku
            })
        };
    }),
    on(SkuAssignmentsActions.removeSelectedCatalogues, (state, { payload }) => ({
        ...state,
        newSku: adapterNewCatalogue.removeMany(payload, {
            ...state.newSku
        })
    })),
    on(SkuAssignmentsActions.markCatalogueAsRemovedFromWarehouse, (state, { payload }) => {
        const newStore = new Catalogue(state.newSku.entities[payload]);
        newStore.deletedAt = new Date().toISOString();

        return {
            ...state,
            newSku: adapterNewCatalogue.upsertOne(newStore, state.newSku)
        };
    }),
    on(SkuAssignmentsActions.markCataloguesAsRemovedFromWarehouse, (state, { payload }) => {
        const newStore: Array<Catalogue> = [];

        for (const storeId of payload) {
            const _store = new Catalogue(state.newSku.entities[storeId]);
            _store.deletedAt = new Date().toISOString();

            newStore.push(_store);
        }

        return {
            ...state,
            stores: adapterNewCatalogue.upsertMany(newStore, state.newSku)
        };
    }),
    on(SkuAssignmentsActions.abortCatalogueAsRemovedFromWarehouse, (state, { payload }) => {
        const newStore = new Catalogue(state.newSku.entities[payload]);
        newStore.deletedAt = null;

        return {
            ...state,
            stores: adapterNewCatalogue.upsertOne(newStore, state.newSku)
        };
    }),
    on(SkuAssignmentsActions.abortCataloguesAsRemovedFromWarehouse, (state, { payload }) => {
        const newStore: Array<Catalogue> = [];

        for (const storeId of payload) {
            const _store = new Catalogue(state.newSku.entities[storeId]);
            _store.deletedAt = null;

            newStore.push(_store);
        }

        return {
            ...state,
            stores: adapterNewCatalogue.upsertMany(newStore, state.newSku)
        };
    }),
    /**
     * RESET STATE.
     */
    on(SkuAssignmentsActions.resetSkuAssignments, () => intialState)
);

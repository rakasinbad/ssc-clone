import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from '../../../../../../../environments/environment';
import { Portfolio } from '../../models/portfolios.model';
import { PortfolioActions } from '../actions';
import { Store, StorePortfolio } from 'app/main/pages/attendances/models';

// Set reducer's feature key
export const featureKey = 'portfolios';

// Store's Portfolio
interface PortfolioNewStoreState extends EntityState<Store> {}
export const adapterPortfolioNewStore: EntityAdapter<Store> = createEntityAdapter<Store>({
    selectId: store => (store.id as string)
});

// Portfolio
interface PortfolioStoreState extends EntityState<Store> {
    isLoading: boolean;
    needRefresh: boolean;
    total: number;
}

export const adapterPortfolioStore: EntityAdapter<Store> = createEntityAdapter<Store>({
    selectId: store => (store.id as string)
});

// Initial value for Portfolio State.
const initialPortfolioStoreState = adapterPortfolioStore.getInitialState({
    isLoading: false,
    needRefresh: false,
    total: 0,
    limit: environment.pageSize,
    skip: 0,
    data: []
});

/**
 * Interface's state.
 */
export interface State extends EntityState<Portfolio> {
    isLoading: boolean;
    needRefresh: boolean;
    selectedIds: Array<string>;
    selectedInvoiceGroupId: string;
    urlExport: string;
    stores: PortfolioStoreState;
    newStores: PortfolioNewStoreState;
    total: number;
}

// Entity Adapter for the Entity State.
export const adapter: EntityAdapter<Portfolio> = createEntityAdapter<Portfolio>({
    selectId: portfolio => portfolio.id,
});

// Set the reducer's initial state.
export const initialState = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selectedIds: [],
    selectedInvoiceGroupId: null,
    urlExport: null,
    stores: initialPortfolioStoreState,
    newStores: adapterPortfolioNewStore.getInitialState(),
    total: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        PortfolioActions.createPortfolioRequest,
        PortfolioActions.patchPortfolioRequest,
        PortfolioActions.exportPortfoliosRequest,
        PortfolioActions.fetchPortfolioRequest,
        PortfolioActions.fetchPortfoliosRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        PortfolioActions.exportPortfoliosSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            urlExport: payload
        })
    ),
    on(
        PortfolioActions.createPortfolioFailure,
        (state) => ({
            ...state,
            isLoading: false
        })
    ),
    on(
        PortfolioActions.patchPortfolioFailure,
        (state) => ({
            ...state,
            isLoading: false
        })
    ),
    on(
        PortfolioActions.createPortfolioSuccess,
        (state) => ({
            ...state,
            isLoading: false
        })
    ),
    on(
        PortfolioActions.patchPortfolioSuccess,
        (state) => ({
            ...state,
            isLoading: false
        })
    ),
    on(
        PortfolioActions.fetchPortfolioSuccess,
        (state, { payload }) =>
            adapter.upsertOne(payload.portfolio, {
                ...state,
                isLoading: false
            })
    ),
    on(
        PortfolioActions.fetchPortfoliosSuccess,
        (state, { payload }) =>
            adapter.addAll(payload.portfolios, {
                ...state,
                isLoading: false,
                total: payload.total
            })
    ),
    on(
        PortfolioActions.fetchPortfolioStoresRequest,
        state => ({
            ...state,
            stores: {
                ...state.stores,
                isLoading: true
            }
        })
    ),
    on(
        PortfolioActions.fetchPortfolioStoresSuccess,
        (state, { payload }) => ({
            ...state,
            stores: adapterPortfolioStore.addAll(payload.stores, {
                ...state.stores,
                isLoading: false,
                total: payload.total
            })
        })
    ),
    on(
        PortfolioActions.setSelectedInvoiceGroup,
        (state, { payload }) => ({
            ...state,
            selectedInvoiceGroupId: payload
        })
    ),
    on(
        PortfolioActions.resetSelectedInvoiceGroup,
        (state) => ({
            ...state,
            selectedInvoiceGroupId: null
        })
    ),
    on(
        PortfolioActions.addSelectedStores,
        (state, { payload }) => {
            const newStores = (payload as Array<Store>).map(store => {
                const newStore = new Store(store);
                newStore.setSelectedStore = true;
                return newStore;
            });

            return {
                ...state,
                newStores: adapterPortfolioNewStore.upsertMany(newStores, {
                    ...state.newStores
                }),
            };
        }
    ),
    on(
        PortfolioActions.removeSelectedStores,
        (state, { payload }) => ({
            ...state,
            newStores: adapterPortfolioNewStore.removeMany(payload, {
                ...state.newStores
            })
        })
    ),
    on(
        PortfolioActions.addSelectedPortfolios,
        (state, { payload }) => {
            // Add the payload to state.
            state.selectedIds.push(...payload);

            // Create a Set to make sure all of the elements is unique.
            const set = new Set(state.selectedIds);
            // Convert to Array.
            state.selectedIds = Array.from<string>(set);

            // Return the new state.
            return state;
        }
    ),
    on(
        PortfolioActions.markStoreAsRemovedFromPortfolio,
        (state, { payload }) => {
            const newStore = new Store(state.stores.entities[payload]);
            newStore.setDeletedAt = new Date().toISOString();

            return {
                ...state,
                stores: adapterPortfolioStore.upsertOne(newStore, state.stores)
            };
        }
    ),
    on(
        PortfolioActions.abortStoreAsRemovedFromPortfolio,
        (state, { payload }) => {
            const newStore = new Store(state.stores.entities[payload]);
            newStore.setDeletedAt = null;

            return {
                ...state,
                stores: adapterPortfolioStore.upsertOne(newStore, state.stores)
            };
        }
    ),
    on(
        PortfolioActions.setSelectedPortfolios,
        (state, { payload }) => ({
            ...state,
            selectedIds: payload
        })
    ),
    on(
        PortfolioActions.truncateSelectedPortfolios,
        (state) => ({
            ...state,
            selectedIds: []
        })
    ),
    on(
        PortfolioActions.truncatePortfolioStores,
        (state) => ({
            ...state,
            stores: adapterPortfolioStore.removeAll({
                ...state.stores,
                total: 0
            }),
            newStores: adapterPortfolioNewStore.removeAll(state.newStores),
        })
    ),
    on(
        PortfolioActions.truncatePortfolios,
        state => adapter.removeAll(state)
    )
);

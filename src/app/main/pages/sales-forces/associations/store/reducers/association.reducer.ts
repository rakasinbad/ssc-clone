import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Association } from '../../models';
import { AssociationActions } from '../actions';
import { SalesRep } from '../../../sales-reps/models';
import { InvoiceGroup } from 'app/shared/models';

// Keyname for reducer
const featureKey = 'associations';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Association>}
 */
interface State extends EntityState<Association> {
    isRefresh?: boolean;
    isRequesting: boolean;
    isLoading: boolean;
    selectedId: string;
    selectedSalesRep: SalesRep;
    selectedInvoiceGroup: InvoiceGroup;
    portfolioType: string;
    textSearch: string;
    total: number;
}

// Adapter for Association state
const adapter = createEntityAdapter<Association>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRequesting: false,
    selectedId: null,
    selectedSalesRep: null,
    selectedInvoiceGroup: null,
    portfolioType: 'inside',
    textSearch: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(
        AssociationActions.createAssociationRequest,
        state => ({
            ...state,
            isRequesting: true
        })
    ),
    on(
        AssociationActions.createAssociationFailure,
        AssociationActions.createAssociationSuccess,
        state => ({
            ...state,
            isRequesting: false
        })
    ),
    on(
        AssociationActions.fetchAssociationRequest,
        AssociationActions.fetchAssociationsRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        AssociationActions.fetchAssociationFailure,
        AssociationActions.fetchAssociationsFailure,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    on(AssociationActions.fetchAssociationSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(AssociationActions.setSelectedSalesRep, (state, { payload }) => ({
        ...state,
        selectedSalesRep: payload
    })),
    on(AssociationActions.setSelectedInvoiceGroup, (state, { payload }) => ({
        ...state,
        selectedInvoiceGroup: payload
    })),
    on(AssociationActions.setPortfolioEntityType, (state, { payload }) => ({
        ...state,
        portfolioType: payload
    })),
    on(AssociationActions.setSearchValue, (state, { payload }) => ({
        ...state,
        textSearch: payload
    })),
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };

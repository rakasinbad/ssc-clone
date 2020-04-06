import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from 'environments/environment';
import { FlexiCombo } from '../../models/flexi-combo.model';
import { FlexiComboActions } from '../actions';

// Set reducer's feature key
export const FEATURE_KEY = 'flexiCombo';

// Store's FlexiCombo
interface FlexiComboInternalState extends EntityState<FlexiCombo> {
    isLoading: boolean;
    limit: number;
    skip: number;
    total: number;
}

export const adapterFlexiCombo: EntityAdapter<FlexiCombo> = createEntityAdapter<FlexiCombo>({
    selectId: flexiCombo => flexiCombo.id as string
});

// Initial value for FlexiCombo State.
const initialFlexiComboState: FlexiComboInternalState = adapterFlexiCombo.getInitialState<
    Omit<FlexiComboInternalState, 'ids' | 'entities'>
>({
    isLoading: false,
    total: 0,
    limit: environment.pageSize,
    skip: 0
});

export interface FlexiComboState {
    flexiCombo: FlexiComboInternalState;
}

const intialState: FlexiComboState = {
    flexiCombo: initialFlexiComboState
};

// Create the reducer.
export const reducer = createReducer(
    intialState,
    /**
     * REQUEST STATES.
     */
    on(
        FlexiComboActions.fetchFlexiComboRequest,
        FlexiComboActions.addFlexiComboRequest,
        FlexiComboActions.updateFlexiComboRequest,
        FlexiComboActions.removeFlexiComboRequest,
        state => ({
            ...state,
            flexiCombo: {
                ...state.flexiCombo,
                isLoading: true
            }
        })
    ),
    /**
     * FAILURE STATES.
     */
    on(
        FlexiComboActions.fetchFlexiComboFailure,
        FlexiComboActions.addFlexiComboFailure,
        FlexiComboActions.updateFlexiComboFailure,
        FlexiComboActions.removeFlexiComboFailure,
        state => ({
            ...state,
            skuAssignment: {
                ...state.flexiCombo,
                isLoading: false
            }
        })
    ),
    /**
     * FETCH SUCCESS STATE.
     */
    on(FlexiComboActions.fetchFlexiComboSuccess, (state, { payload }) => ({
        ...state,
        skuAssignment: adapterFlexiCombo.upsertMany(payload.data, {
            ...state.flexiCombo,
            total: payload.total
        })
    })),
    /**
     * RESET STATE.
     */
    on(FlexiComboActions.resetFlexiCombo, () => intialState)
);

import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from 'environments/environment';
import { SkuAssignments } from '../../models/sku-assignments.model';
import { SkuAssignmentsActions } from '../actions';

// Set reducer's feature key
export const FEATURE_KEY = 'skuAssignments';

// Store's SkuAssignments
export interface SkuAssignmentsState extends EntityState<SkuAssignments> {
    isLoading: boolean;
    limit: number;
    skip: number;
    total: number;
}

export const adapterSkuAssignments: EntityAdapter<SkuAssignments> = createEntityAdapter<SkuAssignments>({
    selectId: skuAssignments => (skuAssignments.id as string)
});

// Initial value for SkuAssignments State.
const initialSkuAssignmentsState = adapterSkuAssignments.getInitialState({
    isLoading: false,
    total: 0,
    limit: environment.pageSize,
    skip: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialSkuAssignmentsState,
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
    on(
        SkuAssignmentsActions.fetchSkuAssignmentsSuccess,
        (state, { payload }) =>
            adapterSkuAssignments.upsertMany(payload.data, {
                ...state,
                isLoading: false,
                total: payload.total
            })
    ),
    /**
     * ADD & UPDATE SUCCESS STATES.
     */
    on(
        SkuAssignmentsActions.addSkuAssignmentsSuccess,
        SkuAssignmentsActions.updateSkuAssignmentsSuccess,
        (state, { payload }) =>
            adapterSkuAssignments.upsertOne(payload, {
                ...state,
                isLoading: false,
            })
    ),
    /**
     * REMOVE SUCCESS STATE.
     */
    on(
        SkuAssignmentsActions.removeSkuAssignmentsSuccess,
        (state, { payload }) =>
            adapterSkuAssignments.removeOne(payload.id, {
                ...state,
                isLoading: false,
            })
    ),
    /**
     * RESET STATE.
     */
    on(
        SkuAssignmentsActions.resetSkuAssignments,
        (state) => adapterSkuAssignments.removeAll(state)
    ),
);

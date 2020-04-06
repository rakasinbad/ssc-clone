import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from 'environments/environment';
import { PeriodTargetPromo } from '../../models/period-target-promo.model';
import { PeriodTargetPromoActions } from '../actions';

// Set reducer's feature key
export const FEATURE_KEY = 'periodTargetPromo';

// Store's PeriodTargetPromo
export interface PeriodTargetPromoState extends EntityState<PeriodTargetPromo> {
    isLoading: boolean;
    limit: number;
    skip: number;
    total: number;
}

export const adapterPeriodTargetPromo: EntityAdapter<PeriodTargetPromo> = createEntityAdapter<PeriodTargetPromo>({
    selectId: periodTargetPromo => periodTargetPromo.id as string
});

// Initial value for PeriodTargetPromo State.
const initialPeriodTargetPromoState: PeriodTargetPromoState = adapterPeriodTargetPromo.getInitialState<Omit<PeriodTargetPromoState, 'ids' | 'entities'>>({
    isLoading: false,
    total: 0,
    limit: environment.pageSize,
    skip: 0
});

// Create the reducer.
export const reducer = createReducer(
    initialPeriodTargetPromoState,
    /**
     * REQUEST STATES.
     */
    on(
        PeriodTargetPromoActions.fetchPeriodTargetPromoRequest,
        // PeriodTargetPromoActions.addPeriodTargetPromoRequest,
        PeriodTargetPromoActions.updatePeriodTargetPromoRequest,
        PeriodTargetPromoActions.removePeriodTargetPromoRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    /**
     * FAILURE STATES.
     */
    on(
        PeriodTargetPromoActions.fetchPeriodTargetPromoFailure,
        // PeriodTargetPromoActions.addPeriodTargetPromoFailure,
        PeriodTargetPromoActions.updatePeriodTargetPromoFailure,
        PeriodTargetPromoActions.removePeriodTargetPromoFailure,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    /**
     * FETCH SUCCESS STATE.
     */
    on(PeriodTargetPromoActions.fetchPeriodTargetPromoSuccess, (state, { payload }) =>
        adapterPeriodTargetPromo.upsertMany(payload.data, {
            ...state,
            total: payload.total,
            isLoading: false,
        })
    ),
    /**
     * RESET STATE.
     */
    on(PeriodTargetPromoActions.resetPeriodTargetPromo, () => initialPeriodTargetPromoState)
);

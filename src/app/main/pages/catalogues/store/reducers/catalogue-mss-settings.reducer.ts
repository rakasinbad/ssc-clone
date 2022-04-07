import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { CatalogueMssSettingsSegmentation } from '../../models';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { CatalogueMssSettingsActions } from '../actions';

export const FEATURE_KEY = 'catalogueMssSettings';

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

interface SegmentationState extends EntityState<CatalogueMssSettingsSegmentation> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    segmentations: SegmentationState;
    source: TSource;
    errors: ErrorState;
}

/**
 * MssSettingsSegmentation STATE
 */
export const adapterSegmentations: EntityAdapter<CatalogueMssSettingsSegmentation> = createEntityAdapter<CatalogueMssSettingsSegmentation>({
    selectId: MssSettingsSegmentation => MssSettingsSegmentation.id
});
const initialSegmentationstate = adapterSegmentations.getInitialState({ total: 0 });

/**
 * ERROR STATE
 */
const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    source: 'fetch',
    segmentations: initialSegmentationstate,
    errors: initialErrorState
};

const mssSettingsReducer = createReducer(
    /**
     *  ===================================================================
     *  INITIAL STATE
     *  ===================================================================
     */

    initialState,
    /**
     *  ===================================================================
     *  REQUESTS
     *  ===================================================================
     */

    on(CatalogueMssSettingsActions.fetchSegmentationsRequest, state => ({
        ...state,
        isLoading: true
    })),
    /**
     *  ===================================================================
     *  FAILURES
     *  ===================================================================
     */

    on(CatalogueMssSettingsActions.fetchSegmentationsFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    /**
     *  ===================================================================
     *  SUCCESSES
     *  ===================================================================
     */

    on(CatalogueMssSettingsActions.fetchSegmentationsSuccess, (state, { data, total }) => ({
        ...state,
        isLoading: false,
        segmentations: adapterSegmentations.addAll(data, {
            ...state.segmentations,
            total
        }),
        errors: adapterError.removeOne('fetchSegmentationsFailure', state.errors)
    }))
    /**
     *  ===================================================================
     *  ERRORS
     *  ===================================================================
     */
);

export function reducer(state: State | undefined, action: Action): State {
    return mssSettingsReducer(state, action);
}

const getListSegmentationState = (state: State) => state.segmentations;

export const {
    selectAll: selectAllSegmentations,
    selectEntities: selectSegmentationsEntities,
    selectIds: selectSegmentationIds,
    selectTotal: selectSegmentationsTotal
} = adapterSegmentations.getSelectors(getListSegmentationState);

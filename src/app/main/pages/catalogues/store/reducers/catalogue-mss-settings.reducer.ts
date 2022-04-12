import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { CatalogueMssSettings, CatalogueMssSettingsSegmentation, ResponseUpsertMssSettings, MssBaseSupplier } from '../../models';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { CatalogueMssSettingsActions } from '../actions';

export const FEATURE_KEY = 'catalogueMssSettings';

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

interface MssSettingsState extends EntityState<CatalogueMssSettings> {
    total: number;
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
    mssSettings: MssSettingsState;
    responseUpsert: ResponseUpsertMssSettings;
    mssBase: MssBaseSupplier;
}

/**
 * MssSettingsSegmentation STATE
 */
export const adapterSegmentations: EntityAdapter<CatalogueMssSettingsSegmentation> = createEntityAdapter<CatalogueMssSettingsSegmentation>({
    selectId: MssSettingsSegmentation => MssSettingsSegmentation.id
});
const initialSegmentationState = adapterSegmentations.getInitialState({ total: 0 });

/**
 * MSsSettings STATE
 */
 export const adapterMssSettings: EntityAdapter<CatalogueMssSettings> = createEntityAdapter<CatalogueMssSettings>({
    selectId: MssSettings => MssSettings.referenceId
});
const initialMssSetttingsState = adapterMssSettings.getInitialState({ total: 0 });

/**
 * ERROR STATE
 */
const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    source: 'fetch',
    segmentations: initialSegmentationState,
    errors: initialErrorState,
    mssSettings: initialMssSetttingsState,
    responseUpsert: null,
    mssBase: null,
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

    on(CatalogueMssSettingsActions.fetchRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(CatalogueMssSettingsActions.upsertRequest, (state, data) => ({
        ...state,
        isLoading: true
    })),
    on(CatalogueMssSettingsActions.fetchSegmentationsRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(CatalogueMssSettingsActions.fetchMssBaseRequest, state => ({
        ...state,
        isLoading: true
    })),
    /**
     *  ===================================================================
     *  FAILURES
     *  ===================================================================
     */
    on(CatalogueMssSettingsActions.fetchFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(CatalogueMssSettingsActions.upsertFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors),
    })),
    on(CatalogueMssSettingsActions.fetchSegmentationsFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(CatalogueMssSettingsActions.fetchMssBaseFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    /**
     *  ===================================================================
     *  SUCCESSES
     *  ===================================================================
     */
    on(CatalogueMssSettingsActions.fetchSuccess, (state, { data, total }) => ({
        ...state,
        isLoading: false,
        mssSettings: adapterMssSettings.addAll(data, {
            ...state.mssSettings,
            total
        }),
        errors: adapterError.removeOne('fetchFailure', state.errors)
    })),
    on(CatalogueMssSettingsActions.upsertSuccess, (state, data) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('upsertFailure', state.errors)
    })),
    on(CatalogueMssSettingsActions.fetchSegmentationsSuccess, (state, { data, total }) => ({
        ...state,
        isLoading: false,
        segmentations: adapterSegmentations.addAll(data, {
            ...state.segmentations,
            total
        }),
        errors: adapterError.removeOne('fetchSegmentationsFailure', state.errors)
    })),
    on(CatalogueMssSettingsActions.fetchMssBaseSuccess, (state, { data }) => ({
        ...state,
        isLoading: false,
        mssBase: data,
        errors: adapterError.removeOne('fetchMssBaseFailure', state.errors)
    })),
    /**
     *  ===================================================================
     *  OTHER
     *  ===================================================================
     */
    on(CatalogueMssSettingsActions.updateDataMssSettings, (state, { data, }) => ({
        ...state,
        mssSettings: adapterMssSettings.addAll(data, { 
            ...state.mssSettings
        })
    })),
);

export function reducer(state: State | undefined, action: Action): State {
    return mssSettingsReducer(state, action);
}

const getListMssSettingsState = (state: State) => state.mssSettings;
export const {
    selectAll: selectAllMssSettings,
    selectEntities: selectMssSettingsEntities,
    selectIds: selectMssSettingIds,
    selectTotal: selectMssSettingsTotal
} = adapterMssSettings.getSelectors(getListMssSettingsState);

const getListSegmentationState = (state: State) => state.segmentations;
export const {
    selectAll: selectAllSegmentations,
    selectEntities: selectSegmentationsEntities,
    selectIds: selectSegmentationIds,
    selectTotal: selectSegmentationsTotal
} = adapterSegmentations.getSelectors(getListSegmentationState);

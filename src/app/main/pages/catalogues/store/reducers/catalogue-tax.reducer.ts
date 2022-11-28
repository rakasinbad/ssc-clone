import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { CatalogueTaxActions } from '../actions';
import { CatalogueTax } from './../../models/classes/catalogue-tax.class';

export const catalogueTaxFeatureKey = 'catalogueTax';

export interface State extends EntityState<CatalogueTax> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

export interface FeatureState extends fromRoot.State {
    [catalogueTaxFeatureKey]: State | undefined;
}

export const adapter = createEntityAdapter<CatalogueTax>({ selectId: (row) => row.id });

export const initialState: State = adapter.getInitialState({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0,
});

const reducerFn = createReducer(
    initialState,
    on(CatalogueTaxActions.fetchRequest, (state) => ({ ...state, isLoading: true })),
    on(CatalogueTaxActions.fetchSuccess, (state, { data, total }) =>
        adapter.addAll(data, { ...state, isLoading: false, total })
    ),
    on(CatalogueTaxActions.fetchFailure, (state) => ({ ...state, isLoading: false }))
);

export const reducer = (state: State | undefined, action: Action): State => {
    return reducerFn(state, action);
};

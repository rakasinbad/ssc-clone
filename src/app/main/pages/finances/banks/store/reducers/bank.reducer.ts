import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

export const FEATURE_KEY = 'banks';

interface BankState extends EntityState<any> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    selectedBankId: string | number;
    source: TSource;
    banks: BankState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterBank = createEntityAdapter<any>({
    selectId: bank => bank.id
});
const initialBankState = adapterBank.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    selectedBankId: null,
    source: 'fetch',
    banks: initialBankState,
    errors: initialErrorState
};

const bankReducer = createReducer(initialState);

export function reducer(state: State | undefined, action: Action): State {
    return bankReducer(state, action);
}

const getListBankState = (state: State) => state.banks;

export const {
    selectAll: selectAllBank,
    selectEntities: selectBankEntities,
    selectIds: selectBankIds,
    selectTotal: selectBankTotal
} = adapterBank.getSelectors(getListBankState);

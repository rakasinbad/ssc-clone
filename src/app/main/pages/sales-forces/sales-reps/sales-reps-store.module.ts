import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SalesRepEffects } from './store/effects';
import * as fromSalesReps from './store/reducers';

// import { fromSalesRep } from './store/reducers';

// interface SalesRepsState {
//     [fromSalesRep.FEATURE_KEY]: fromSalesRep.State;
// }

// interface State extends fromRoot.State {
//     [fromSalesRep.FEATURE_KEY]: SalesRepsState;
// }

// export function reducers(state: SalesRepsState | undefined, action: Action): SalesRepsState {
//     return combineReducers({
//         [fromSalesRep.FEATURE_KEY]: fromSalesRep.reducer
//     })(state, action);
// }

// export const FEATURE_REDUCER_TOKEN = new InjectionToken<ActionReducerMap<SalesRepsState>>(
//     'Sales Rep Reducer',
//     {
//         factory: () => ({
//             [fromSalesRep.FEATURE_KEY]: fromSalesRep.reducer
//         })
//     }
// );

@NgModule({
    declarations: [],
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromSalesReps.featureKey, fromSalesReps.reducers),
        EffectsModule.forFeature([SalesRepEffects])
    ]
})
export class SalesRepsStoreModule {}

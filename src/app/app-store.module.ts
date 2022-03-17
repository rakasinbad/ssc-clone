import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { MetaReducer, StoreModule, USER_PROVIDED_META_REDUCERS } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'environments/environment';
import * as LogRocket from 'logrocket';
import createNgrxMiddleware from 'logrocket-ngrx';

import { AuthEffects } from './main/pages/core/auth/store/effects/auth.effects';
import {
    // DropdownEffects,
    NetworkEffects,
    PortfolioEffects,
    StockManagementReasonEffects,
    TeamEffects,
    TemperatureEffects,
    UiEffects,
    WarehouseEffects,
    WarehouseValueEffects
} from './shared/store/effects';
import * as fromRoot from './store/app.reducer';
import { CustomSerializer } from './store/custom-serializer';

const logrocketMiddleware = createNgrxMiddleware(LogRocket);

export function getMetaReducers(): MetaReducer<fromRoot.State>[] {
    return fromRoot.metaReducers.concat([logrocketMiddleware]);
}

@NgModule({
    imports: [
        StoreModule.forRoot(fromRoot.appReducer, {
            metaReducers: fromRoot.metaReducers
            // runtimeChecks: {
            //     strictStateImmutability: true,
            //     strictActionImmutability: true,
            //     strictStateSerializability: true,
            //     strictActionSerializability: true
            // }
        }),
        EffectsModule.forRoot([
            AuthEffects,
            // DropdownEffects,
            NetworkEffects,
            PortfolioEffects,
            StockManagementReasonEffects,
            TeamEffects,
            TemperatureEffects,
            UiEffects,
            WarehouseEffects,
            WarehouseValueEffects
        ]),
        environment.production || environment.staging
            ? []
            : StoreDevtoolsModule.instrument({
                  name: 'NgRx Sinbad Seller Center'
              }),
        // environment.production
        //     ? []
        //     : StoreDevtoolsModule.instrument({
        //           name: 'NgRx Sinbad Seller Center',
        //           logOnly: environment.production
        //       }),
        StoreRouterConnectingModule.forRoot({
            stateKey: 'router',
            serializer: CustomSerializer
            // routerState: RouterState.Minimal
        })
    ],
    providers: [
        {
            provide: USER_PROVIDED_META_REDUCERS,
            useFactory: getMetaReducers
        }
    ]
})
export class AppStoreModule {}

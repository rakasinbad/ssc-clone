import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'environments/environment';

import { AuthEffects } from './main/pages/core/auth/store/effects/auth.effects';
import { DropdownEffects } from './shared/store/effects/dropdown.effects';
import { NetworkEffects } from './shared/store/effects/network.effects';
import * as fromRoot from './store/app.reducer';
import { CustomSerializer } from './store/custom-serializer';

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
        EffectsModule.forRoot([AuthEffects, NetworkEffects, DropdownEffects]),
        environment.production
            ? StoreDevtoolsModule.instrument({
                  name: 'Sinbad Seller Center',
                  logOnly: environment.production,
                  maxAge: 25
              })
            : StoreDevtoolsModule.instrument({
                  name: 'NgRx Sinbad Seller Center',
                  logOnly: environment.production
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
    ]
})
export class AppStoreModule {}

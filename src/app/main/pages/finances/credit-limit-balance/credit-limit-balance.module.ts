import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SingleSpaModule } from 'single-spa/single-spa.module';

import { CreditLimitBalanceRoutingModule } from './credit-limit-balance-routing.module';
import { CreditLimitBalanceComponent } from './credit-limit-balance.component';
import { CreditLimitGroupFormComponent } from './credit-limit-group-form/credit-limit-group-form.component';
import { CreditLimitGroupComponent } from './credit-limit-group/credit-limit-group.component';
import { CreditStoreFormComponent } from './credit-store-form/credit-store-form.component';
import { CreditStoresComponent } from './credit-stores/credit-stores.component';
import { CreditLimitBalanceEffects } from './store/effects';
import { fromCreditLimitBalance } from './store/reducers';

/**
 *
 *
 * @export
 * @class CreditLimitBalanceModule
 */
@NgModule({
    declarations: [
        CreditLimitBalanceComponent,
        CreditStoresComponent,
        CreditStoreFormComponent,
        CreditLimitGroupComponent,
        CreditLimitGroupFormComponent
    ],
    imports: [
        CreditLimitBalanceRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromCreditLimitBalance.FEATURE_KEY, fromCreditLimitBalance.reducer),
        EffectsModule.forFeature([CreditLimitBalanceEffects]),
        SingleSpaModule
    ],
    entryComponents: [CreditStoreFormComponent, CreditLimitGroupFormComponent]
})
export class CreditLimitBalanceModule {}

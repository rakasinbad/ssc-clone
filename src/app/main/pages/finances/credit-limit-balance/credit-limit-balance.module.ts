import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { CreditLimitBalanceRoutingModule } from './credit-limit-balance-routing.module';
import { CreditLimitBalanceComponent } from './credit-limit-balance.component';
import { CreditStoreFormComponent } from './credit-store-form/credit-store-form.component';
import { CreditStoresComponent } from './credit-stores/credit-stores.component';
import { fromCreditLimitBalance } from './store/reducers';
import { CreditLimitGroupComponent } from './credit-limit-group/credit-limit-group.component';
import { CreditLimitGroupFormComponent } from './credit-limit-group-form/credit-limit-group-form.component';

/**
 *
 *
 * @export
 * @class CreditLimitBalanceModule
 */
@NgModule({
    declarations: [CreditLimitBalanceComponent, CreditStoresComponent, CreditStoreFormComponent, CreditLimitGroupComponent, CreditLimitGroupFormComponent],
    imports: [
        CreditLimitBalanceRoutingModule,

        SharedModule,
        MaterialModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromCreditLimitBalance.FEATURE_KEY, fromCreditLimitBalance.reducer),
        EffectsModule.forFeature([])
    ],
    entryComponents: [CreditStoreFormComponent, CreditLimitGroupFormComponent]
})
export class CreditLimitBalanceModule {}

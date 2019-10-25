import { AgmCoreModule } from '@agm/core';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AccountDetailComponent } from './account-detail/account-detail.component';
import { AccountFormComponent } from './account-form/account-form.component';
import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AccountEffects } from './store/effects/account.effects';
import * as fromAccount from './store/reducers/account.reducer';

/**
 *
 *
 * @export
 * @class AccountsModule
 */
@NgModule({
    declarations: [AccountsComponent, AccountFormComponent, AccountDetailComponent],
    imports: [
        AccountsRoutingModule,

        SharedModule,
        MaterialModule,

        AgmCoreModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild()

        // StoreModule.forFeature(fromAccount.FEATURE_KEY, fromAccount.reducer),
        // EffectsModule.forFeature([AccountEffects])
    ]
})
export class AccountsModule {}

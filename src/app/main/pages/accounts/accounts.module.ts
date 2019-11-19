import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AccountsRoutingModule } from './accounts-routing.module';

// import { AccountDetailComponent } from './account-detail/account-detail.component';
// import { AccountFormComponent } from './account-form/account-form.component';
// import { AccountsComponent } from './accounts.component';

// import * as fromAccount from './store/reducers/account.reducer';

/**
 *
 *
 * @export
 * @class AccountsModule
 */
@NgModule({
    declarations: [],
    imports: [
        AccountsRoutingModule,

        SharedModule,
        MaterialModule,

        // AgmCoreModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild()

        // StoreModule.forFeature(fromAccount.FEATURE_KEY, fromAccount.reducer),
        // EffectsModule.forFeature([AccountEffects])
    ]
})
export class AccountsModule {}

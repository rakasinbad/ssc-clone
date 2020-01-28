import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AccountsRoutingModule } from './accounts-routing.module';

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
    ]
})
export class AccountsModule {}

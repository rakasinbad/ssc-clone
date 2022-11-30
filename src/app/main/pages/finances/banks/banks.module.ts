import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { BankFormComponent } from './bank-form/bank-form.component';
import { BanksRoutingModule } from './banks-routing.module';
import { BanksComponent } from './banks.component';
import { fromBank } from './store/reducers';

/**
 *
 *
 * @export
 * @class BanksModule
 */
@NgModule({
    declarations: [BanksComponent, BankFormComponent],
    imports: [
        BanksRoutingModule,

        SharedModule,
        MaterialModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromBank.FEATURE_KEY, fromBank.reducer),
        EffectsModule.forFeature([])
    ],
    entryComponents: [BankFormComponent]
})
export class BanksModule {}

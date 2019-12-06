import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AccountsSettingsRoutingModule } from './accounts-settings.routes';
import { AccountsSettingsComponent } from './accounts-settings.component';
import { SelfInformationComponent } from './components/self-information/self-information.component';
import { PasswordComponent } from './components/password/password.component';

import { AccountsSettingsEffects } from './store/effects';
import { fromSettings } from './store/reducers';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { VerifyPasswordComponent } from './components/verify-password/verify-password.component';

@NgModule({
    declarations: [
        AccountsSettingsComponent,
        SelfInformationComponent,
        PasswordComponent,
        VerifyPasswordComponent
    ],
    imports: [
        AccountsSettingsRoutingModule,

        SharedModule,
        MaterialModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromSettings.FEATURE_KEY, fromSettings.reducer),
        EffectsModule.forFeature([
            AccountsSettingsEffects
        ])
    ],
    entryComponents: [
        SelfInformationComponent,
        PasswordComponent,
        VerifyPasswordComponent
    ]
})
export class AccountsSettingsModule { }

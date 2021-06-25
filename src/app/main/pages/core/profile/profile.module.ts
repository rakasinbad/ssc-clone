import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { ProfileEffects } from './store/effects';
import { fromProfile } from './store/reducers';
import { CompanyInformationComponent } from './components/company-information/company-information.component';
import { CompanyAddressComponent } from './components/company-address/company-address.component';
import { LegalInformationComponent } from './components/legal-information/legal-information.component';
import { CompanyAddressFormComponent } from './components/company-address-form/company-address-form.component';

/**
 *
 *
 * @export
 * @class ProfileModule
 */
@NgModule({
    declarations: [ProfileComponent, CompanyInformationComponent, CompanyAddressComponent, LegalInformationComponent, CompanyAddressFormComponent],
    imports: [
        ProfileRoutingModule,
        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromProfile.FEATURE_KEY, fromProfile.reducer),
        EffectsModule.forFeature([ProfileEffects])
    ]
})
export class ProfileModule {}

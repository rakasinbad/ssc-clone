import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { ProfileEffects } from './store/effects';
import { fromProfile } from './store/reducers';

/**
 *
 *
 * @export
 * @class ProfileModule
 */
@NgModule({
    declarations: [ProfileComponent],
    imports: [
        ProfileRoutingModule,
        SharedModule,
        MaterialModule,

        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromProfile.FEATURE_KEY, fromProfile.reducer),
        EffectsModule.forFeature([ProfileEffects])
    ]
})
export class ProfileModule {}

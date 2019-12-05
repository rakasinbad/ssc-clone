import { NgModule } from '@angular/core';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';

@NgModule({
    declarations: [ProfileComponent],
    imports: [ProfileRoutingModule, SharedModule, MaterialModule]
})
export class ProfileModule {}

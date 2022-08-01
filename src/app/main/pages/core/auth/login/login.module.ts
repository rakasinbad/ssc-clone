import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MaterialModule } from 'app/shared/material.module';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { SingleSpaModule } from 'single-spa/single-spa.module';

@NgModule({
    declarations: [LoginComponent],
    imports: [LoginRoutingModule, MaterialModule, FuseSharedModule, SingleSpaModule]
})
export class LoginModule {}

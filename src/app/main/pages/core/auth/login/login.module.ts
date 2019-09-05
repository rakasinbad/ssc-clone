import { NgModule } from '@angular/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { SignInRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

@NgModule({
    declarations: [LoginComponent],
    imports: [SignInRoutingModule, FuseSharedModule]
})
export class LoginModule {}

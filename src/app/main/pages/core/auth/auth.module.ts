import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
    imports: [AuthRoutingModule, SharedModule]
})
export class AuthModule {}

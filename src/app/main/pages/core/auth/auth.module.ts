import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from 'app/shared/shared.module';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthEffects } from './store/effects/auth.effects';

@NgModule({
    imports: [AuthRoutingModule, SharedModule]
})
export class AuthModule {}

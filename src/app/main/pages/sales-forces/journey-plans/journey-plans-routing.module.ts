import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JourneyPlansComponent } from './journey-plans.component';
import { AuthGuard } from '../../core/auth/auth.guard';

const routes: Routes = [{ path: '', component: JourneyPlansComponent, canActivate: [AuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class JourneyPlansRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { JourneyPlanV2Component } from './journey-plansv2.component';

const routes: Routes = [{ path: '', component: JourneyPlanV2Component, canActivate: [AuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class JourneyPlanV2RoutingModule {}

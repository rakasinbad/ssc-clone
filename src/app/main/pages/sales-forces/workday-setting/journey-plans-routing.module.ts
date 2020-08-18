import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/auth/auth.guard';
import { JourneyPlanFormComponent } from './journey-plan-form';
import { JourneyPlansComponent } from './journey-plans.component';

const routes: Routes = [
    { path: '', component: JourneyPlansComponent, canActivate: [AuthGuard] },
    { path: ':id', component: JourneyPlanFormComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class JourneyPlansRoutingModule {}

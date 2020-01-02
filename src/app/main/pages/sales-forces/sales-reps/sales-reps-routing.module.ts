import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/auth/auth.guard';
import { SalesRepDetailComponent } from './sales-rep-detail/sales-rep-detail.component';
import { SalesRepFormComponent } from './sales-rep-form';
import { SalesRepsComponent } from './sales-reps.component';

const routes: Routes = [
    { path: '', component: SalesRepsComponent, canActivate: [AuthGuard] },
    { path: ':id', component: SalesRepFormComponent, canActivate: [AuthGuard] },
    { path: ':id/detail', component: SalesRepDetailComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesRepsRoutingModule {}

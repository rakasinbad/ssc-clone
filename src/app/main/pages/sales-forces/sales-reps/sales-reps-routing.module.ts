import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/auth/auth.guard';
import { SalesRepFormComponent } from './sales-rep-form/sales-rep-form.component';
import { SalesRepsComponent } from './sales-reps.component';

const routes: Routes = [
    { path: '', component: SalesRepsComponent, canActivate: [AuthGuard] },
    { path: ':id', component: SalesRepFormComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesRepsRoutingModule {}

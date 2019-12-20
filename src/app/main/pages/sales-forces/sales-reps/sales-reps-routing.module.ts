import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesRepsComponent } from './sales-reps.component';

const routes: Routes = [{ path: '', component: SalesRepsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRepsRoutingModule { }

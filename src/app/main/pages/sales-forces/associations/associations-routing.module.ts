import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssociationsComponent } from './associations.component';

const routes: Routes = [{ path: '', component: AssociationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssociationsRoutingModule { }

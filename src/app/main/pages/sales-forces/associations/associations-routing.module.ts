import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssociationsComponent } from './associations.component';
import { AssociationsFormComponent } from './pages/associations-form/associations-form.component';

const routes: Routes = [
    { path: '', component: AssociationsComponent },
    { path: 'add', component: AssociationsFormComponent },
    // { path: ':id/edit', component: AssociationsFormComponent }
    // { path: ':id/detail', component: AssociationsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssociationsRoutingModule {}

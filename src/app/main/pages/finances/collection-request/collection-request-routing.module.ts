import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../../core/auth/auth.guard';
import { CollectionRequestComponent } from './collection-request.component';

const routes: Routes = [
    { 
        path: '',
        component: CollectionRequestComponent,
        canActivate: [AuthGuard],
        runGuardsAndResolvers: 'always',
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CollectionRequestRoutingModule {}

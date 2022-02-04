// Angular Core Libraries.
import { NgModule } from '@angular/core';

// Angular Routing Libraries
import { Routes, RouterModule } from '@angular/router';

// NgxPermissions Libraries.
import { NgxPermissionsGuard } from 'ngx-permissions';

// Auth Guard Core Libraries.
import { AuthGuard } from '../../core/auth/auth.guard';

import { CollectionComponent } from './collection.component';
import { DetailCollectionComponent } from './components/detail-collection/detail-collection.component';

const routes: Routes = [
    {
        path: '',
        component: CollectionComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['FINANCE.CL.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },
            },
        },
    },
    {
        path: '/collection/:id',
        component: DetailCollectionComponent,
        data: {
            permissions: {
                only: ['FINANCE.CL.READ', 'FINANCE.CL.UPDATE'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },
            },
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CollectionRoutingModule {}

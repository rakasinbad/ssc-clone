import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { CataloguesComponent } from './catalogues.component';
import { CatalogueResolver, CatalogueStatusResolver } from './resolvers';

const routes: Routes = [
    {
        path: '',
        component: CataloguesComponent,
        canActivate: [AuthGuard],
        resolve: {
            catalogues: CatalogueResolver,
            status: CatalogueStatusResolver
        }
    }
];

/**
 *
 *
 * @export
 * @class OrdersRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CataloguesRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { CataloguesComponent } from './catalogues.component';
import { CatalogueResolver, CatalogueStatusResolver } from './resolvers';
import { CataloguesFormComponent } from './catalogues-form/catalogues-form.component';
import { CataloguesAddNewProductComponent } from './catalogues-add-new-product/catalogues-add-new-product.component';

const routes: Routes = [
    {
        path: '',
        component: CataloguesComponent,
        canActivate: [AuthGuard],
        // resolve: {
        //     catalogues: CatalogueResolver,
        //     status: CatalogueStatusResolver
        // },
        // children: []
    },
    {
        path: 'add',
        component: CataloguesAddNewProductComponent,
        canActivate: [AuthGuard],
        // resolve: {
        //     catalogues: CatalogueResolver,
        //     status: CatalogueStatusResolver
        // },
    },
    {
        path: 'add/new',
        component: CataloguesFormComponent,
        canActivate: [AuthGuard],
        // resolve: {
        //     catalogues: CatalogueResolver,
        //     status: CatalogueStatusResolver
        // },
    },
    {
        path: 'edit/:id',
        component: CataloguesFormComponent,
        canActivate: [AuthGuard]
    }
    // 
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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../core/auth/auth.guard';
import { CataloguesAddNewProductComponent } from './catalogues-add-new-product/catalogues-add-new-product.component';
import { CataloguesFormComponent } from './catalogues-form/catalogues-form.component';
import { CataloguesComponent } from './catalogues.component';
import { CatalogueDetailComponent } from './pages/catalogue-detail/catalogue-detail.component';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path: 'list',
        component: CataloguesComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['CATALOGUE.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
        // resolve: {
        //     catalogues: CatalogueResolver,
        //     status: CatalogueStatusResolver
        // },
        // children: []
    },
    {
        path: 'add',
        component: CataloguesAddNewProductComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['CATALOGUE.CREATE'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
        // resolve: {
        //     catalogues: CatalogueResolver,
        //     status: CatalogueStatusResolver
        // },
    },
    {
        path: 'add/new',
        component: CataloguesFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['CATALOGUE.CREATE'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
        // resolve: {
        //     catalogues: CatalogueResolver,
        //     status: CatalogueStatusResolver
        // },
    },
    // {
    //     path: 'edit/:id',
    //     component: CataloguesFormComponent,
    //     canActivate: [AuthGuard, NgxPermissionsGuard],
    //     data: {
    //         permissions: {
    //             only: [
    //                 'SUPER_SUPPLIER_ADMIN',
    //                 'HEAD_OF_SALES',
    //                 'BOS',
    //                 'COUNTRY_MANAGER',
    //                 'SUPPLIER_ADMIN'
    //             ],
    //             redirectTo: {
    //                 navigationCommands: ['/pages/errors/403'],
    //                 navigationExtras: {
    //                     replaceUrl: true,
    //                     skipLocationChange: true
    //                 }
    //             }
    //         }
    //     }
    // },
    {
        path: 'edit/:section/:id',
        component: CataloguesFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['CATALOGUE.UPDATE'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
    },
    {
        path: 'view/:id',
        component: CatalogueDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['CATALOGUE.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
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

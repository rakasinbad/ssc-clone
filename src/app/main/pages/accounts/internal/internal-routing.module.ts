import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../core/auth/auth.guard';
import { InternalFormComponent } from './internal-form/internal-form.component';
import { InternalComponent } from './internal.component';
import { InternalDetailComponent } from './internal-detail/internal-detail.component';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    {
        path: '',
        component: InternalComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['ACCOUNT.INTERNAL.READ'],
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
        //     internals: InternalResolver
        // }
    },
    {
        path: 'new',
        component: InternalFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            type: 'new',
            permissions: {
                only: ['ACCOUNT.INTERNAL.CREATE'],
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
        path: ':id/detail',
        component: InternalDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            type: 'edit',
            permissions: {
                only: ['ACCOUNT.INTERNAL.READ'],
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
        path: ':id/edit',
        component: InternalFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            type: 'edit',
            permissions: {
                only: ['ACCOUNT.INTERNAL.UPDATE'],
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
    // {
    //     path: ':id',
    //     component: InternalFormComponent,
    //     canActivate: [AuthGuard, NgxPermissionsGuard],
    //     data: {
    //         permissions: {
    //             only: ['ACCOUNT.INTERNAL.CREATE', 'ACCOUNT.INTERNAL.UPDATE'],
    //             redirectTo: {
    //                 navigationCommands: ['/pages/errors/403'],
    //                 navigationExtras: {
    //                     replaceUrl: true,
    //                     skipLocationChange: true
    //                 }
    //             }
    //         }
    //     }
    // }
    // {
    //     path: ':id/detail',
    //     component: InternalDetailComponent,
    //     canActivate: [AuthGuard]
    //     // resolve: {
    //     //     internal: InternalDetailResolver
    //     // }
    // }
];

/**
 *
 *
 * @export
 * @class InternalRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InternalRoutingModule {}

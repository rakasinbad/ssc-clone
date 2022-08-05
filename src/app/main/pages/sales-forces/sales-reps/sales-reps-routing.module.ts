import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../core/auth/auth.guard';
import { SalesRepDetailComponent } from './sales-rep-detail/sales-rep-detail.component';
import { SalesRepFormComponent } from './sales-rep-form';
import { SalesRepsComponent } from './sales-reps.component';

const routes: Routes = [
    {
        path: '',
        component: SalesRepsComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SRM.SR.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }    
            },
        }
    },
    {
        path: ':id',
        component: SalesRepFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SRM.SR.CREATE', 'SRM.SR.UPDATE'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }    
            },
        }
    },
    {
        path: ':id/detail',
        component: SalesRepDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SRM.SR.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }    
            },
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesRepsRoutingModule {}

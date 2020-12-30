import { NgModule } from '@angular/core';
// Angular Routing Libraries
import { Routes, RouterModule } from '@angular/router';

// NgxPermissions Libraries.
import { NgxPermissionsGuard } from 'ngx-permissions';

// Auth Guard Core Libraries.
import { AuthGuard } from '../core/auth/auth.guard';

import { SkpComponent } from './skp.component';
import { SkpCreateComponent } from './components/skp-create/skp-create.component';
import { SkpDetailComponent } from './components/skp-detail/skp-detail.component';
import { SkpModule } from './skp.module';

const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'list',
        component: SkpComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN', 'BOS', 'COUNTRY_MANAGER', 'SUPPLIER_ADMIN'],
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
        path: 'create',
        component: SkpCreateComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN', 'BOS', 'COUNTRY_MANAGER', 'SUPPLIER_ADMIN'],
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
        path: 'edit',
        component: SkpCreateComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN', 'BOS', 'COUNTRY_MANAGER', 'SUPPLIER_ADMIN'],
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
        
        path: 'detail/:id',
        component: SkpDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN', 'BOS', 'COUNTRY_MANAGER', 'SUPPLIER_ADMIN'],
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkpRoutingModule { }

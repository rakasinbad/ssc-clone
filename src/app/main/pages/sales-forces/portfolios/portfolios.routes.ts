import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../core/auth/auth.guard';
import { PortfolioDetailsComponent } from './pages/portfolio-details/portfolio-details.component';
import { PortfoliosFormComponent } from './pages/portfolios-form/portfolios-form.component';
import { PortfoliosComponent } from './portfolios.component';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    {
        path: '',
        component: PortfoliosComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'portfolio'),
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
        path: ':portfolio/add',
        component: PortfoliosFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'portfolio'),
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
        component: PortfoliosFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'portfolio'),
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
        component: PortfolioDetailsComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'portfolio'),
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
export class PortfoliosRoutingModule {}

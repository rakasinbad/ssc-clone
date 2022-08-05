import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../../core/auth/auth.guard';
import { JourneyPlanV2Component } from './journey-plansv2.component';

const routes: Routes = [
    { 
        path: '', 
        component: JourneyPlanV2Component, 
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SRM.JP.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },    
            },
        }, 
        runGuardsAndResolvers: 'always',
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class JourneyPlanV2RoutingModule {}

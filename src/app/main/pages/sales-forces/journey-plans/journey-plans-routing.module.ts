import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/auth/auth.guard';
import { JourneyPlanFormComponent } from './journey-plan-form';
import { JourneyPlansComponent } from './journey-plans.component';

const routes: Routes = [
    {
        path: '', component:
        JourneyPlansComponent,
        canActivate: [AuthGuard],
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
    },
    {
        path: ':id',
        component: JourneyPlanFormComponent,
        canActivate: [AuthGuard],
        data: {
            permissions: {
                only: ['SRM.JP.READ', 'SRM.JP.UPDATE', 'SRM.JP.CREATE'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },    
            },
        },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class JourneyPlansRoutingModule {}

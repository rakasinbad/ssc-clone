import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { ManageComponent } from './manage.component';

const routes: Routes = [
    { 
        path: '', 
        component: ManageComponent, 
        canActivate: [AuthGuard],
        data: {
            permissions: {
                only: ['SS.READ', 'SS.CREATE', 'SS.UPDATE'],
            },
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true,
                },
            },
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ManageRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { SrTargetComponent } from './sr-target.component';

const routes: Routes = [{ path: '', component: SrTargetComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always', }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SrTargetRoutingModule {}

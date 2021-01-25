import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { SrTargetComponent } from './sales-repsv2.component';

const routes: Routes = [{ path: '', component: SrTargetComponent, canActivate: [AuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SrTargetRoutingModule {}

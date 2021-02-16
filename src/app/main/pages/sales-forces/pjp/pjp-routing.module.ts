import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { PjpComponent } from './pjp.component';

const routes: Routes = [{ path: '', component: PjpComponent, canActivate: [AuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PjpRoutingModule {}

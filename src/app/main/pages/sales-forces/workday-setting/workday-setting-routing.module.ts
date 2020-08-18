import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { WorkdaySettingComponent } from './workday-setting.component';

const routes: Routes = [{ path: '', component: WorkdaySettingComponent, canActivate: [AuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class WorkdaySettingRoutingModule {}

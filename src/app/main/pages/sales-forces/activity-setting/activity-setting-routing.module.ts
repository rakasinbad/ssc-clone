import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { ActivitySettingComponent } from './activity-setting.component';

const routes: Routes = [{ path: '', component: ActivitySettingComponent, canActivate: [AuthGuard] }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ActivitySettingRoutingModule {}

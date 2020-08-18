import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material';
import { WorkdaySettingRoutingModule } from './workday-setting-routing.module';
import { WorkdaySettingComponent } from './workday-setting.component';

@NgModule({
    declarations: [WorkdaySettingComponent],
    imports: [CommonModule, MatProgressSpinnerModule, WorkdaySettingRoutingModule],
})
export class WorkdaySettingModule {}

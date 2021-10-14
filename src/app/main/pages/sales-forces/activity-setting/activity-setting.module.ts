import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material';
import { ActivitySettingRoutingModule } from './activity-setting-routing.module';
import { ActivitySettingComponent } from './activity-setting.component';

@NgModule({
    declarations: [ActivitySettingComponent],
    imports: [CommonModule, MatProgressSpinnerModule, ActivitySettingRoutingModule],
})
export class ActivitySettingModule {}

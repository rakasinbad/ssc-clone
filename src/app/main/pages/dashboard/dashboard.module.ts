import { NgModule } from '@angular/core';
import { FuseWidgetModule } from '@fuse/components';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { ChartsModule } from 'ng2-charts';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

/**
 * @export
 * @class DashboardModule
 */
@NgModule({
    declarations: [DashboardComponent],
    imports: [
        DashboardRoutingModule,

        SharedModule,
        MaterialModule,
        // TranslateModule.forChild(),

        // AgmCoreModule.forRoot({
        //     apiKey: 'AIzaSyAYbXdwC3U-zzUFkSVNIq7-xEO_ika4B98'
        // }),

        ChartsModule,
        NgxChartsModule,
        FuseWidgetModule
    ]
})
export class DashboardModule {}

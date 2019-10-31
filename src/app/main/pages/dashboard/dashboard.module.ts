import { MatTabsModule } from '@angular/material/tabs';
import { AgmCoreModule } from '@agm/core';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FuseWidgetModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

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

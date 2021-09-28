import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { FuseSidebarModule } from '@fuse/components';
import { ReturnsComponent } from './returns.component';
import { ReturnsRoutingModule } from './returns-routing.module';
import { returnsReducer } from './store/reducers';

@NgModule({
    declarations: [
        ReturnsComponent,
    ],
    imports: [
        ReturnsRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,
        FuseSidebarModule,

        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(returnsReducer.FEATURE_KEY, returnsReducer.reducer),
    ],
})
export class ReturnsModule {}
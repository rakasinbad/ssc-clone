import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { FuseSidebarModule } from '@fuse/components';
import { ReturnsComponent } from './pages/return_list/returns.component';
import { ReturnsRoutingModule } from './returns-routing.module';
import { returnsReducer } from './store/reducers';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { ReturnEffects } from './store/effects';

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

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(returnsReducer.FEATURE_KEY, returnsReducer.reducer),
        EffectsModule.forFeature([ReturnEffects])
    ],
})
export class ReturnsModule {}

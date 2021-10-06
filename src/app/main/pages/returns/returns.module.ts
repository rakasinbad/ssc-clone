import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { FuseSidebarModule } from '@fuse/components';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

import { returnsReducer } from './store/reducers';
import { ReturnEffects } from './store/effects';
import { ReturnsRoutingModule } from './returns-routing.module';

import { HeaderDetailComponent } from './component/header_detail';
import { DocumentInfoComponent, DocumentInfoDetailComponent } from './component/document_info';
import { ReturnStatusComponent } from './component/return_status';

import { ReturnListPageComponent } from './pages/return_list';
import { ReturnDetailPageComponent } from './pages/return_detail';

@NgModule({
    declarations: [
        HeaderDetailComponent,
        DocumentInfoComponent,
        DocumentInfoDetailComponent,

        ReturnStatusComponent,

        ReturnListPageComponent,
        ReturnDetailPageComponent,
    ],
    imports: [
        ReturnsRoutingModule,

        CommonModule,
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

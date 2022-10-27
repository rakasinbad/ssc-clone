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
import { DocumentLogComponent } from './component/document_log';
import { ReturnStatusComponent } from './component/return_status';
import { ReturnStatusBarComponent } from './component/return_status_bar';
import { ChangeConfirmationTableComponent } from './component/change_confirmation_table/change-confirmation-table.component';

import { ReturnListPageComponent } from './pages/return_list';
import { ReturnDetailPageComponent } from './pages/return_detail';
import { PipeSharedModule } from 'app/shared';

/**
 * @author Mufid Jamaluddin
 */
@NgModule({
    declarations: [
        HeaderDetailComponent,

        DocumentInfoComponent,
        DocumentInfoDetailComponent,
        DocumentLogComponent,

        ReturnStatusComponent,
        ReturnStatusBarComponent,

        ReturnListPageComponent,
        ReturnDetailPageComponent,

        ChangeConfirmationTableComponent
    ],
    imports: [
        ReturnsRoutingModule,

        CommonModule,
        SharedModule,
        SharedComponentsModule,
        MaterialModule,
        FuseSidebarModule,
        PipeSharedModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(returnsReducer.FEATURE_KEY, returnsReducer.reducer),
        EffectsModule.forFeature([ReturnEffects])
    ],
    entryComponents: [
        ChangeConfirmationTableComponent
    ]
})
export class ReturnsModule {}

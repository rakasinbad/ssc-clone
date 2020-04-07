import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
// import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
// import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';

import { StoreSegmentationTreeComponent } from './store-segmentation.component';
import { SelectionTreeModule } from '../selection-tree/selection-tree.module';
import { ApplyDialogModule } from 'app/shared/components/dialogs/apply-dialog/apply-dialog.module';



@NgModule({
    declarations: [
        StoreSegmentationTreeComponent,
    ],
    imports: [
        CommonModule,

        // Fuse
        FuseSharedModule,

        // Material
        MatAutocompleteModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,

        ApplyDialogModule,
        SelectionTreeModule,
        // Third Party (RxWeb: https://www.rxweb.io)
        // RxReactiveFormsModule,
        // RxReactiveDynamicFormsModule,
    ],
    exports: [
        StoreSegmentationTreeComponent,
    ],
    entryComponents: [
        StoreSegmentationTreeComponent,
    ],
})
export class StoreSegmentationTreeModule { }

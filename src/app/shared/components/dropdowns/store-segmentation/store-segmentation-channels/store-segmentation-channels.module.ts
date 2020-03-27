import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
// import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
// import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';

import { StoreSegmentationChannelsDropdownComponent } from './store-segmentation-channels.component';
import { SelectAdvancedModule } from '../../select-advanced/select-advanced.module';



@NgModule({
    declarations: [
        StoreSegmentationChannelsDropdownComponent,
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

        SelectAdvancedModule,
        // Third Party (RxWeb: https://www.rxweb.io)
        // RxReactiveFormsModule,
        // RxReactiveDynamicFormsModule,
    ],
    exports: [
        StoreSegmentationChannelsDropdownComponent,
    ],
    entryComponents: [
        StoreSegmentationChannelsDropdownComponent,
    ],
})
export class StoreSegmentationChannelsDropdownModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
// import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
// import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';

import { StoreSegmentationGroupsDropdownComponent } from './store-segmentation-groups.component';
import { SelectAdvancedModule } from '../../select-advanced/select-advanced.module';
import { MultipleSelectionModule } from 'app/shared/components/multiple-selection/multiple-selection.module';



@NgModule({
    declarations: [
        StoreSegmentationGroupsDropdownComponent,
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
        MultipleSelectionModule,
        // Third Party (RxWeb: https://www.rxweb.io)
        // RxReactiveFormsModule,
        // RxReactiveDynamicFormsModule,
    ],
    exports: [
        StoreSegmentationGroupsDropdownComponent,
    ],
    entryComponents: [
        StoreSegmentationGroupsDropdownComponent,
    ],
})
export class StoreSegmentationGroupsDropdownModule { }

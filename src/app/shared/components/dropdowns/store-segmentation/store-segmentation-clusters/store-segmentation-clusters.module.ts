import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
// import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
// import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';

import { StoreSegmentationClustersDropdownComponent } from './store-segmentation-clusters.component';
import { SelectAdvancedModule } from '../../select-advanced/select-advanced.module';
import { MultipleSelectionModule } from 'app/shared/components/multiple-selection/multiple-selection.module';



@NgModule({
    declarations: [
        StoreSegmentationClustersDropdownComponent,
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
        StoreSegmentationClustersDropdownComponent,
    ],
    entryComponents: [
        StoreSegmentationClustersDropdownComponent,
    ],
})
export class StoreSegmentationClustersDropdownModule { }

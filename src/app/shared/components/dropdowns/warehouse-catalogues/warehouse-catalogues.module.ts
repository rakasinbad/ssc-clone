import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
// import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
// import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';

import { WarehouseCataloguesDropdownComponent } from './warehouse-catalogues.component';
import { MultipleSelectionModule } from 'app/shared/components/multiple-selection/multiple-selection.module';
import { ApplyDialogModule } from 'app/shared/components/dialogs/apply-dialog/apply-dialog.module';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';



@NgModule({
    declarations: [
        WarehouseCataloguesDropdownComponent,
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
        RxReactiveFormsModule,

        ApplyDialogModule,
        MultipleSelectionModule,
        // Third Party (RxWeb: https://www.rxweb.io)
        // RxReactiveFormsModule,
        // RxReactiveDynamicFormsModule,
    ],
    exports: [
        WarehouseCataloguesDropdownComponent,
    ],
    entryComponents: [
        WarehouseCataloguesDropdownComponent,
    ],
})
export class WarehouseCatalogueDropdownModule { }

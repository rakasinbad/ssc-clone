import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { MultipleSelectionModule } from 'app/shared/components/multiple-selection/multiple-selection.module';
import { ApplyDialogModule } from 'app/shared/components/dialogs/apply-dialog/apply-dialog.module';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { SelectLinkedSkpComponent } from './select-linked-skp.component';

@NgModule({
    declarations: [
        SelectLinkedSkpComponent,
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
        SelectLinkedSkpComponent,
    ],
    entryComponents: [
        SelectLinkedSkpComponent,
    ],
})
export class SelectLinkedSkpModule { }

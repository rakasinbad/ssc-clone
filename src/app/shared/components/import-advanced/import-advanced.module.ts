import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTabsModule
} from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { ImportAdvancedComponent } from './import-advanced.component';
import { ImportDialogComponent } from './import-dialog/import-dialog.component';

@NgModule({
    declarations: [ImportAdvancedComponent, ImportDialogComponent],
    imports: [
        FuseSharedModule,

        // Material
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatToolbarModule,

        // Third Party
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule
    ],
    exports: [ImportAdvancedComponent, ImportDialogComponent],
    entryComponents: [ImportDialogComponent]
})
export class ImportAdvancedModule {}

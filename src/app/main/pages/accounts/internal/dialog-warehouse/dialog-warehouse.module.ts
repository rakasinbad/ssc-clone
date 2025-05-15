import { DialogWarehouseComponent } from './dialog-warehouse.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import {
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatRadioModule,
} from '@angular/material';
import { ApplyDialogModule } from 'app/shared/components/dialogs/apply-dialog/apply-dialog.module';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { MatDatetimepickerModule } from '@mat-datetimepicker/core';

/**
 *
 *
 * @export
 * @class DialogWarehouseModule
 */
@NgModule({
    declarations: [DialogWarehouseComponent],
    exports: [DialogWarehouseComponent],
    entryComponents: [DialogWarehouseComponent],
    imports: [
        CommonModule,

        // Fuse
        FuseSharedModule,

        // Material
        MatCheckboxModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatDatetimepickerModule,
        MatIconModule,
        MatToolbarModule,
        MatDialogModule,
        RxReactiveFormsModule,
        MatRadioModule,

        ApplyDialogModule,
    ],
})
export class DialogWarehouseModule {}

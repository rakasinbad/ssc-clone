import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatDialogModule, MatToolbarModule, MatIconModule, MatButtonModule } from '@angular/material';
// import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
// import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';

import { ApplyDialogComponent } from './apply-dialog.component';



@NgModule({
    declarations: [
        ApplyDialogComponent,
    ],
    imports: [
        CommonModule,

        // Fuse
        FuseSharedModule,

        // Material
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatToolbarModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        // RxReactiveFormsModule,
        // RxReactiveDynamicFormsModule,
    ],
    exports: [
        ApplyDialogComponent
    ],
    entryComponents: [
        ApplyDialogComponent,
    ],
})
export class ApplyDialogModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatIconModule, MatToolbarModule, MatDialogContent, MatDialogModule } from '@angular/material';
// import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
// import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { MultipleSelectionModule } from 'app/shared/components/multiple-selection/multiple-selection.module';
import { ApplyDialogModule } from 'app/shared/components/dialogs/apply-dialog/apply-dialog.module';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ExtendPromoComponent } from './extend-promo.component';
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';



@NgModule({
    declarations: [
        ExtendPromoComponent,
    ],
    imports: [
        CommonModule,

        // Fuse
        FuseSharedModule,

        // Material
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

        ApplyDialogModule,
        // Third Party (RxWeb: https://www.rxweb.io)
        // RxReactiveFormsModule,
        // RxReactiveDynamicFormsModule,
    ],
    exports: [
        ExtendPromoComponent,
    ],
    entryComponents: [
        ExtendPromoComponent,
    ],
})
export class ExtendPromoModule { }

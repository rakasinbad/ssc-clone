import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { ImportAdvancedComponent } from './import-advanced.component';
import {
    ImportDialogComponent,
    ImportHistoryComponent,
    MainImportComponent,
    TemplateHistoryComponent
} from './import-dialog';

@NgModule({
    declarations: [
        ImportAdvancedComponent,
        ImportDialogComponent,
        MainImportComponent,
        ImportHistoryComponent,
        TemplateHistoryComponent
    ],
    imports: [
        FuseSharedModule,

        // Material
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,

        // Third Party
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule
    ],
    exports: [ImportAdvancedComponent, ImportDialogComponent],
    entryComponents: [ImportDialogComponent]
})
export class ImportAdvancedModule {}

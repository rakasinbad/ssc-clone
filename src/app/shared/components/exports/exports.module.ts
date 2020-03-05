import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatToolbarModule
} from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { SearchBarModule } from '../search-bar/search-bar.module';
import { ExportFilterComponent } from './components/export-filter/export-filter.component';
import { ExportsStoreModule } from './exports-store.module';
import { ExportsComponent } from './exports.component';

@NgModule({
    declarations: [
        ExportsComponent,
        ExportFilterComponent
        // OrderManagementExportFilterComponent,
    ],
    imports: [
        // Shared components
        FuseSharedModule,
        SearchBarModule,

        // Material
        // MaterialModule,
        MatButtonModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,

        // Third Party
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Store
        ExportsStoreModule
    ],
    exports: [
        // SearchBarComponent,
        ExportsComponent
    ],
    entryComponents: [
        ExportsComponent,
        ExportFilterComponent
        // OrderManagementExportFilterComponent,
        // FilterCataloguesComponent,
    ]
})
export class ExportsModule {}

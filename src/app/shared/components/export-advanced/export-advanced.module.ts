import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

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
    MatToolbarModule,
} from '@angular/material';

import { SearchBarModule } from '../search-bar/search-bar.module';
import { ExportAdvancedComponent } from './export-advanced.component';
import {
    FilterComponent,
    ExportDialogComponent,
    ExportHistoryComponent,
} from './export-dialog';
import { ExportAdvancedStoreModule } from './store/export-advanced-store.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { SingleSpaModule } from 'single-spa/single-spa.module';

@NgModule({
    declarations: [
        ExportAdvancedComponent,
        ExportDialogComponent,
        FilterComponent,
        ExportHistoryComponent,
    ],
    imports: [
        FuseSharedModule,
        SharedModule,
        SearchBarModule,

        NgMultiSelectDropDownModule,

        // Material
        MaterialModule,
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
        TranslateModule.forChild({}),

        ExportAdvancedStoreModule,
        SingleSpaModule
    ],
    exports: [ExportAdvancedComponent, ExportDialogComponent],
    entryComponents: [ExportDialogComponent]
})
export class ExportAdvancedModule {}

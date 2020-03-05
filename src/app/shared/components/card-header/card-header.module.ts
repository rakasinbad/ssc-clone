import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatToolbarModule
} from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { NgxPermissionsModule } from 'ngx-permissions';

import { ExportsModule } from '../exports/exports.module';
import { ExportsEffects } from '../exports/store/effects';
import { fromExport } from '../exports/store/reducers';
import { ImportAdvancedModule } from '../import-advanced/import-advanced.module';
import { SearchBarModule } from '../search-bar/search-bar.module';
import { CardHeaderComponent } from './card-header.component';

@NgModule({
    declarations: [CardHeaderComponent],
    imports: [
        CommonModule,

        // Fuse
        FuseSharedModule,

        SearchBarModule,
        ImportAdvancedModule,
        ExportsModule,
        // ExportAdvancedModule,

        // Material
        MatButtonModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,

        // NgxPermissions
        NgxPermissionsModule.forChild(),

        // RxReactive
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // NgRx
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([ExportsEffects])
    ],
    exports: [StoreModule, EffectsModule, CardHeaderComponent],
    entryComponents: [CardHeaderComponent]
})
export class CardHeaderModule {}

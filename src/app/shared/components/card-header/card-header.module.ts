import { NgModule } from '@angular/core';
import { CardHeaderComponent } from './card-header.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatDialogModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatToolbarModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule } from '@angular/material';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SearchBarModule } from '../search-bar/search-bar.module';
import { ImportAdvancedModule } from '../import-advanced/import-advanced.module';
import { ExportAdvancedModule } from '../export-advanced/export-advanced.module';
import { ExportsModule } from '../exports/exports.module';
import { StoreModule } from '@ngrx/store';
import { fromExport } from '../exports/store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { ExportsEffects } from '../exports/store/effects';



@NgModule({
    declarations: [
        CardHeaderComponent,
    ],
    imports: [
        // Fuse
        FuseSharedModule,

        SearchBarModule,
        ImportAdvancedModule,
        ExportsModule,
        // ExportAdvancedModule,

        // Material
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

        // NgxPermissions
        NgxPermissionsModule.forChild(),

        // RxReactive
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // NgRx
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([
            ExportsEffects
        ]),
    ],
    exports: [
        StoreModule,
        EffectsModule,
        CardHeaderComponent,
    ],
    entryComponents: [
        CardHeaderComponent,
    ]
})
export class CardHeaderModule { }

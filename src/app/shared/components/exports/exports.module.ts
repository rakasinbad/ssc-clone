import { NgModule } from '@angular/core';
import { ExportsComponent } from './exports.component';
// import { FilterCataloguesComponent } from './components/filter/filter-catalogues/filter-catalogues.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatToolbarModule, MatTableModule, MatDialogModule, MatPaginatorModule, MatProgressSpinnerModule } from '@angular/material';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
// import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ExportsStoreModule } from './exports-store.module';
// import { SharedComponentsModule } from '../shared-components.module';
import { SearchBarModule } from '../search-bar/search-bar.module';
// import { MaterialModule } from 'app/shared/material.module';



@NgModule({
    declarations: [
        ExportsComponent,
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
        ExportsStoreModule,
    ],
    exports: [
        // SearchBarComponent,
    ],
    entryComponents: [
        ExportsComponent,
        // FilterCataloguesComponent,
    ]
})
export class ExportsModule { }

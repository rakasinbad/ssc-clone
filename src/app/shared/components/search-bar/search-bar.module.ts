import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatToolbarModule, MatTableModule, MatDialogModule, MatPaginatorModule, MatProgressSpinnerModule } from '@angular/material';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { MaterialModule } from 'app/shared/material.module';



@NgModule({
    declarations: [
        SearchBarComponent,
    ],
    imports: [
        // Fuse's module
        FuseSharedModule,

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
    ],
    exports: [
        SearchBarComponent,
    ],
    entryComponents: [
        SearchBarComponent,
    ]
})
export class SearchBarModule { }

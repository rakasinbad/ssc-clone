import { NgModule } from '@angular/core';
import { CardHeaderComponent } from './card-header.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatDialogModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatToolbarModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule } from '@angular/material';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SearchBarModule } from '../search-bar/search-bar.module';



@NgModule({
    declarations: [
        CardHeaderComponent,
    ],
    imports: [
        // Fuse
        FuseSharedModule,

        SearchBarModule,

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
    ],
    exports: [
        CardHeaderComponent,
    ],
    entryComponents: [
        CardHeaderComponent,
    ]
})
export class CardHeaderModule { }

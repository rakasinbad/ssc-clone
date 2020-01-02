import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FuseSharedModule } from '@fuse/shared.module';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { ExportAdvancedComponent } from './export-advanced.component';
import { ExportFilterComponent } from './export-filter/export-filter.component';

@NgModule({
    declarations: [ExportAdvancedComponent, ExportFilterComponent],
    imports: [
        FuseSharedModule,

        // Material
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatToolbarModule,

        // Third Party
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule
    ],
    exports: [ExportAdvancedComponent, ExportFilterComponent],
    entryComponents: [ExportFilterComponent]
})
export class ExportAdvancedModule {}

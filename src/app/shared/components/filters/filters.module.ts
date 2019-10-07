import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { FuseSharedModule } from '@fuse/shared.module';
import { FiltersComponent } from './filters.component';

@NgModule({
    declarations: [FiltersComponent],
    imports: [
        MatButtonModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatFormFieldModule,
        FuseSharedModule
    ],
    exports: [FiltersComponent]
    // entryComponents: [FiltersComponent]
})
export class FiltersModule {}

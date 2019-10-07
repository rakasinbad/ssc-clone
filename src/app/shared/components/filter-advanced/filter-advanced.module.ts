import { TitleCasePipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FuseSharedModule } from '@fuse/shared.module';
import { FilterAdvancedComponent } from './filter-advanced.component';

@NgModule({
    declarations: [FilterAdvancedComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule,
        FuseSharedModule
    ],
    exports: [FilterAdvancedComponent],
    providers: [TitleCasePipe]
})
export class FilterAdvancedModule {}

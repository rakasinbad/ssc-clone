import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarModule } from '../search-bar/search-bar.module';
import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { MultipleSelectionComponent } from './multiple-selection.component';



@NgModule({
    declarations: [
        MultipleSelectionComponent,
    ],
    imports: [
        CommonModule,

        SharedModule,
        SearchBarModule,

        // Material
        MaterialModule,
    ],
    exports: [
        MultipleSelectionComponent,
    ]
})
export class MultipleSelectionModule { }

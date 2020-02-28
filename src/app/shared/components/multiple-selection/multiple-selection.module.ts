import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarModule } from '../search-bar/search-bar.module';
import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { MultipleSelectionComponent } from './multiple-selection.component';
import { ScrollingModule } from '@angular/cdk/scrolling';


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
        ScrollingModule,
    ],
    exports: [
        MultipleSelectionComponent,
    ]
})
export class MultipleSelectionModule { }

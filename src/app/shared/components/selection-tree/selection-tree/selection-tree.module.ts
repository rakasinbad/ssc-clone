import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionTreeComponent } from './selection-tree.component';
import { SharedModule } from 'app/shared/shared.module';
import { SearchBarModule } from '../../search-bar/search-bar.module';
import { MaterialModule } from 'app/shared/material.module';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
    declarations: [
        SelectionTreeComponent,
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
        SelectionTreeComponent,
    ]
})
export class SelectionTreeModule { }

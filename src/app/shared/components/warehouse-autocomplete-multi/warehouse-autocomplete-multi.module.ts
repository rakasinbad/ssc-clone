import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import {
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
} from '@angular/material';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PipeSharedModule } from 'app/shared';
import { SinbadAutocompleteModule } from '../sinbad-autocomplete';
import { WarehouseAutocompleteMultiComponent } from './warehouse-autocomplete-multi.component';

@NgModule({
    declarations: [WarehouseAutocompleteMultiComponent],
    imports: [
        CommonModule,
        SinbadAutocompleteModule,
        FlexLayoutModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        ScrollingModule,
        PipeSharedModule,
        ReactiveFormsModule,
    ],
    exports: [WarehouseAutocompleteMultiComponent],
})
export class WarehouseAutocompleteMultiModule {}

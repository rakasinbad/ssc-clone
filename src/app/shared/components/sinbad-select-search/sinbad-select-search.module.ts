import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PipeSharedModule } from 'app/shared';
import { SelectSearchFilterPipe } from './pipes';
import { SinbadSelectSearchComponent } from './sinbad-select-search.component';

@NgModule({
    declarations: [SinbadSelectSearchComponent, SelectSearchFilterPipe],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PipeSharedModule,

        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        ScrollingModule,

        FlexLayoutModule,
    ],
    exports: [SinbadSelectSearchComponent],
})
export class SinbadSelectSearchModule {}

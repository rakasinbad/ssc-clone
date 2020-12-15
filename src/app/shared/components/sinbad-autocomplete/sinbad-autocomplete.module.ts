import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PipeSharedModule } from 'app/shared/pipe-shared.module';
import { SinbadAutocompleteService } from './services';
import { SinbadAutocompleteComponent } from './sinbad-autocomplete.component';

@NgModule({
    declarations: [SinbadAutocompleteComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        PipeSharedModule,
        ReactiveFormsModule,
    ],
    exports: [SinbadAutocompleteComponent],
    providers: [SinbadAutocompleteService],
})
export class SinbadAutocompleteModule {}

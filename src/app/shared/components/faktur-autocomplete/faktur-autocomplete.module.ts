import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadAutocompleteModule } from '../sinbad-autocomplete';
import { FakturAutocompleteComponent } from './faktur-autocomplete.component';
import { FakturApiService, FakturService } from './services';

@NgModule({
    declarations: [FakturAutocompleteComponent],
    imports: [CommonModule, SinbadAutocompleteModule],
    exports: [FakturAutocompleteComponent],
    providers: [FakturApiService, FakturService],
})
export class FakturAutocompleteModule {}

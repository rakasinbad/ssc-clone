import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadAutocompleteModule } from '../sinbad-autocomplete';
import { BrandAutocompleteComponent } from './brand-autocomplete.component';
import { BrandApiService, BrandService } from './services';

@NgModule({
    declarations: [BrandAutocompleteComponent],
    imports: [CommonModule, SinbadAutocompleteModule],
    exports: [BrandAutocompleteComponent],
    providers: [BrandApiService, BrandService],
})
export class BrandAutocompleteModule {}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SinbadAutocompleteType } from '../models';
import { SinbadAutocompleteModule } from '../sinbad-autocomplete.module';

@Injectable({ providedIn: SinbadAutocompleteModule })
export class SinbadAutocompleteService<T> {
    type$: Subject<SinbadAutocompleteType> = new Subject();

    constructor() {}
}

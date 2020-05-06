import { Injectable } from '@angular/core';
import { SinbadFilterConfig } from '../models/sinbad-filter.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SinbadFilterService {
    private _config$: BehaviorSubject<SinbadFilterConfig> = new BehaviorSubject({
        title: 'Filter',
    });

    constructor() {}

    setConfig(value: SinbadFilterConfig): void {
        this._config$.next(value);
    }

    getConfig$(): Observable<SinbadFilterConfig> {
        return this._config$.asObservable();
    }

    getConfig(): SinbadFilterConfig {
        return this._config$.value;
    }
}

import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

import { SinbadFilterConfig } from '../models/sinbad-filter.model';

@Injectable({
    providedIn: 'root',
})
export class SinbadFilterService {
    private _defaultConfig: Pick<SinbadFilterConfig, 'title' | 'actions'> = {
        title: 'Filter',
        actions: [
            {
                id: 'reset',
                title: 'Reset',
                action: 'reset',
            },
            {
                id: 'apply',
                title: 'Apply',
                color: 'accent',
                action: 'submit',
            },
        ],
    };
    private _config$: BehaviorSubject<SinbadFilterConfig> = new BehaviorSubject(
        this._defaultConfig
    );

    constructor() {}

    setConfig(value: SinbadFilterConfig): void {
        if (typeof value.actions === 'undefined' || (value.actions && !value.actions.length)) {
            value.actions = _.uniq(this._defaultConfig.actions);
        } else if (value.actions && value.actions.length > 0) {
            value.actions = _.uniq(value.actions);
        }

        this._config$.next(value);
    }

    getConfig$(): Observable<SinbadFilterConfig> {
        return this._config$.asObservable();
    }

    getConfig(): SinbadFilterConfig {
        return this._config$.value;
    }
}

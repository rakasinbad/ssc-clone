import { Injectable } from '@angular/core';
import { uniq } from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SinbadFilterActionType, SinbadFilterConfig } from '../models/sinbad-filter.model';

@Injectable({ providedIn: 'root' })
export class SinbadFilterService {
    private defaultConfig: Pick<SinbadFilterConfig, 'title' | 'showFilter' | 'actions'> = {
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
        showFilter: false,
    };
    private config$: BehaviorSubject<SinbadFilterConfig> = new BehaviorSubject(this.defaultConfig);
    private clickAction$: Subject<SinbadFilterActionType> = new Subject();

    constructor() {}

    setConfig(value: SinbadFilterConfig): void {
        if (typeof value.title === 'undefined') {
            value.title = this.defaultConfig.title;
        }

        if (typeof value.actions === 'undefined' || (value.actions && !value.actions.length)) {
            value.actions = uniq(this.defaultConfig.actions);
        } else if (value.actions && value.actions.length > 0) {
            value.actions = uniq(value.actions);
        }

        if (typeof value.showFilter === 'undefined') {
            value.showFilter = this.defaultConfig.showFilter;
        }

        this.config$.next(value);
    }

    getConfig$(): Observable<SinbadFilterConfig> {
        return this.config$.asObservable();
    }

    getConfig(): SinbadFilterConfig {
        return this.config$.value;
    }

    setClickAction(value: SinbadFilterActionType): void {
        this.clickAction$.next(value);
    }

    getClickAction$(): Observable<SinbadFilterActionType> {
        return this.clickAction$.asObservable();
    }

    resetConfig(): void {
        this.config$.next(this.defaultConfig);
    }
}

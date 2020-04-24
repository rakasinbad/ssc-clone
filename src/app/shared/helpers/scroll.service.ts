import { Injectable, OnDestroy } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 *
 *
 * @export
 * @class ScrollService
 */
@Injectable({
    providedIn: 'root'
})
export class ScrollService implements OnDestroy {
    updatePosition$: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor() {}

    getUpdatePosition(): Observable<number> {
        return this.updatePosition$.asObservable().pipe(
            tap(value => HelperService.debug('ScrollService getUpdatePosition()', value))
        );
    }

    setUpdatePosition(value: number): void {
        this.updatePosition$.next(value);
    }

    ngOnDestroy(): void {
        this.updatePosition$.next(0);
        this.updatePosition$.complete();
    }
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';

import { AttendanceActions } from '../store/actions';
import { fromAttendance } from '../store/reducers';

@Injectable({ providedIn: 'root' })
export class AttendanceStoreDetailResolver implements Resolve<any> {
    constructor(private store: Store<fromAttendance.FeatureState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const { id } = route.params;

        if (!id || id === 'new') {
            return of(null);
        }

        return of(this.store.dispatch(AttendanceActions.fetchAttendanceRequest({ payload: id })));
    }
}

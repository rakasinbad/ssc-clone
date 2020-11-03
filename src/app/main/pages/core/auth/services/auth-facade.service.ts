import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { fromAuth } from '../store/reducers';
import { AuthSelectors } from '../store/selectors';
import { Auth } from './../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
    getUser$: Observable<Auth> = this.store.select(AuthSelectors.getUserState);

    constructor(private store: Store<fromAuth.FeatureState>) {}
}

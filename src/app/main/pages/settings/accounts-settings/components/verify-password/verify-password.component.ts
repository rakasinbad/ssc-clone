/** Angular Core Libraries */
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ChangeDetectorRef,
} from '@angular/core';
import {
    FormControl,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/** NgRx */
import { Store } from '@ngrx/store';

/** RxJS */
import {
    Observable,
    Subject
} from 'rxjs';
import {
    map,
    takeUntil,
    distinctUntilChanged,
    debounceTime
} from 'rxjs/operators';

/** Models */
import {
    UpdateUser
} from '../../models';

/** Actions */
import { SettingsActions } from '../../store/actions';

/** Reducers */
import { fromSettings } from '../../store/reducers';
import { SettingsSelectors } from '../../store/selectors';

@Component({
    selector: 'app-verify-password',
    templateUrl: './verify-password.component.html',
    styleUrls: ['./verify-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyPasswordComponent implements OnDestroy, OnInit {

    password: FormControl;
    _unSubs$: Subject<void>;
    isRequesting$: Observable<boolean>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: Partial<UpdateUser>,
        private _cd: ChangeDetectorRef,
        private store: Store<fromSettings.FeatureState>,
    ) {
        this.isRequesting$ = this.store.select(SettingsSelectors.getRequestStatus);
    }

    ngOnInit(): void {
        this._unSubs$ = new Subject<void>();

        this.password = new FormControl('', Validators.required);
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }

    onSubmit(): void {
        const { userId } = this.data;
        const newData = {
            ...this.data,
            password: this.password.value
        };
        delete newData.userId;

        this.store.dispatch(
            SettingsActions.patchUserRequest({
                payload: {
                    id: userId,
                    data: newData,
                    update: 'information'
                }
            })
        )
    }
}

import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IInternalDemo } from '../models';
import { fromInternal } from '../store/reducers';
import { InternalSelectors } from '../store/selectors';

@Component({
    selector: 'app-internal-detail',
    templateUrl: './internal-detail.component.html',
    styleUrls: ['./internal-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InternalDetailComponent implements OnInit, OnDestroy {
    form: FormGroup;

    internal$: Observable<IInternalDemo>;

    private _unSubs$: Subject<void>;

    constructor(private formBuilder: FormBuilder, private store: Store<fromInternal.FeatureState>) {
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Account',
                        translate: 'BREADCRUMBS.ACCOUNT'
                    },
                    {
                        title: 'Internal',
                        translate: 'BREADCRUMBS.INTERNAL'
                    },
                    {
                        title: 'Detail',
                        translate: 'BREADCRUMBS.DETAIL',
                        active: true
                    }
                ]
            })
        );
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.form = this.formBuilder.group({
            fullName: [{ value: '', disabled: true }],
            role: [{ value: '', disabled: true }],
            email: [{ value: '', disabled: true }],
            phoneNumber: [{ value: '', disabled: true }]
        });

        this.store
            .select(InternalSelectors.getSelectedInternalEmployee)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(selectedInternal => {
                console.log('Selected internal', selectedInternal);
                if (selectedInternal) {
                    this.form.patchValue({
                        fullName: selectedInternal.user,
                        role: null,
                        email: null,
                        phoneNumber: null
                    });
                }
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._unSubs$.next();
        this._unSubs$.complete();
    }
}

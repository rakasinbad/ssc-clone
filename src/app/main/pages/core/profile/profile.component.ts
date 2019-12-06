import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { ProfileActions } from './store/actions';
import { fromProfile } from './store/reducers';
import { ProfileSelectors } from './store/selectors';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEdit: boolean;

    profile$: Observable<any>;
    isLoading$: Observable<boolean>;

    constructor(
        private formBuilder: FormBuilder,
        private store: Store<fromProfile.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'My Account'
                        //   translate: 'BREADCRUMBS.ORDER_MANAGEMENTS'
                    },
                    {
                        title: 'Informasi Supplier',
                        //   translate: 'BREADCRUMBS.ORDER_DETAILS',
                        active: true
                    }
                ]
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.isEdit = false;

        // Get selector profile
        this.profile$ = this.store.select(ProfileSelectors.getProfile);
        // Fetch request profile
        this.store.dispatch(ProfileActions.fetchProfileRequest());

        // Get selector loading
        this.isLoading$ = this.store.select(ProfileSelectors.getIsLoading);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    onEdit(isEdit: boolean): void {
        this.isEdit = isEdit ? false : true;
    }

    onSubmit(): void {}

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initForm(): void {}
}

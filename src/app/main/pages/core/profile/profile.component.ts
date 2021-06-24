import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    AfterViewInit,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { FormStatus } from 'app/shared/models/global.model';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
    isEdit: boolean;
    section: string = 'companyInfo';

    profile$: Observable<any>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
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
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'My Account',
                        //   translate: 'BREADCRUMBS.ORDER_MANAGEMENTS'
                    },
                    {
                        title: 'Supplier Information',
                        //   translate: 'BREADCRUMBS.ORDER_DETAILS',
                        active: true,
                    },
                ],
            })
        );

        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Supplier Information',
                            active: true,
                        },
                        value: {
                            active: false,
                        },
                        active: false,
                    },
                    action: {
                        save: {
                            label: 'Save',
                            active: true,
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false,
                        },
                        cancel: {
                            label: 'Cancel',
                            active: true,
                        },
                    },
                },
            })
        );

        this.store.dispatch(FormActions.resetFormStatus());
        this.store.dispatch(FormActions.setFormStatusInvalid());
        this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.isEdit = false;

        // Get selector profile
        this.profile$ = this.store.select(ProfileSelectors.getProfile);

        // Fetch request profile
        this.store.dispatch(ProfileActions.fetchProfileRequest());

        // Get selector loading
        this.isLoading$ = this.store.select(ProfileSelectors.getIsLoading);
    }

    ngAfterViewInit(): void {
        // Memeriksa kejadian ketika adanya penekanan pada tombol "cancel".
        this.store
            .select(FormSelectors.getIsClickCancelButton)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((isClick) => {
                if (isClick) {
                    this.isEdit = false;

                    this.store.dispatch(UiActions.hideFooterAction());
                    this.store.dispatch(FormActions.resetClickCancelButton());
                    this.store.dispatch(FormActions.resetClickSaveButton());
                }
            });

        // Memeriksa kejadian ketika adanya penekanan pada tombol "save".
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((isClick) => {
                if (isClick) {
                    this.isEdit = false;

                    this.store.dispatch(UiActions.hideFooterAction());
                    this.store.dispatch(FormActions.resetClickCancelButton());
                    this.store.dispatch(FormActions.resetClickSaveButton());
                }
            });
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.hideCustomToolbar());
        this.store.dispatch(FormActions.resetFormStatus());
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onEdit(isEdit: boolean): void {
        this.isEdit = isEdit ? false : true;

        if (isEdit) {
            this.store.dispatch(UiActions.hideFooterAction());
        } else {
            this.store.dispatch(UiActions.showFooterAction());
        }

        this.store.dispatch(FormActions.setFormStatusInvalid());
        this.store.dispatch(FormActions.resetClickCancelButton());
    }

    onFormStatusChanged(value: FormStatus): void {
        if (this.isEdit) {
            if (value === 'VALID') {
                this.store.dispatch(FormActions.setFormStatusValid());
            } else {
                this.store.dispatch(FormActions.setFormStatusInvalid());
            }
        }
    }

    onSelectedTab(index: number): void {
        this.isEdit = false;
        switch (index) {
            case 0:
                this.section = 'companyInfo';
                break;
            case 1:
                this.section = 'address';
                break;
            case 2:
                this.section = 'legalInfo';
                break;
        }
    }
}

import {
    Component,
    Input,
    OnChanges,
    OnInit,
    AfterViewInit,
    OnDestroy,
    ViewEncapsulation,
    ViewChild,
    TemplateRef,
    Output,
    EventEmitter,
    SimpleChanges,
    ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RxwebValidators, NumericValueType } from '@rxweb/reactive-form-validators';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    takeUntil,
    tap,
    filter,
    catchError,
    concatMap,
} from 'rxjs/operators';
import * as numeral from 'numeral';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import {
    ErrorMessageService,
    HelperService,
    PhotoUploadApiService,
    UploadPhotoApiPayload,
} from 'app/shared/helpers';
import { FormStatus } from 'app/shared/models/global.model';
import { FormSelectors } from 'app/shared/store/selectors';
import { FormActions } from 'app/shared/store/actions';
import { ProfileSelectors } from '../../store/selectors';
import { fromProfile } from '../../store/reducers';
import { CompanyInformation } from '../../models';
import { ProfileActions } from '../../store/actions';

@Component({
    selector: 'company-information-component',
    templateUrl: './company-information.component.html',
    styleUrls: ['./company-information.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CompanyInformationComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    @Input() isEdit: boolean;

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output()
    formValueChange: EventEmitter<CompanyInformation> = new EventEmitter<CompanyInformation>();

    // tslint:disable-next-line: no-inferrable-types
    labelFlex: string = '20';

    form: FormGroup;

    profileID: string;
    selectedPhoto: string;
    dialogPreviewPhoto: ApplyDialogService;
    @ViewChild('previewPhoto', { static: false }) previewPhoto: TemplateRef<any>;

    profile$: Observable<any>;

    private unSubs$: Subject<any> = new Subject();

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private store: Store<fromProfile.FeatureState>,
        private applyDialogFactory$: ApplyDialogFactoryService,
        private errorMessage$: ErrorMessageService,
        private _photo$: PhotoUploadApiService,
        private _$helper: HelperService
    ) {}

    ngOnInit() {
        this.initForm();
        this.initFormCheck();

        // Get selector profile
        this.profile$ = this.store.select(ProfileSelectors.getProfile);

        this.store
            .select(ProfileSelectors.getProfile)
            .pipe(
                filter((v) => !!v),
                takeUntil(this.unSubs$)
            )
            .subscribe((payload) => {
                if (payload && payload.companyInfo) {
                    this.selectedPhoto = payload.companyInfo.imageLogoUrl;
                    this.profileID = payload.id;
                }
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['isEdit'].isFirstChange() && changes['isEdit'].currentValue) {
            this.store
                .select(ProfileSelectors.getProfile)
                .pipe(takeUntil(this.unSubs$))
                .subscribe((payload) => {
                    if (payload && payload.companyInfo) {
                        this.initFormValue(payload);
                    }
                });
        }
    }

    ngAfterViewInit(): void {
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(takeUntil(this.unSubs$))
            .subscribe((isClick) => {
                if (this.isEdit && isClick) {
                    this.onSubmit();
                }
            });
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    private initForm(): void {
        this.form = this.fb.group({
            companyInfo: this.fb.group({
                imageLogoUrl: [
                    null,
                    [
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(1 * 1000 * 1000),
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(1 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                            ),
                        }),
                    ],
                ],
                name: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.maxLength({
                            value: 60,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'max_length',
                                60
                            ),
                        }),
                    ],
                ],
                description: [
                    '',
                    [
                        RxwebValidators.maxLength({
                            value: 1000,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'max_length',
                                1000
                            ),
                        }),
                    ],
                ],
                country: [{ value: 'Indonesia', disabled: true }, []],
                businessType: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                businessEntity: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                since: [
                    null,
                    [
                        RxwebValidators.numeric({
                            acceptValue: NumericValueType.PositiveNumber,
                            allowDecimal: false,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'numeric'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1000,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                        RxwebValidators.maxNumber({
                            value: 9999,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                numberOfEmployee: [
                    null,
                    [
                        RxwebValidators.numeric({
                            acceptValue: NumericValueType.PositiveNumber,
                            allowDecimal: false,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'numeric'
                            ),
                        }),
                        RxwebValidators.maxNumber({
                            value: 999999999999,
                            message: 'Max input is 12 digit',
                        }),
                    ],
                ],
            }),
        });
    }

    private initFormValue(payload: any): void {
        const data = payload.companyInfo;
        if (data) {
            this.form.patchValue({
                companyInfo: {
                    imageLogoUrl: data.imageLogoUrl,
                    name: data.name,
                    description: data.description,
                    country: data.country || 'Indonesia',
                    businessType: data.businessType,
                    businessEntity: data.businessEntity,
                    since: data.since,
                    numberOfEmployee: data.numberOfEmployee,
                },
            });
        }

        this.form.markAllAsTouched();
        this.form.markAsPristine();
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>)
            .pipe(
                distinctUntilChanged(),
                debounceTime(300),
                tap((value) =>
                    HelperService.debug('COMPANY INFORMATION FORM STATUS CHANGED:', value)
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((status) => {
                this.formStatusChange.emit(status);
            });

        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                tap((value) =>
                    HelperService.debug(
                        '[BEFORE MAP] COMPANY INFORMATION FORM VALUE CHANGED',
                        value
                    )
                ),
                map((value) => {
                    const tmpSince = parseInt(value.companyInfo.since);
                    const tmpNumberOfEmployee = parseInt(value.companyInfo.numberOfEmployee);
                    let formValue = { ...value };
                    if (!isNaN(tmpSince)) {
                        formValue.companyInfo.since = tmpSince;
                    }
                    if (!isNaN(tmpNumberOfEmployee)) {
                        formValue.companyInfo.numberOfEmployee = tmpNumberOfEmployee;
                    }
                    return formValue;
                }),
                tap((value) =>
                    HelperService.debug('[AFTER MAP] COMPANY INFORMATION FORM VALUE CHANGED', value)
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit(value);
                this.formStatusChange.emit(this.form.status as FormStatus);
            });
    }

    openPreviewPhoto(): void {
        this.dialogPreviewPhoto = this.applyDialogFactory$.open(
            {
                title: 'Supplier Image',
                template: this.previewPhoto,
                isApplyEnabled: false,
                showApplyButton: false,
            },
            {
                disableClose: false,
                width: '50vw',
                minWidth: '50vw',
                maxWidth: '50vw',
                panelClass: 'dialog-container-no-padding',
            }
        );
        this.dialogPreviewPhoto.closed$.subscribe({
            next: () => {
                HelperService.debug('DIALOG PREVIEW PHOTO CLOSED');
            },
        });
    }

    hasError(form: any, args: any = {}): boolean {
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return form.errors && form.touched;
        }

        if (ignoreTouched) {
            return form.errors && form.dirty;
        }

        return form.errors && (form.dirty || form.touched);
    }

    getFormError(form: any): string {
        return this.errorMessage$.getFormError(form);
    }

    onAbortUploadPhoto($event: HTMLInputElement): void {
        $event.value = '';

        this.form.get('companyInfo.imageLogoUrl').patchValue(null);
        this.cdRef.markForCheck();
    }

    onFileBrowse($event: Event): void {
        const inputEl = $event.target as HTMLInputElement;
        const maxSize = Math.floor(1 * 1000 * 1000);

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];
            if (file.size > maxSize) {
                this.form.get('companyInfo.imageLogoUrl').setErrors({
                    maxSize: {
                        message: 'This field must be less than or equal 1 MB',
                    },
                });
            } else {
                const formPhoto = this.form.get('companyInfo.imageLogoUrl');
                const fileReader = new FileReader();

                fileReader.onload = () => {
                    formPhoto.patchValue(fileReader.result);

                    if (formPhoto.invalid) {
                        formPhoto.markAsTouched();
                    }
                };

                fileReader.readAsDataURL(file);
            }
        }
        return;
    }

    onSubmit(): void {
        this.store.dispatch(ProfileActions.setLoading({ payload: true }));

        const body = this.form.value;
        const formImage = body.companyInfo.imageLogoUrl;
        const oldImage = this.selectedPhoto;

        if (formImage && formImage != oldImage) {
            const uploadPhotos: Array<UploadPhotoApiPayload> = [
                {
                    image: formImage,
                    type: 'supplierPhoto',
                    oldLink: oldImage ? oldImage : null,
                },
            ];

            of<UploadPhotoApiPayload>(...uploadPhotos)
                .pipe(
                    concatMap((photoPayload: UploadPhotoApiPayload) => {
                        return this._photo$
                            .upload(photoPayload.image, photoPayload.type, photoPayload.oldLink)
                            .pipe(
                                tap((response) => {
                                    body['companyInfo'].imageLogoUrl = response.url;
                                }),
                                catchError((err) => {
                                    this.store.dispatch(
                                        ProfileActions.setLoading({ payload: false })
                                    );

                                    this._$helper.showErrorNotification({
                                        id: `ERR_UPLOAD_${String(
                                            photoPayload.type
                                        ).toUpperCase()}_FAILED`,
                                        errors: err,
                                    });

                                    return throwError(err);
                                })
                            );
                    })
                )
                .subscribe({
                    next: (value) => {
                        HelperService.debug(
                            '[COMPANY INFORMATION] UPLOAD PHOTO SEQUENTIAL SUCCESS',
                            value
                        );
                    },
                    error: (err) => {
                        HelperService.debug(
                            '[COMPANY INFORMATION] UPLOAD PHOTO SEQUENTIAL ERROR',
                            err
                        );
                        this.store.dispatch(FormActions.resetClickSaveButton());
                        this.store.dispatch(ProfileActions.setLoading({ payload: false }));
                    },
                    complete: () => {
                        HelperService.debug(
                            '[COMPANY INFORMATION] UPLOAD PHOTO SEQUENTIAL COMPLETE'
                        );
                        setTimeout(() => {
                            this.onPatchProfile(body);
                        }, 3000);
                    },
                });
        } else {
            this.onPatchProfile(body);
        }
    }

    onPatchProfile(payload: CompanyInformation): void {
        const body = { ...payload };

        if (!body.companyInfo.imageLogoUrl) {
            body.companyInfo.imageLogoUrl = null;
        }
        if (!body.companyInfo.description) {
            body.companyInfo.description = null;
        }
        if (!body.companyInfo.since) {
            body.companyInfo.since = null;
        }
        if (!body.companyInfo.numberOfEmployee) {
            body.companyInfo.numberOfEmployee = null;
        }

        if (Object.keys(payload).length > 0) {
            this.store.dispatch(
                ProfileActions.updateProfileRequest({
                    payload: { body: body, id: this.profileID },
                })
            );
        }
    }

    capitalizeLetter(payload: string): string {
        if (payload) {
            return payload.charAt(0).toUpperCase() + payload.slice(1);
        }
        return '-';
    }
}

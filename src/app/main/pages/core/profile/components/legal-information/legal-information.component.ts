import {
    Component,
    Input,
    OnChanges,
    OnInit,
    AfterViewInit,
    ViewEncapsulation,
    Output,
    EventEmitter,
    SimpleChanges,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import {
    debounceTime,
    distinctUntilChanged,
    takeUntil,
    tap,
    filter,
    catchError,
    concatMap,
} from 'rxjs/operators';
import * as numeral from 'numeral';
import {
    ErrorMessageService,
    HelperService,
    DocumentUploadApiService,
    UploadDocumentApiPayload,
} from 'app/shared/helpers';
import { FormStatus } from 'app/shared/models/global.model';
import { FormSelectors } from 'app/shared/store/selectors';
import { FormActions } from 'app/shared/store/actions';
import { ProfileSelectors } from '../../store/selectors';
import { fromProfile } from '../../store/reducers';
import { ProfileActions } from '../../store/actions';

type TmpFiles = 'file';
@Component({
    selector: 'legal-information-component',
    templateUrl: './legal-information.component.html',
    styleUrls: ['./legal-information.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LegalInformationComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    @Input() isEdit: boolean;

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();

    // tslint:disable-next-line: no-inferrable-types
    labelFlex: string = '20';

    form: FormGroup;
    officialDocument: string;
    profileID: string;
    selectedPhoto: string;
    profile$: Observable<any>;
    tmpFiles: Partial<Record<TmpFiles, FormControl>> = {};

    private unSubs$: Subject<any> = new Subject();

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private store: Store<fromProfile.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private _document$: DocumentUploadApiService,
        private _$helper: HelperService,
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
                if (payload && payload.legalInfo) {
                    if (payload.legalInfo.officialDocument) {
                        this.officialDocument = payload.legalInfo.officialDocument;
                        this.tmpFiles['file'].setValue({
                            name: 'official_document.pdf',
                        });
                    }
                    this.profileID = payload.id;
                    this.initFormValue(payload);
                }
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['isEdit'].isFirstChange() && changes['isEdit'].currentValue) {
            this.formStatusChange.emit('INVALID');
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
        this.tmpFiles['file'] = new FormControl({ value: '', disabled: true });

        this.form = this.fb.group({
            legalInfo: this.fb.group({
                bank: this.fb.group({
                    id: [{ value: null, disabled: true }],
                    name: [{ value: null, disabled: true }],
                    accountNo: [{ value: null, disabled: true }],
                    accountName: [{ value: null, disabled: true }],
                    branchName: [{ value: null, disabled: true }],
                }),
                taxNo: [{ value: null, disabled: true }],
                officialDocument: [
                    null,
                    [
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(5 * 1000 * 1000),
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(5 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                            ),
                        }),
                    ],
                ],
            }),
        });
    }

    private initFormValue(payload: any): void {
        const data = payload.legalInfo;
        if (data) {
            this.form.patchValue({
                legalInfo: {
                    bank: {
                        id: data.bank.id,
                        name: data.bank.name,
                        accountNo: data.bank.accountNo,
                        accountName: data.bank.accountName,
                        branchName: data.bank.branchName,
                    },
                    taxNo: data.taxNo,
                    officialDocument: data.officialDocument,
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
                    HelperService.debug('LEGAL INFORMATION FORM STATUS CHANGED:', value)
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((status) => {
                this.formStatusChange.emit(status);
            });

        this.form.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(200), takeUntil(this.unSubs$))
            .subscribe((value) => {
                this.formStatusChange.emit(this.form.status as FormStatus);
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

    onDownload(url: string): void {
        if (!url) {
            return;
        }
        window.open(url, '_blank');
    }

    onAbortUploadDocument($event: HTMLInputElement): void {
        $event.value = '';

        this.form.get('legalInfo.officialDocument').setValue(null);
        this.tmpFiles['file'].reset();
        this.cdRef.markForCheck();
    }

    fileChangeEvent($event: Event): void {
        const inputEl = $event.target as HTMLInputElement;
        const maxSize = Math.floor(5 * 1000 * 1000);

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];
            if (file.size > maxSize) {
                this.form.get('legalInfo.officialDocument').setErrors({
                    maxSize: {
                        message: 'This field must be less than or equal 5 MB',
                    },
                });
            } else {
                const document = this.form.get('legalInfo.officialDocument');
                const fileReader = new FileReader();

                this.tmpFiles['file'].setValue({
                    name: file.name,
                });

                fileReader.onload = () => {
                    document.setValue(fileReader.result);

                    if (document.invalid) {
                        document.markAsTouched();
                    }
                };

                fileReader.readAsDataURL(file);
            }
        }
        return;
    }

    onSubmit(): void {
        this.store.dispatch(ProfileActions.setLoading({ payload: true }));

        const formDocument = this.form.get('legalInfo.officialDocument').value;
        const oldDocument = this.officialDocument;

        if (formDocument && formDocument != oldDocument) {
            const uploadDocument: Array<UploadDocumentApiPayload> = [
                {
                    document: formDocument,
                    type: 'supplierOfficialDocument',
                    oldLink: oldDocument ? oldDocument : null,
                },
            ];

            of<UploadDocumentApiPayload>(...uploadDocument)
                .pipe(
                    concatMap((documentPayload: UploadDocumentApiPayload) => {
                        return this._document$
                            .upload(
                                documentPayload.document,
                                documentPayload.type,
                                documentPayload.oldLink
                            )
                            .pipe(
                                tap((response) => {
                                    this.form
                                        .get('legalInfo.officialDocument')
                                        .setValue(response.url);
                                }),
                                catchError((err) => {
                                    this.store.dispatch(
                                        ProfileActions.setLoading({ payload: false })
                                    );

                                    this._$helper.showErrorNotification({
                                        id: `ERR_UPLOAD_${String(
                                            documentPayload.type
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
                            '[LEGAL INFORMATION] UPLOAD DOCUMENT SEQUENTIAL SUCCESS',
                            value
                        );
                    },
                    error: (err) => {
                        HelperService.debug(
                            '[LEGAL INFORMATION] UPLOAD DOCUMENT SEQUENTIAL ERROR',
                            err
                        );
                        this.store.dispatch(FormActions.resetClickSaveButton());
                        this.store.dispatch(ProfileActions.setLoading({ payload: false }));
                    },
                    complete: () => {
                        HelperService.debug(
                            '[LEGAL INFORMATION] UPLOAD DOCUMENT SEQUENTIAL COMPLETE'
                        );
                        setTimeout(() => {
                            this.onPatchProfile();
                        }, 3000);
                    },
                });
        } else {
            this.onPatchProfile();
        }
    }

    onPatchProfile(): void {
        let body = this.form.value;

        if (Object.keys(body).length > 0) {
            this.store.dispatch(
                ProfileActions.updateProfileRequest({
                    payload: { body: body, id: this.profileID },
                })
            );
        }
    }
}

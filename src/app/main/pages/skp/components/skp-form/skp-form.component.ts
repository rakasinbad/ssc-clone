import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import {
    EStatus,
    IBreadcrumbs,
    IFooterActionConfig,
    LifecyclePlatform,
} from 'app/shared/models/global.model';
import { MatCheckboxChange, MatDialog, MatRadioChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { Store } from '@ngrx/store';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as numeral from 'numeral';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IQueryParams } from 'app/shared/models/query.model';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';

import { CreateSkpDto, SkpModel, UpdateSkpDto } from '../../models';
import { SkpActions } from '../../store/actions';
import * as fromSkp from '../../store/reducers';
import { SkpSelectors } from '../../store/selectors';
import { SelectPromo } from 'app/shared/components/dropdowns/select-promo/models';

type TmpKey = 'imageUrl';
type TmpFiles = 'file';

@Component({
    selector: 'app-skp-form',
    templateUrl: './skp-form.component.html',
    styleUrls: ['./skp-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkpFormComponent implements OnInit, AfterViewInit, OnDestroy {
    form: FormGroup;
    pageType: string;
    tmp: Partial<Record<TmpKey, FormControl>> = {};
    tmpFiles: Partial<Record<TmpFiles, FormControl>> = {};

    isLoading$: Observable<boolean>;
    private _unSubs$: Subject<void> = new Subject<void>();
    skpCombo: SkpModel = null;

    // Untuk keperluan mengirim nilai yang terpilih ke component multiple selection.
    chosenPromo$: BehaviorSubject<Array<Selection>> = new BehaviorSubject<Array<Selection>>([]);


    // tslint:disable-next-line: no-inferrable-types
    formFieldLength: number = 40;

    private strictISOString = false;
    minStartDate: Date = new Date();
    maxStartDate: Date = null;
    minEndDate: Date = new Date();
    maxEndDate: Date = null;
    selectStatus: string = 'active';
    skpFileName: string;

    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Surat Kerjasama Promosi',
        },
        {
            title: 'Create New Surat Kerjasama Promosi',
            active: true,
        },
    ];

    private footerConfig: IFooterActionConfig = {
        progress: {
            title: {
                label: 'Skor tambah SKP',
                active: false,
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
    };

    constructor(
        private cdRef: ChangeDetectorRef,
        private domSanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromSkp.FeatureState>,
        private _fuseProgressBarService: FuseProgressBarService,
        private _$applyDialogFactory: ApplyDialogFactoryService<ElementRef<HTMLElement>>,
        private _$errorMessage: ErrorMessageService,
        private _$helperService: HelperService, 
        private errorMessage$: ErrorMessageService,
        private _$notice: NoticeService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                if (this.pageType === 'new') {
                // Display footer action
                    this.store.dispatch(UiActions.showFooterAction());
                }
                break;

            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(FormActions.resetClickCancelButton());

                this.store.dispatch(FormActions.resetCancelButtonAction());

                // Reset form status state
                this.store.dispatch(FormActions.resetFormStatus());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                // Hide footer action
                this.store.dispatch(UiActions.hideFooterAction());

                // Reset core state skpCombos
                this.store.dispatch(SkpActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Set footer action
                this.store.dispatch(
                    UiActions.setFooterActionConfig({ payload: this.footerConfig })
                );

                this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));

                const { id } = this.route.snapshot.params;
                if (id === 'create') {
                    this.pageType = 'new';
                } else {
                    this.pageType = 'edit';

                    this._breadCrumbs = [
                        {
                            title: 'Home',
                        },
                        {
                            title: 'Surat Kerjasama Promosi',
                        },
                        {
                            title: 'Edit Surat Kerjasama Promosi',
                            active: true,
                        },
                    ];

                    const parameter: IQueryParams = {};
                    parameter['splitRequest'] = true;

                    // this.store.dispatch(
                    //     SkpActions.fetchSkpRequest({ payload: { id, parameter } })
                    // );

                    this.isLoading$ = this.store.select(SkpSelectors.getIsLoading).pipe(
                        tap((isLoading) => {
                            if (isLoading) {
                                this._fuseProgressBarService.show();
                                // Hide footer action
                                this.store.dispatch(UiActions.hideFooterAction());
                            } else {
                                this._fuseProgressBarService.hide();
                                // Display footer action
                                this.store.dispatch(UiActions.showFooterAction());
                            }
                        })
                    );
                // } else {
                    // this.router.navigateByUrl('/pages/skp/list');
                }

                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );

                this._initForm();

                // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
                this.form.statusChanges
                    .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
                    .subscribe((status) => {
                        this._setFormStatus(status);
                    });

                // Handle cancel button action (footer)
                this.store
                    .select(FormSelectors.getIsClickCancelButton)
                    .pipe(
                        filter((isClick) => !!isClick),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe((isClick) => {
                        this.store.dispatch(FormActions.resetClickCancelButton());
                        this.store.dispatch(FormActions.resetCancelButtonAction());
                    });

                // Handle save button action (footer)
                this.store
                    .select(FormSelectors.getIsClickSaveButton)
                    .pipe(
                        filter((isClick) => !!isClick),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe((isClick) => {
                        this._onSubmit();
                    });
                break;
        }
    }

    private _setFormStatus(status: string): void {
        // console.log(`Test Form ${status}`, this.form, this.form.getRawValue());

        if (!status) {
            return;
        }

        if (status === 'VALID') {
            this.store.dispatch(FormActions.setFormStatusValid());
        }

        if (status === 'INVALID') {
            this.store.dispatch(FormActions.setFormStatusInvalid());
        }
    }

    private _initForm(): void {
        this.tmp['imageUrl'] = new FormControl({ value: '', disabled: true });

        this.form = this.formBuilder.group({
            // promoId: [
            //     null,
            //     [
            //         RxwebValidators.required({
            //             message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //         }),
            //         /* ^[a-zA-Z]+[a-zA-Z0-9-_ ]*[a-zA-Z0-9]$ first character letter next allow alphanum hypen underscore */
            //         /* ^[\w-]+$ only allow alphanum hyphen underscore */
            //         RxwebValidators.pattern({
            //             expression: {
            //                 alphaNumHyphenUnderscore: /^[a-zA-Z]+[a-zA-Z0-9-_ ]*[a-zA-Z0-9]$/,
            //             },
            //             message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
            //         }),
            //         RxwebValidators.maxLength({
            //             value:20,
            //             message: 'Max input is 20 character'
            //         })
            //     ],
            // ],
            supplierId: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            name: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.maxLength({
                        value: 20,
                        message: 'Max input is 20 characters'
                    }),
                    RxwebValidators.pattern({
                        expression: {
                            alphaNumHyphenUnderscore: /^[a-zA-Z]+[a-zA-Z0-9 ]*[a-zA-Z0-9]$/,
                        },
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.alphaNumeric({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            description: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.maxLength({
                        value: 200,
                        message: 'Max input is 200 characters'
                    })
                ],
            ],
            notes: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.maxLength({
                        value: 100,
                        message: 'Max input is 100 characters'
                    }),
                ],
            ],
            header: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.maxLength({
                        value: 20,
                        message: 'Max input is 20 characters'
                    }),
                    RxwebValidators.alphaNumeric({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            startDate: [
                { value: null, disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            endDate: [
                { value: null, disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            file: [
                null,
                [
                    RxwebValidators.fileSize({
                        maxSize: Math.floor(5 * 1000 * 1000),
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'file_size_lte',
                            { size: numeral(5 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                        ),
                    }),
                ],
            ],
            promo : ['',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            imageUrl: [
                null,
                [
                    RxwebValidators.fileSize({
                        maxSize: Math.floor(1 * 1000 * 1000),
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'file_size_lte',
                            { size: numeral(1 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                        ),
                    }),
                ],
            ],
            status: ['active']
        });

        //for setting value coloumn promo (value must into array)
        if (this.form.get('promo')){
            this.form.get('promo').setValue([217]);
        }

        console.log('form init ->', this.form)

        if (this.pageType === 'edit') {
            this._initEditForm();
        }
    }

    private _initEditForm(): void {
        this.store
            .select(SkpSelectors.getSelectedItem)
            .pipe(
                filter((row) => !!row),
                tap((row) => {
                    this.skpCombo = row;
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe((row) => {
                this._setEditForm(row);
            });
    }

    private _setEditForm(row: SkpModel): void {
        // console.log('ROW', row);
        const skpId = this.form.get('id');
        const skpSupplierId = this.form.get('supplierId');
        const skpNameCtrl = this.form.get('name');
        const descriptionCtrl = this.form.get('description');
        const notesCtrl = this.form.get('notes');
        const headerCtrl = this.form.get('header');
        const startDateCtrl = this.form.get('startDate');
        const endDateCtrl = this.form.get('endDate');
        const statusCtrl = this.form.get('status');
        const promoCtrl = this.form.get('promo');
        // // Handle Promo Seller ID
        // if (row.externalId) {
        //     promoSellerIdCtrl.setValue(row.externalId);
        // }

        if (row.supplierId) {
            skpSupplierId.setValue(row.supplierId);
        }

        // Handle Name
        if (row.name) {
            skpNameCtrl.setValue(row.name);
        }

        // Handle Description
        if (row.description) {
            descriptionCtrl.setValue(row.description);
        }

        // Handle Notes
        if (row.notes) {
            notesCtrl.setValue(row.notes);
        }

        // Handle Header
        if (row.header) {
            headerCtrl.setValue(row.header);
        }

        // Handle Start Date
        if (row.startDate) {
            startDateCtrl.setValue(moment(row.startDate));
        }

        // Handle End Date
        if (row.endDate) {
            endDateCtrl.setValue(moment(row.endDate));
        }

        //  Handle status
        if (row.status) {
           statusCtrl.setValue(row.status);
            this.selectStatus = row.status;
        }

        setTimeout(() => {
            if (this.form.invalid) {
                this.form.markAllAsTouched();
            }
        });
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();
        const {
            supplierId,
            name,
            description,
            notes,
            header,
            file,
            imageUrl,
            startDate,
            endDate,
            promo,
            status

        } = body;

        const newStartDate =
            startDate && moment.isMoment(startDate)
                ? startDate.toISOString(this.strictISOString)
                : null;
        const newEndDate =
            endDate && moment.isMoment(endDate) ? endDate.toISOString(this.strictISOString) : null;

        if (this.pageType === 'new') {
            const payload: CreateSkpDto = {
                supplierId,
                name,
                description,
                notes,
                header,
                file,
                promo,
                imageUrl,
                startDate: newStartDate,
                endDate: newEndDate, 
                status: EStatus.ACTIVE,
            };

            this.store.dispatch(SkpActions.createSkpRequest({ payload }));
        } else if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            const payload: UpdateSkpDto = {
                supplierId,
                name,
                description,
                notes,
                header,
                file,
                promo,
                imageUrl,
                startDate: newStartDate,
                endDate: newEndDate, 
                status: EStatus.ACTIVE,
                
            };

            if (!imageUrl) {
                delete payload.imageUrl;
            }

            if (id && Object.keys(payload).length > 0) {
                this.store.dispatch(
                    SkpActions.updateSkpRequest({
                        payload: { id, body: payload },
                    })
                );
            }
        }
    }

    //get Error notif
    getErrorMessage(fieldName: string, parentName?: string, index?: number): string {
        if (!fieldName) {
            return;
        }

        if (parentName && typeof index === 'number') {
            const formParent = this.form.get(parentName) as FormArray;
            const { errors } = formParent.at(index).get(fieldName);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        } else {
            const { errors } = this.form.get(fieldName);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    /**
     *
     * Handle change event for Error notification
     *
     */
    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    onPromoSelected(event: Array<SelectPromo>): void {
        this.form.get('chosenPromo').markAsDirty();
        this.form.get('chosenPromo').markAsTouched();

        if (event.length === 0) {
            this.form.get('chosenPromo').setValue('');
        } else {
            this.form.get('chosenPromo').setValue(event);
        }
    }

    getFormError(form: any): string {
        return this.errorMessage$.getFormError(form);
    }

    /**
     *
     * Handle change event for Upload file
     *
     */
    fileChangeEvent(fileInput) {
        if (fileInput.target.files && fileInput.target.files[0]) {

            // Size Filter Bytes
            // const max_size = 5000000;
            // const allowed_types = ['files/doc', 'files/docx', 'files/pdf', 'files/xls', 'files/xlsx'];
            // const max_height = 589;
            // const max_width = 1441;

            // if (fileInput.target.files[0].size > max_size) {
            //     // this.statusImageErr = true;
            //     let sizemax = max_size / 1000000;
            //     // this.imageError = 'Maximum size allowed is ' + sizemax + 'Mb';
            // } else {
                // if (!_.includes(allowed_types, fileInput.target.files[0].type)) {
                //     return false;
                // }
                // const fileUrlField = this.form.get('file');
                this.skpFileName = fileInput.target.files[0].name;
                this.form.get('file').setValue(fileInput.target.files[0].name);
                const reader = new FileReader();
                reader.readAsDataURL(fileInput.target.files[0]);
            // }

        } else {
                this.form.get('file').reset();
                this.tmpFiles['file'].reset();    
        }
    }

     /**
     *
     * Handle File Browse (Image / File)
     * @param {Event} ev
     * @param {string} type
     * @memberof SKP Form
     */
    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];
            // const size = file.size
            // const maxSize = 1000000

            if (file) {
                switch (type) {
                    case 'imageUrl':
                        {
                            const imageUrlField = this.form.get('imageUrl');

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                imageUrlField.setValue(fileReader.result);
                                this.tmp['imageUrl'].setValue({
                                    name: file.name,
                                    url: this.domSanitizer.bypassSecurityTrustUrl(
                                        window.URL.createObjectURL(file)
                                    ),
                                });

                                if (imageUrlField.invalid) {
                                    imageUrlField.markAsTouched();
                                }
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    default:
                        break;
                }
            }
        } else {
            switch (type) {
                case 'imageUrl':
                    {
                        this.form.get('imageUrl').reset();
                        this.tmp['imageUrl'].reset();
                    }
                    break;

                default:
                    break;
            }
        }
    }

     /**
     *
     * Handle change event for Active From Field
     * @param {MatDatetimepickerInputEvent<any>} ev
     * @memberof SKP Create
     */
    onChangeStartDate(ev: MatDatetimepickerInputEvent<any>): void {
        const startDate = ev.value;
        const endDate = this.form.get('endDate').value;

        if (endDate) {
            if (startDate.isAfter(endDate)) {
                this.form.get('endDate').reset();
            }
        }

        this.minEndDate = startDate.add(1, 'minute').toDate();
    }

    /**
     *
     * Handle change event for Active To Field
     * @param {MatDatetimepickerInputEvent<any>} ev
     * @memberof SKP Create
     */
    onChangeEndDate(ev: MatDatetimepickerInputEvent<any>): void {
        const endDate = ev.value;
        const startDate = this.form.get('startDate').value;

        if (startDate) {
            if (endDate.isBefore(startDate)) {
                this.form.get('startDate').reset();
            }
        }

        this.maxStartDate = endDate.subtract(1, 'minute').toDate();
    }
}

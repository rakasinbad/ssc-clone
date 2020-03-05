import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger
} from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { EStatus, LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Team } from 'app/shared/models/team.model';
import { FormActions, TeamActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { TeamSelectors } from 'app/shared/store/selectors/sources';
import { NgxPermissionsService } from 'ngx-permissions';
import * as numeral from 'numeral';
import { fromEvent, Observable, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
    withLatestFrom
} from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { SalesRep, SalesRepForm, SalesRepFormPatch } from '../../models';
import { SalesRepActions } from '../../store/actions';
import * as fromSalesReps from '../../store/reducers';
import { SalesRepSelectors } from '../../store/selectors';

type TmpKey = 'photo';
type TmpAutoCompleteKey = 'salesTeam';

@Component({
    selector: 'app-sales-rep-info',
    templateUrl: './sales-rep-info.component.html',
    styleUrls: ['./sales-rep-info.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepInfoComponent implements OnInit, AfterViewInit, OnDestroy {
    form: FormGroup;
    tmp: Partial<Record<TmpKey, FormControl>> = {};
    field: Record<TmpAutoCompleteKey, { highlight: string; typing: boolean }> = {
        salesTeam: {
            highlight: '',
            typing: false
        }
    };
    // highlight: Record<TmpAutoCompleteKey, string> = { salesTeam: '' };

    salesRep$: Observable<SalesRep>;
    salesTeams$: Observable<Array<Team>>;

    isLoadingSalesTeam$: Observable<boolean>;

    @Input() readonly pageType: 'new' | 'edit' = 'new';
    @Output() fullNameValue = new EventEmitter();
    @Output() phoneValue = new EventEmitter();

    @ViewChild('autoSalesTeam', { static: false }) autoSalesTeam: MatAutocomplete;
    @ViewChild('triggerSalesTeam', { static: false, read: MatAutocompleteTrigger })
    triggerSalesTeam: MatAutocompleteTrigger;

    private _unSubs$: Subject<void> = new Subject<void>();
    private _selected: Record<TmpAutoCompleteKey, string> = { salesTeam: '' };
    private _timer: Record<TmpAutoCompleteKey, NodeJS.Timer> = { salesTeam: null };

    constructor(
        private domSanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromSalesReps.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$notice: NoticeService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    displayOption(item: Team, field: string, isHtml = false): string {
        switch (field) {
            case 'salesTeam': {
                const team = item as Team;

                if (!isHtml) {
                    return team.name;
                }

                return `<span class="subtitle">${team.name}</span>`;
            }

            default:
                return;
        }
    }

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

    getHighlight(name: string): string {
        if (!name) {
            return;
        }

        return this.field[name].highlight || '';
    }

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

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? true : value.length <= minLength;
    }

    sanitize(url: string): string | null {
        if (!url) {
            return;
        }

        return this.domSanitizer.sanitize(SecurityContext.URL, url);
    }

    onDisplaySalesTeam(item: Team): string {
        if (!item) {
            return;
        }

        return HelperService.truncateText(item.name, 40, 'start');
    }

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        // console.log('CHANGE', inputEl.files.length);

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            // console.log('URL', window.URL.createObjectURL(file));

            if (file) {
                switch (type) {
                    case 'photo':
                        {
                            const photoField = this.form.get('photo');

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                photoField.setValue(fileReader.result);
                                this.tmp['photo'].setValue({
                                    name: file.name,
                                    url: this.domSanitizer.bypassSecurityTrustUrl(
                                        window.URL.createObjectURL(file)
                                    )
                                });

                                if (photoField.invalid) {
                                    photoField.markAsTouched();
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
                case 'photo':
                    {
                        this.form.get('photo').reset();
                        this.tmp['photo'].reset();
                    }
                    break;

                default:
                    break;
            }
        }
    }

    onKeydown(ev: KeyboardEvent, field: string): void {
        if (!field) {
            return;
        }

        clearTimeout(this._timer[field]);
    }

    onKeyup(ev: KeyboardEvent, field: string): void {
        switch (field) {
            case 'salesTeam':
                {
                    if (!(ev.target as any).value || (ev.target as any).value.length < 3) {
                        this.store.dispatch(TeamActions.clearTeamState());
                        return;
                    }

                    this.field.salesTeam.typing = true;

                    clearTimeout(this._timer[field]);

                    this._timer[field] = setTimeout(() => {
                        this.field.salesTeam.typing = false;
                    }, 100);
                }
                break;

            default:
                return;
        }
    }

    onOpenAutocomplete(field: string): void {
        switch (field) {
            case 'salesTeam':
                {
                    if (this.autoSalesTeam && this.autoSalesTeam.panel && this.triggerSalesTeam) {
                        fromEvent(this.autoSalesTeam.panel.nativeElement, 'scroll')
                            .pipe(
                                map(x => this.autoSalesTeam.panel.nativeElement.scrollTop),
                                withLatestFrom(
                                    this.store.select(TeamSelectors.selectTotal),
                                    this.store.select(TeamSelectors.getTotalItem)
                                ),
                                takeUntil(this.triggerSalesTeam.panelClosingActions)
                            )
                            .subscribe(([x, skip, total]) => {
                                const scrollTop = this.autoSalesTeam.panel.nativeElement.scrollTop;
                                const scrollHeight = this.autoSalesTeam.panel.nativeElement
                                    .scrollHeight;
                                const elementHeight = this.autoSalesTeam.panel.nativeElement
                                    .clientHeight;
                                const atBottom = scrollHeight === scrollTop + elementHeight;

                                if (atBottom && skip && total && skip < total) {
                                    const data: IQueryParams = {
                                        limit: 10,
                                        skip: skip
                                    };

                                    data['paginate'] = true;

                                    if (this.field.salesTeam.highlight) {
                                        data['search'] = [
                                            {
                                                fieldName: 'keyword',
                                                keyword: this.field.salesTeam.highlight
                                            }
                                        ];

                                        this.store.dispatch(
                                            TeamActions.fetchTeamRequest({
                                                payload: data
                                            })
                                        );
                                    }
                                }
                            });
                    }
                }
                break;

            default:
                return;
        }
    }

    onSelectAutocomplete(ev: MatAutocompleteSelectedEvent, field: string): void {
        switch (field) {
            case 'salesTeam':
                {
                    const value = (ev.option.value as Team) || '';

                    if (!value) {
                        this.form.get('team').reset();
                    }

                    this._selected.salesTeam = value ? JSON.stringify(value) : '';
                }
                break;

            default:
                return;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof SalesRepInfoComponent
     */
    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;

        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                // Handle trigger autocomplete sales team force selected from options
                this.triggerSalesTeam.panelClosingActions
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(e => {
                        const teamField = this.form.get('team');

                        if (
                            !this._selected.salesTeam ||
                            this._selected.salesTeam !== JSON.stringify(teamField.value)
                        ) {
                            // Set input sales team empty
                            teamField.setValue('');

                            // Set selected sales team empty (helper check User is choose from option or not)
                            this._selected.salesTeam = '';
                        }
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset form status state
                this.store.dispatch(FormActions.resetFormStatus());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.salesTeams$ = this.store.select(TeamSelectors.selectAll);

                if (this.pageType === 'edit') {
                    this.salesRep$ = this.store.select(SalesRepSelectors.getSelectedItem);
                }

                this.isLoadingSalesTeam$ = this.store.select(TeamSelectors.getIsLoading);

                this._initForm();

                // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
                this.form.statusChanges
                    .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
                    .subscribe(status => {
                        this._setFormStatus(status);
                    });

                // Handle fullName value
                this.form
                    .get('name')
                    .valueChanges.pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe(v => {
                        this.fullNameValue.emit(v);
                    });

                // Handle phone value
                this.form
                    .get('phone')
                    .valueChanges.pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe(v => {
                        this.phoneValue.emit(v);
                    });

                // Handle search sales team autocomplete & try request to endpoint
                this.form
                    .get('team')
                    .valueChanges.pipe(
                        filter(v => {
                            this.field.salesTeam.highlight = v;
                            return v.length >= 3;
                        }),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(v => {
                        if (v) {
                            const data: IQueryParams = {
                                limit: 10,
                                skip: 0
                            };

                            data['paginate'] = true;

                            data['search'] = [
                                {
                                    fieldName: 'keyword',
                                    keyword: v
                                }
                            ];

                            this.field.salesTeam.highlight = v;

                            this.store.dispatch(TeamActions.searchTeamRequest({ payload: data }));
                        }
                    });

                // Handle save button action (footer)
                this.store
                    .select(FormSelectors.getIsClickSaveButton)
                    .pipe(
                        filter(isClick => !!isClick),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(isClick => {
                        this._onSubmit();
                    });
                return;
        }
    }

    /**
     *
     * Initialize form
     * @private
     * @memberof SalesRepInfoComponent
     */
    private _initForm(): void {
        if (this.pageType === 'new') {
            this.tmp['photo'] = new FormControl({ value: '', disabled: true });

            this.form = this.formBuilder.group({
                name: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.alpha({
                            allowWhiteSpace: true,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        })
                    ]
                ],
                phone: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.pattern({
                            expression: {
                                mobilePhone: /^08[0-9]{8,12}$/
                            },
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'mobile_phone_pattern',
                                '08'
                            )
                        })
                    ]
                ],
                newPassword: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.password({
                            validation: {
                                alphabet: true,
                                digit: true,
                                lowerCase: true,
                                upperCase: true,
                                specialCharacter: true,
                                minLength: 8
                            },
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'password_unmeet_specification'
                            )
                        })
                    ]
                ],
                confirmPassword: [
                    '',
                    [
                        RxwebValidators.compare({
                            fieldName: 'newPassword',
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'confirm_password'
                            )
                        })
                    ]
                ],
                photo: [
                    '',
                    [
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(5 * 1000 * 1000),
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(5 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                            )
                        })
                    ]
                ],
                identityId: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.digit({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        }),
                        RxwebValidators.minLength({
                            value: 16,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        }),
                        RxwebValidators.maxLength({
                            value: 16,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        })
                    ]
                ],
                team: [
                    '',
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ],
                status: ''
            });
        } else {
            this._initEditForm();
        }
    }

    private _initEditForm(): void {
        this.tmp['photo'] = new FormControl({ value: '', disabled: true });

        this.form = this.formBuilder.group({
            name: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.alpha({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            phone: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.pattern({
                        expression: {
                            mobilePhone: /^08[0-9]{8,12}$/
                        },
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'mobile_phone_pattern',
                            '08'
                        )
                    })
                ]
            ],
            photo: [
                '',
                [
                    RxwebValidators.fileSize({
                        maxSize: Math.floor(5 * 1000 * 1000),
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'file_size_lte',
                            { size: numeral(5 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                        )
                    })
                ]
            ],
            identityId: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    }),
                    RxwebValidators.minLength({
                        value: 16,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    }),
                    RxwebValidators.maxLength({
                        value: 16,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            team: [
                '',
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                })
            ],
            status: ''
        });

        this.store
            .select(SalesRepSelectors.getSelectedItem)
            .pipe(
                filter(v => !!v),
                takeUntil(this._unSubs$)
            )
            .subscribe(row => {
                const nameField = this.form.get('name');
                const phoneField = this.form.get('phone');
                const identityIdField = this.form.get('identityId');
                const teamField = this.form.get('team');
                const statusField = this.form.get('status');

                if (row.user) {
                    if (row.user.fullName) {
                        nameField.setValue(row.user.fullName);
                    }

                    if (nameField.invalid) {
                        nameField.markAsTouched();
                    }

                    if (row.user.mobilePhoneNo) {
                        phoneField.setValue(row.user.mobilePhoneNo);
                    }

                    if (phoneField.invalid) {
                        phoneField.markAsTouched();
                    }

                    if (row.user.idNo) {
                        identityIdField.setValue(row.user.idNo);
                    }

                    if (identityIdField.invalid) {
                        identityIdField.markAsTouched();
                    }

                    if (row.user.saleTeam) {
                        teamField.setValue(row.user.saleTeam);
                    }
                }

                if (row.status) {
                    const status = row.status === 'active' ? true : false;

                    statusField.setValue(status);
                }

                if (statusField.invalid) {
                    statusField.markAsTouched();
                }

                this.form.markAsPristine();
            });
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();

        if (this.pageType === 'new') {
            const canCreate = this.ngxPermissions.hasPermission('SRM.SR.CREATE');

            canCreate.then(hasAccess => {
                if (hasAccess) {
                    const team = body.team as Team;

                    const payload: SalesRepForm = {
                        fullName: body.name,
                        mobilePhoneNo: body.phone,
                        password: body.newPassword,
                        confPassword: body.confirmPassword,
                        idNo: body.identityId,
                        image: body.photo,
                        status: body.status ? EStatus.ACTIVE : EStatus.INACTIVE,
                        supplierId: null,
                        saleTeamId: team.id
                    };

                    this.store.dispatch(SalesRepActions.createSalesRepRequest({ payload }));
                } else {
                    this._$notice.open('Sorry, permission denied!', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }
            });
        }

        if (this.pageType === 'edit') {
            const canUpdate = this.ngxPermissions.hasPermission('SRM.SR.UPDATE');

            canUpdate.then(hasAccess => {
                if (hasAccess) {
                    const { id } = this.route.snapshot.params;
                    const team = body.team as Team;

                    const payload: SalesRepFormPatch = {
                        fullName: body.name,
                        mobilePhoneNo: body.phone,
                        idNo: body.identityId,
                        image: body.photo,
                        saleTeamId: team.id,
                        status: body.status ? EStatus.ACTIVE : EStatus.INACTIVE
                    };

                    if (!body.name) {
                        delete payload.fullName;
                    }

                    if (!body.phone) {
                        delete payload.mobilePhoneNo;
                    }

                    if (!body.identityId) {
                        delete payload.idNo;
                    }

                    if (!body.photo) {
                        delete payload.image;
                    }

                    if (typeof body.status !== 'boolean') {
                        delete payload.status;
                    }

                    if (Object.keys(payload).length > 0) {
                        this.store.dispatch(
                            SalesRepActions.updateSalesRepRequest({
                                payload: { body: payload, id }
                            })
                        );
                    }
                } else {
                    this._$notice.open('Sorry, permission denied!', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }
            });
        }
    }

    private _setFormStatus(status: string): void {
        if (!status) {
            return;
        }

        if (status === 'VALID' || !this.form.pristine) {
            this.store.dispatch(FormActions.setFormStatusValid());
        }

        if (status === 'INVALID' || this.form.pristine) {
            this.store.dispatch(FormActions.setFormStatusInvalid());
        }
    }
}

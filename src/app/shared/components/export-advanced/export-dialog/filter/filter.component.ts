import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Warehouse as Entity } from 'app/main/pages/logistics/warehouses/models';
import { WarehousesApiService as EntitiesApiService } from 'app/shared/components/dropdowns/single-warehouse/services';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import * as moment from 'moment';
import { Moment } from 'moment';
import {
    defaultExportFilterConfiguration,
    ExportConfiguration,
    ExportFilterConfiguration,
    ExportFormFilterConfiguration,
} from '../../models';

import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { Store as NgRxStore } from '@ngrx/store';
import { fromExportFilter, fromExportHistory } from '../../store/reducers';
import { ExportFilterActions, ExportHistoryActions } from '../../store/actions';
import { ExportConfigurationPage } from '../../models/export-filter.model';
import { environment } from 'environments/environment';
import { TExportHistoryAction } from '../../models/export-history.model';
import { ExportFilterSelector } from '../../store/selectors';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

@Component({
    selector: 'app-export-advanced-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent implements OnInit, OnDestroy {
    @Input() pageType: ExportConfigurationPage;
    @Input() useMedeaGo: boolean = false;
    @Output() selectedTabIndex: EventEmitter<number> = new EventEmitter<number>();

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    private _unSubs$: Subject<void> = new Subject<void>();
    isRequesting$: Observable<boolean>;
    isError$: Observable<boolean>;
    isError: boolean;

    isSubmit: boolean;
    historyTab: TExportHistoryAction;
    data: ExportConfiguration;
    form: FormGroup;
    action: string;
    dialogTitle: string;
    formConfig: any;
    activeConfiguration: ExportFormFilterConfiguration;
    statusSources: Array<{ id: string; label: string }> = [];
    typeSources: Array<{ id: string; label: string }> = [];

    warehouse: any;

    //dropdown list
    disabled = false;
    ShowFilter = true;
    limitSelection = false;
    dataWarehouse: Array<any> = [];
    selectedItems: Array<any> = [];
    dropdownSettings: any = {};

    minStartDate: Date;
    maxStartDate: Date = moment().toDate();
    minEndDate: Date;
    maxEndDate: Date = moment().toDate();

    //multiselect variable
    formName: string = 'warehouse';

    constructor(
        private cd$: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private _$errorMessage: ErrorMessageService,
        private notice$: NoticeService,
        private entityApi$: EntitiesApiService,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private exportFilterStore: NgRxStore<fromExportFilter.State>,
        private exportHistoryStore: NgRxStore<fromExportHistory.State>
    ) {}

    ngOnInit(): void {
        let DEFAULT_CONFIG: ExportFormFilterConfiguration;
        let hasDefaultConfig = false;

        this.data = {
            page: this.pageType
        };

        switch (this.pageType) {
            case 'stores':
            case 'catalogues':
            case 'payments':
            case 'invoices':
            case 'orders':
            case 'sales-rep':
                hasDefaultConfig = true;
                this.statusSources = HelperService.getStatusList(this.pageType);
                this.typeSources = HelperService.getTypesList(this.pageType);
                break;

            case 'journey-plans':
                hasDefaultConfig = true;
                break;
            
            case 'returns':
                hasDefaultConfig = true;
                this.exportFilterStore.select(ExportFilterSelector.getStatusList)
                    .pipe(
                        takeUntil(this._unSubs$),
                        map(data => 
                            data && data.map(val => ({ id: val.status, label: val.title }))
                        )
                    )
                    .subscribe(data => this.statusSources = data);
                break;

            case 'warehouses':
            case 'portfolios':
                break;

            default: {
                this.notice$.open(
                    `Something wrong with our web while opening export filter dialog.
                                    Please contact Sinbad Team. Error code: ERR_UNRECOGNIZED_EXPORT_PAGE_TYPE`,
                    'error',
                    {
                        horizontalPosition: 'right',
                        verticalPosition: 'bottom',
                        duration: 5000,
                    }
                );

                return;
            }
        }

        // History Type
        switch (this.pageType) {
            case 'payments':
                this.historyTab = 'export_fms';
                break;
            case 'invoices':
                this.historyTab = 'export_invoices';
                this.minStartDate = moment().subtract(1, 'years').toDate();
            case 'returns':
                this.historyTab = 'export_returns';
                break;
        }
        
        this.exportHistoryStore.dispatch(
            ExportHistoryActions.setExportHistoryPage({
                payload: {
                    page: this.pageType,
                    tab: this.historyTab,
                    useMedeaGo: this.useMedeaGo
                }
            })
        )

        if (hasDefaultConfig) {
            DEFAULT_CONFIG = defaultExportFilterConfiguration[this.pageType];
        }

        const { page, configuration = {} as ExportFilterConfiguration } = this.data;
        const { [page]: pageConfiguration = DEFAULT_CONFIG } = configuration;

        if (!this.data.configuration) {
            this.data.configuration = {
                [page]: pageConfiguration
            };
        }

        this.activeConfiguration = pageConfiguration;
        const { filterAspect } = this.activeConfiguration;

        this.form = this.formBuilder.group({});

        if (filterAspect.status) {
            const rules: Array<ValidatorFn> = [];

            this.form.addControl('status', this.formBuilder.control(''));

            if (filterAspect.status.required) {
                rules.push(
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.statusSources.map((r) => r.id)],
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    })
                );
                this.form.get('status').setValidators(rules);
            }
        }

        // tampilkan input untuk page 'catalogues'
        if (filterAspect.type) {
            const rules: Array<ValidatorFn> = [];

            this.form.addControl('type', this.formBuilder.control(''));

            if (filterAspect.type.required) {
                rules.push(
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.typeSources.map((r) => r.id)],
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    })
                );
                this.form.get('type').setValidators(rules);
            }
        }

        if (filterAspect.warehouse) {
            //mendapatkan warehouse dari api
            this.authStore.select(AuthSelectors.getUserSupplier).subscribe(({ supplierId }) => {
                if (supplierId) {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 1000,
                        skip: 0,
                    };
                    newQuery['supplierId'] = supplierId;
                    this.form.addControl('warehouse', this.formBuilder.control(''));
                    this.entityApi$
                        .find<IPaginatedResponse<Entity>>(newQuery, { version: '2' })
                        .subscribe((data) => {
                            HelperService.debug('[ExportFilterComponent] warehouse', { data });
                            this.dataWarehouse = data.data;
                            this.dropdownSettings = {
                                singleSelection: false,
                                idField: 'id',
                                textField: 'name',
                                selectAllText: 'Select All',
                                unSelectAllText: 'UnSelect All',
                                itemsShowLimit: 3,
                                maxHeight: 100,
                                allowSearchFilter: this.ShowFilter,
                            };

                            const rules: Array<ValidatorFn> = [];
                            if (filterAspect.warehouse.required) {
                                rules.push(Validators.required);
                                this.form.get('warehouse').setValidators(rules);
                            }
                        });
                }
            });
        }

        const defaultIsToday = this.pageType === 'returns';
        if (filterAspect.rangeDate) {
            const rangeDateRules: Array<ValidatorFn> = [];
            
            this.form.addControl('isToday', this.formBuilder.control(defaultIsToday));
            this.form.addControl('startDate', this.formBuilder.control(''));
            this.form.addControl('endDate', this.formBuilder.control(''));

            if (filterAspect.rangeDate.required) {
                rangeDateRules.push(
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    })
                );

                this.form.get('startDate').setValidators(rangeDateRules);
                this.form.get('endDate').setValidators(rangeDateRules);
            }
        }

        if (defaultIsToday) {
            this.onChangeToday({ checked: true })
        }

        this.cd$.markForCheck();
        this.exportFilterStore.dispatch(ExportFilterActions.truncateExportFilter());

        this.isError$ = this.exportFilterStore.select(ExportFilterSelector.getIsError);
        this.isError$
            .pipe(takeUntil(this._unSubs$))
            .subscribe(isError => this.isError = isError);

        this.isRequesting$ = this.exportFilterStore.select(ExportFilterSelector.getRequesting);
        this.isRequesting$
            .pipe(takeUntil(this._unSubs$))
            .subscribe(isRequesting => {
                if (this.isSubmit && !isRequesting && !this.isError) {
                    this.isSubmit = false;

                    // Move to tab history - data
                    this.selectedTabIndex.emit(2);
                }
            });
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }

    isRequired(type: string): boolean {
        if (!type || !this.activeConfiguration.filterAspect.hasOwnProperty(type)) {
            return false;
        }

        return this.activeConfiguration.filterAspect[type].required;
    }

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    switch (field) {
                        case 'end':
                        case 'start':
                            if (type === 'matDatepickerParse') {
                                return this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                );
                            } else {
                                return errors[type].message;
                            }

                        default:
                            return errors[type].message;
                    }
                }
            }
        }
    }

    onChangeDate(ev: MatDatepickerInputEvent<Moment>, field: string): void {
        if (!ev.value || !field) {
            return;
        }

        switch (field) {
            case 'startDate':
                {
                    const startDate = ev.value;
                    const endDate = this.form.get('endDate').value;

                    if (endDate) {
                        if (startDate.isAfter(endDate)) {
                            this.form.get('endDate').reset();
                        } else {
                            const duration = endDate.diff(
                                startDate,
                                this.activeConfiguration.filterAspect.rangeDate.maxRange.duration,
                                true
                            );

                            if (
                                duration >
                                this.activeConfiguration.filterAspect.rangeDate.maxRange.number
                            ) {
                                this.form.get('endDate').reset();
                            }
                        }
                    }

                    this.minEndDate = startDate.toDate();
                    const isAfter = moment(startDate)
                        .add(
                            this.activeConfiguration.filterAspect.rangeDate.maxRange.number,
                            this.activeConfiguration.filterAspect.rangeDate.maxRange.duration
                        )
                        .isAfter(moment());

                    if (isAfter) {
                        // const duration = this.activeConfiguration.filterAspect.rangeDate.maxRange.duration;
                        // const lowerDuration = duration === 'year' ? 'month' : duration === 'month' ? 'week' : duration === 'week' ? 'day' : 'day';

                        // const delta = Math.abs(moment(startDate).diff(moment(), lowerDuration));
                        // this.maxEndDate = moment(startDate).add(delta, lowerDuration).toDate();
                        this.maxEndDate = moment().toDate();
                    } else {
                        const mED = startDate.add(
                            this.activeConfiguration.filterAspect.rangeDate.maxRange.number,
                            this.activeConfiguration.filterAspect.rangeDate.maxRange.duration
                        );
                        this.maxEndDate = mED.toDate();
                    }
                }
                return;

            default:
                return;
        }
    }

    onChangeToday(ev: Partial<MatSlideToggleChange>): void {
        if (typeof ev.checked !== 'boolean') {
            return;
        }

        const today = ev.checked;

        if (today) {
            this.form.get('startDate').setValue(moment());
            this.form.get('startDate').disable();

            this.form.get('endDate').setValue(moment());
            this.form.get('endDate').disable();
        } else {
            this.form.get('startDate').reset();
            this.form.get('startDate').enable();

            this.form.get('endDate').reset();
            this.form.get('endDate').enable();
            this.minEndDate = null;
        }
    }

    onSubmit(): void {
        // Memeriksa apakah form sudah terpenuhi aturannya atau belum.
        if (this.form.invalid) {
            return;
        }

        // Mengambil data form.
        const formData = this.form.getRawValue();
        // Untuk menyimpan data form yang ingin dikirim.
        const formSend = {};

        if (formData.startDate) {
            formSend['dateGte'] = (formData.startDate as Moment).format('YYYY-MM-DD');
        } else {
            formSend['dateGte'] = '';
        }

        if (formData.endDate) {
            formSend['dateLte'] = (formData.endDate as Moment).format('YYYY-MM-DD');
        } else {
            formSend['dateLte'] = '';
        }

        if (formData.status) {
            formSend['status'] = formData.status;
        }

        if (formData.type) {
            formSend['type'] = formData.type;
        }

        if (formData.warehouse) {
            formSend['warehouse'] = formData.warehouse;
        }

        // Send export request 
        this.exportFilterStore.dispatch(
            ExportFilterActions.startExportRequest({
                payload: {
                    page: this.pageType,
                    formData: formSend,
                    paginate: false,
                    useMedeaGo: this.useMedeaGo
                }
            })
        );

        // Set History Tab
        this.exportHistoryStore.dispatch(
            ExportHistoryActions.setExportHistoryPage({
                payload: {
                    page: this.pageType,
                    tab: this.historyTab,
                    useMedeaGo: this.useMedeaGo
                }
            })
        )

        this.isSubmit = true
    }

    getFormError(form: any): string {
        return this._$errorMessage.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        const { ignoreTouched, ignoreDirty } = args;

        if (!form) {
            return false;
        }

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return (form.errors || form.status === 'INVALID') && form.touched;
        }

        if (ignoreTouched) {
            return (form.errors || form.status === 'INVALID') && form.dirty;
        }

        return (form.errors || form.status === 'INVALID') && (form.dirty || form.touched);
    }

}

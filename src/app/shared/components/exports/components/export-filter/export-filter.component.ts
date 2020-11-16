import { Warehouse as Entity } from 'app/main/pages/logistics/warehouses/models';
import {
    WarehousesApiService as EntitiesApiService,
    SingleWarehouseDropdownService,
} from 'app/shared/components/dropdowns/single-warehouse/services';
import { tap } from 'rxjs/operators';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { Moment } from 'moment';
import * as moment from 'moment';

import {
    defaultExportFilterConfiguration,
    ExportConfiguration,
    ExportFilterConfiguration,
    ExportFormFilterConfiguration,
} from '../../models';
import { Observable } from 'rxjs';

@Component({
    templateUrl: './export-filter.component.html',
    styleUrls: ['./export-filter.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportFilterComponent implements OnInit {
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
    formName:string = 'warehouse' ;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ExportConfiguration,
        private cd$: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private matDialogRef: MatDialogRef<ExportFilterComponent>,
        private errorMessageSvc: ErrorMessageService,
        private helper$: HelperService,
        private notice$: NoticeService,
        private entityApi$: EntitiesApiService
    ) {}

    ngOnInit(): void {
        let DEFAULT_CONFIG: ExportFormFilterConfiguration;
        let hasDefaultConfig = false;

        switch (this.data.page) {
            case 'stores':
            case 'catalogues':
            case 'payments':
            case 'orders':
            case 'sales-rep':
                hasDefaultConfig = true;
                this.statusSources = HelperService.getStatusList(this.data.page);
                this.typeSources = HelperService.getTypesList(this.data.page);
                break;

            case 'journey-plans':
                hasDefaultConfig = true;
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

        if (hasDefaultConfig) {
            DEFAULT_CONFIG = defaultExportFilterConfiguration[this.data.page];
        }

        const { page, configuration = {} as ExportFilterConfiguration } = this.data;
        const { [page]: pageConfiguration = DEFAULT_CONFIG } = configuration;

        // if (!this.data.configuration) {
        //     this.data.configuration = {
        //         [page]: pageConfiguration
        //     };
        // }

        this.activeConfiguration = pageConfiguration;
        const { filterAspect } = this.activeConfiguration;

        this.form = this.formBuilder.group({});

        if (filterAspect.status) {
            const rules: Array<ValidatorFn> = [];

            this.form.addControl('status', this.formBuilder.control(''));

            if (filterAspect.status.required) {
                rules.push(
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.statusSources.map((r) => r.id)],
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'pattern'),
                    })
                );
                this.form.get('status').setValidators(rules);
            }
        }

        if (filterAspect.type) {
            const rules: Array<ValidatorFn> = [];

            this.form.addControl('type', this.formBuilder.control(''));

            if (filterAspect.type.required) {
                rules.push(
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.typeSources.map((r) => r.id)],
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'pattern'),
                    })
                );
                this.form.get('type').setValidators(rules);
            }
        }

        if (filterAspect.warehouse) {
            //mendapatkan warehouse dari api
            const newQuery: IQueryParams = {
                paginate: true,
                limit: 15,
                skip: 0,
            };
            newQuery['supplierId'] = '1';
            this.form.addControl('warehouse', this.formBuilder.control(''));
            this.entityApi$
                .find<IPaginatedResponse<Entity>>(newQuery, { version: '2' })
                .subscribe((data) => {
                    console.log('ANGGRI========', data);
                    this.dataWarehouse = data.data;
                    this.dropdownSettings = {
                        singleSelection: false,
                        idField: 'id',
                        textField: 'code',
                        selectAllText: 'Select All',
                        unSelectAllText: 'UnSelect All',
                        itemsShowLimit: 3,
                        allowSearchFilter: this.ShowFilter,
                    };

                    const rules: Array<ValidatorFn> = [];
                    if (filterAspect.warehouse.required) {
                        rules.push(Validators.required);
                        this.form.get('warehouse').setValidators(rules);
                    }
                });
        }

        if (filterAspect.rangeDate) {
            const rangeDateRules: Array<ValidatorFn> = [];

            this.form.addControl('isToday', this.formBuilder.control(false));
            this.form.addControl('startDate', this.formBuilder.control(''));
            this.form.addControl('endDate', this.formBuilder.control(''));

            if (filterAspect.rangeDate.required) {
                rangeDateRules.push(
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    })
                );

                this.form.get('startDate').setValidators(rangeDateRules);
                this.form.get('endDate').setValidators(rangeDateRules);
            }
        }

        this.cd$.markForCheck();
    }

    onItemSelect(item: any) {
        console.log('onItemSelect', item);
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
                                return this.errorMessageSvc.getErrorMessageNonState(
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

    onChangeToday(ev: MatSlideToggleChange): void {
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
        }
    }

    onClose(): void {
        this.matDialogRef.close();
    }

    onViewHistory(): void {
        this.matDialogRef.close({ page: this.data.page, payload: { viewHistory: true } });
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

        // Memproses data form berdasarkan halamannya.
        // switch (this.data.page) {
        //     case 'orders': {
        //         formSend['dateGte'] = (formData.startDate as Moment).format('YYYY-MM-DD');
        //         formSend['dateLte'] = (formData.endDate as Moment).format('YYYY-MM-DD');
        //         formSend['status'] = formData.status;

        //         break;
        //     }
        // }

        // Menutup form sekaligus mengirim data form-nya.
        this.matDialogRef.close({ page: this.data.page, payload: formSend });
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
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

    getExportFilterDialogTitle(): string {
        switch (this.data.page) {
            case 'catalogues':
                return '(Catalogue)';

            case 'journey-plans':
                return '(Journey Plan)';

            case 'orders':
                return '(OMS)';

            case 'payments':
                return '(Payment Status)';

            case 'portfolios':
                return '(Portfolio of Store)';

            case 'sales-rep':
                return '(Sales Rep)';

            case 'stores':
                return '(Store List)';

            case 'warehouses':
                return '(Warehouses)';

            default:
                return '';
        }
    }
}

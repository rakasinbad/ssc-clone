import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatPaginator, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    takeUntil,
    tap,
} from 'rxjs/operators';
import 'moment-timezone';
import { fuseAnimations } from '@fuse/animations';
import { RxwebValidators, NumericValueType } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, NoticeService, HelperService } from 'app/shared/helpers';
import { IReturnCatalogue } from '../../models/returndetail.model';
import { Store } from '@ngrx/store';
import { returnsReducer } from '../../store/reducers';
import { ReturnActions } from '../../store/actions';
import { ReturnsSelector } from '../../store/selectors';

type IFormMode = 'view' | 'edit';
interface IData {
    title: string;
    message: string;
    dataSource: Array<IReturnCatalogue>;
    originalDataSource: Array<IReturnCatalogue>;
    id: string;
    status: string;
    returned: boolean;
    returnNumber: string;
}

@Component({
    templateUrl: './change-confirmation-table.component.html',
    styleUrls: ['./change-confirmation-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class ChangeConfirmationTableComponent implements OnInit, OnDestroy {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: IData,
        private dialogRef:  MatDialogRef<ChangeConfirmationTableComponent>, 
        private _$errorMessage: ErrorMessageService,
        private _$notice: NoticeService,
        private formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private store: Store<returnsReducer.FeatureState>,
    ) {}
    isLoading$: Observable<boolean>;
    returnInfoViewData$: Observable<any>;
    defaultViewData: any;
    displayedReturnLineColumns: Array<string> = [
        'product-name',
        'qty',
        'unit-price',
        'total-price',
        'return-reason',
        'note',
    ];

    form: FormGroup;
    formModeValue: IFormMode[] = [];
    formValueBeforeSave: Array<string> = [];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    errorMessages: Array<string> = [];
    haveErrorMinNumber: boolean = false;
    
    private unSubs$: Subject<any> = new Subject();
    private _errorMinNumber: string = "You can't proceed the approval if all the quantity value is 0";
    private _errorMaxNumber: string = "Return Quantity is bigger than Order Quantity";

    get formMode(): IFormMode[] {
        return this.formModeValue;
    }

    get returnData(): FormArray {
        return this.form.get('returnData') as FormArray;
    }

    set formMode(mode: IFormMode[]) {
        this.formModeValue = mode;
    }
    
    ngOnInit(): void {
        this._initFormDatasource();
        this.store.select(ReturnsSelector.getIsLoading)
        .pipe(
            takeUntil(this.unSubs$)
        )
        .subscribe(isLoading => {
            if (isLoading) {
                this.dialogRef.close();
            }
        });
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
        this.data.dataSource = [...this.data.originalDataSource];
    }

    approvedQty(idx): AbstractControl {
        return this.form.get(['returnData', idx, 'approvedQty']) as AbstractControl;
    }

    approvedUnitPrice(idx): AbstractControl {
        return this.form.get(['returnData', idx, 'approvedUnitPrice']) as AbstractControl;
    }

    private _initFormDatasource(): void {
        this.form = this.formBuilder.group({
            returnData: this.formBuilder.array([]),
        });

        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug('[ReturnDetailComponent] Before MAP', value)
                ),
                map((value) => {
                    return value;
                }),
                tap((value) =>
                    HelperService.debug('[ReturnDetailComponent] After MAP', value)
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                HelperService.debug('[ReturnDetailComponent] value change', value)
            });

        if (this.data.dataSource) {
            this.data.dataSource.map((data) => {
                this.createReturnDataForm(data);
                this.formMode.push('view');
            })
        }
    }

    formatRp(data: any): string {
        const dataNum = Number(data);
        return !isNaN(dataNum) ? dataNum.toLocaleString(
            'id',
            {
                style: 'currency',
                currency: 'IDR',
            }
        ) : null;
    }

    onClickEdit(row: IReturnCatalogue, idx: number) {
        this.formMode[idx] = 'edit';
        this.formValueBeforeSave[idx] = this.approvedQty(idx).value;
    }

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

    private createReturnDataForm(data: IReturnCatalogue): void {
        const row = this.formBuilder.group({
            approvedQty: [
                { value: data.returnQty, disabled: false },
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.Both,
                        allowDecimal: false,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.maxNumber({
                        /** TODO-kanzun-43: sesuaikan value max sesuai order */
                        value: 100,
                        message: this._errorMaxNumber,
                    }),
                ],
            ],
            approvedUnitPrice: [
                { value: data.unitPrice, disabled: false }
            ],
            id: [
                { value: data.id, disabled: false }
            ],
        });
        this.returnData.push(row);
    }

    onCancelEditQty(idx: number) {
        this.approvedQty(idx).setValue(this.formValueBeforeSave[idx]);
        this.formMode[idx] = 'view';
    }

    onSaveEditQty(row, idx: number) {
        this.checkMinNumber();
        this.checkMaxNumber(idx);
        const totalPrice = this.approvedQty(idx).value * row.unitPrice;
        /** update datasource */
        this.data.dataSource[idx] = {
            ...row,
            returnQty: this.approvedQty(idx).value,
            totalPrice
        };
        this.data.dataSource = [...this.dialogRef.componentInstance.data.dataSource];
        this._changeDetectorRef.markForCheck();
        this._changeDetectorRef.detectChanges();
        this.formMode[idx] = 'view';
    }

    getTotal(fieldName: string): number {
        if (this.dialogRef.componentInstance.data.dataSource.length > 0) {
            return this.dialogRef.componentInstance.data.dataSource.map(item => item[fieldName]).reduce((prev, next) => prev + next);
        }
        return 0;
    }

    onOkButton() {
        this.store.dispatch(ReturnActions.confirmChangeStatusReturn({
            payload: { 
                id: this.data.id, 
                change: {
                    status: this.data.status,
                    returnItems: this.returnData.value
                }, 
                returned: this.data.returned, 
                tableData: this.data.dataSource, 
                returnNumber: this.data.returnNumber 
            }
        }));
    }

    hasError(form: any, isMatError = false): boolean {
        if (!form) {
            return;
        }
        const errors = form.errors;
        const touched = form.touched;
        const dirty = form.dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }
    
        return errors && ((touched && dirty) || touched);
    }

    checkMinNumber(): void {
        const haveError: boolean = this.returnData.value.every(data => data.approvedQty === 0);
        const isErrorExist: boolean = this.errorMessages.includes(this._errorMinNumber);
        if (haveError && !isErrorExist) {
            this.errorMessages.push(this._errorMinNumber);
            this.haveErrorMinNumber = true;
        }

        if (!haveError && isErrorExist) {
            const indexError = this.errorMessages.findIndex(data => data.includes(this._errorMinNumber))
            this.errorMessages.splice(indexError, 1);
            this.haveErrorMinNumber = false;
        }
    }

    checkMaxNumber(idx: number): void {
        const haveError = this.returnData.invalid;
        const isErrorExist: boolean = this.errorMessages.includes(this._errorMaxNumber);
        if (haveError && !isErrorExist) {
            this.errorMessages.push(this._errorMaxNumber);
        }

        if (!haveError && isErrorExist) {
            const indexError = this.errorMessages.findIndex(data => data.includes(this._errorMaxNumber))
            this.errorMessages.splice(indexError, 1);
        }
    }
}

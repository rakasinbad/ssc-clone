import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { OrderLineType } from 'app/shared/models/order-line-type.model';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderFacadeService } from '../../services';
import { OmsOrderLineDataSource } from './oms-order-line.datasource';

@Component({
    selector: 'app-oms-order-line',
    templateUrl: './oms-order-line.component.html',
    styleUrls: ['./oms-order-line.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmsOrderLineComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        'sku',
        'product',
        'order-qty',
        'unit-price',
        'gross-price',
        'discount-price',
        'type',
    ];

    dataSource: OmsOrderLineDataSource;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @Input()
    orderLineType: OrderLineType = 'non_bonus';

    @Input()
    type: string;

    @Input()
    editable: boolean;

    @Output('formValue')
    formValue: EventEmitter<any>;

    @Output('onChange')
    submitable: EventEmitter<boolean>;


    form: FormGroup;

    private _unSubs$: Subject<any> = new Subject();

    constructor(
        private orderFacade: OrderFacadeService,
        private formBuilder: FormBuilder,
        private errorMessageSvc: ErrorMessageService
    ) {
        this.formValue = new EventEmitter();
        this.submitable = new EventEmitter();
    }

    get catalogues(): FormArray {
        return this.form.get('catalogues') as FormArray;
    }

    ngOnInit(): void {
        this._getOrderBrandCatalogue(this.orderLineType);

        this.form = this.formBuilder.group({
            catalogues: this.formBuilder.array([]),
        });

        this.dataSource.data$.pipe(
            takeUntil(this._unSubs$)
        ).subscribe((result) => {
            if (!!result) {
                result.forEach((v) => this.setForm(v, this.orderLineType))
            }
        });

        this.form.statusChanges.pipe(
            takeUntil(this._unSubs$)
        ).subscribe(() => {
            this.submitable.emit(this.form.invalid);
        });

        this.form.valueChanges.pipe(
            takeUntil(this._unSubs$)
        ).subscribe(() => {
            this.formValue.emit(this.form.getRawValue());
        });

        this.submitable.emit(this.form.invalid);
    }

    setForm(v, type) : void {
        var row: any;
        
        if (type === 'non_bonus') {
            row = this.formBuilder.group({
                orderBrandCatalogueId: v.id,
                invoicedQty: [
                    v.qty,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                        }),
                        RxwebValidators.numeric({
                            acceptValue: NumericValueType.PositiveNumber,
                            allowDecimal: false,
                            message: this.errorMessageSvc.getErrorMessageNonState('default', 'pattern'),
                        }),
                        RxwebValidators.minNumber({
                            value: 0,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 0 }
                            ),
                        }),
                        RxwebValidators.maxNumber({
                            value: 999999,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'max_number',
                                { maxValue: 999999 }
                            ),
                        }),
                    ],
                ],
                cataloguePromo: [
                    v.cataloguePromo,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                        }),
                        RxwebValidators.numeric({
                            acceptValue: NumericValueType.PositiveNumber,
                            allowDecimal: false,
                            message: this.errorMessageSvc.getErrorMessageNonState('default', 'pattern'),
                        }),
                        RxwebValidators.minNumber({
                            value: 0,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 0 }
                            ),
                        }),
                        RxwebValidators.maxNumber({
                            value: 99999999,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'max_number',
                                { maxValue: 99999999 }
                            ),
                        }),
                    ],
                ],
            });    
        } else if(type === 'bonus') {
            row = this.formBuilder.group({
                promoOrderBrandCatalogueId: v.id,
                promoQty: [
                    v.qty,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                        }),
                        RxwebValidators.numeric({
                            acceptValue: NumericValueType.PositiveNumber,
                            allowDecimal: false,
                            message: this.errorMessageSvc.getErrorMessageNonState('default', 'pattern'),
                        }),
                        RxwebValidators.minNumber({
                            value: 0,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 0 }
                            ),
                        }),
                        RxwebValidators.maxNumber({
                            value: 999999,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'max_number',
                                { maxValue: 999999 }
                            ),
                        }),
                    ],
                ],
            });    
        }

        this.catalogues.push(row);
    }

    private _getOrderBrandCatalogue(type: OrderLineType): void {
        this.dataSource = new OmsOrderLineDataSource(this.orderFacade, type);
    }
}
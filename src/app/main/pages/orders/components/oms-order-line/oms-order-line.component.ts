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

    form: FormGroup;

    private _unSubs$: Subject<any> = new Subject();

    constructor(
        private orderFacade: OrderFacadeService,
        private formBuilder: FormBuilder,
        private errorMessageSvc: ErrorMessageService
    ) {
        this.formValue = new EventEmitter();
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
                result.forEach((v) => this.setForm(v))
            }
        });

        this.form.valueChanges.pipe(
            takeUntil(this._unSubs$)
        ).subscribe((result) => {
            this.formValue.emit(result);
        });
    }

    setForm(v) : void {
        const row = this.formBuilder.group({
            orderBrandCatalogueId: v.id,
            qtyChange: [
                { value: v.qty, disabled: false },
                [
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: false,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ]
        });


        this.catalogues.push(row);
    }

    private _getOrderBrandCatalogue(type: OrderLineType): void {
        this.dataSource = new OmsOrderLineDataSource(this.orderFacade, type);
    }
}

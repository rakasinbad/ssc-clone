import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    AbstractControl,
    ValidatorFn,
    ValidationErrors,
} from '@angular/forms';
import { MatDialog, MatPaginator, MatRadioChange, MatSort, PageEvent } from '@angular/material';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { Selection } from 'app/shared/components/dropdowns/select-advanced/models';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { FormStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { FormSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import {
    debounceTime,
    delay,
    distinctUntilChanged,
    map,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { CataloguePriceSegmentationDataSource } from '../../datasources';
import {
    AdjustCataloguePriceDto,
    Catalogue,
    MaxOrderQtySegmentationDto,
    ConditionBulkDto,
} from '../../models';
import { CataloguePrice } from '../../models/catalogue-price.model';
import { CatalogueTax, PricingType } from '../../models/classes/catalogue-tax.class';
import {
    CatalogueFacadeService,
    CataloguesService,
    CatalogueTaxFacadeService,
} from '../../services';
import { CatalogueActions, CatalogueDetailPageActions } from '../../store/actions';
import { fromCatalogue } from '../../store/reducers';
import { CatalogueSelectors } from '../../store/selectors';
import { CalculateAfterTaxPipe, CalculateBeforeTaxPipe } from '../../pipes';

type IFormMode = 'add' | 'view' | 'edit';
const INCLUDE_PPN = 'include_ppn';
const EXCLUDE_PPN = 'exclude_ppn';

interface IUpdateSegmentedPricePayload {
    priceSettingId: string;
    price: number;
    priceIndex: number;
}

@Component({
    selector: 'catalogue-price-settings',
    templateUrl: './catalogue-price-settings.component.html',
    styleUrls: ['./catalogue-price-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CataloguePriceSettingsComponent implements OnInit, OnChanges, OnDestroy {
    private trigger$: BehaviorSubject<string> = new BehaviorSubject('');
    private subs: Subscription = new Subscription();
    private selectedSegmentationPrice$: BehaviorSubject<IUpdateSegmentedPricePayload> =
        new BehaviorSubject<IUpdateSegmentedPricePayload>(null);
    private segmentationPriceChanges$: BehaviorSubject<IUpdateSegmentedPricePayload> =
        new BehaviorSubject<IUpdateSegmentedPricePayload>(null);
    // Untuk keperluan subscription.
    private unSubs$: Subject<any> = new Subject();
    // Untuk keperluan memicu adanya perubahan view.
    private updateForm$: BehaviorSubject<IFormMode> = new BehaviorSubject<IFormMode>(null);
    private selectedCatalogue$: BehaviorSubject<Catalogue> = new BehaviorSubject<Catalogue>(null);
    private isDelete: boolean = false;
    private isApplyFilter: boolean = false;

    defaultPageSizeTable: Array<number> = environment.pageSizeTable;

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    selectedCatalogueId: number;
    selectedSegmentId: string;

    // Untuk form.
    form: FormGroup;
    filterForm: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';
    // Untuk mendapatkan nilai status loading dari state-nya catalogue.
    isLoading$: Observable<boolean>;
    // Untuk menyimpan price settings-nya catalogue.
    cataloguePrices$: Observable<CataloguePrice[]>;
    // Untuk menyimpan jumlah price setting-nya catalogue yang tersedia di back-end.
    totalCataloguePrice$: Observable<number>;
    // Untuk menyimpan kolom tabel yang ingin dimunculkan.
    displayedColumns: string[] = [
        'segmentation-name',
        'warehouse-name',
        'store-type',
        'store-group',
        'store-channel',
        'store-cluster',
        'price',
        'price-after-tax',
        'custom-qty',
        'max-order-qty',
    ];

    displayedColumnsPriceSettings: string[] = [
        'level',
        'min-qty',
        'price-exclude-tax',
        'price-include-tax',
    ];

    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
    isLoading: boolean;
    totalItem: number;
    totalItemPriceSettings: number;

    formClass: {
        'custom-field-right': boolean;
        'custom-field': boolean;
        'view-field-right': boolean;
    };

    cataloguePriceTools: string[] = ['warehouse', 'type', 'group', 'channel', 'cluster'];

    dataSource: CataloguePriceSegmentationDataSource;
    // dataSourcePriceSettings: MatTableDataSource<ConditionBulkDto>;
    dataSourcePriceSettings: Array<ConditionBulkDto> = [];

    bulkPriceSettingStatus: string = null;

    @Output()
    formStatusChange: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    formValueChange: EventEmitter<Catalogue> = new EventEmitter();

    @Output()
    changePage: EventEmitter<void> = new EventEmitter();

    // Untuk mendapatkan event ketika form mode berubah.
    @Output()
    formModeChange: EventEmitter<IFormMode> = new EventEmitter();

    @Input()
    get formMode(): IFormMode {
        return this.formModeValue;
    }

    set formMode(mode: IFormMode) {
        this.formModeValue = mode;
        this.formModeChange.emit(this.formModeValue);
    }

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef<HTMLElement>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    @ViewChild('alertDelete', { static: false })
    alertDelete: TemplateRef<any>;

    @ViewChild('dialogAdjustPrice', { static: false })
    dialogAdjustPrice: TemplateRef<any>;

    tmpProductName: string;
    tmpSegmentationName: string;
    tmpWarehouses: any[] = [];
    tmpTypes: any[] = [];
    tmpGroups: any[] = [];
    tmpChannels: any[] = [];
    tmpClusters: any[] = [];
    tmpPrice: number;
    adjustPriceCtrl: FormControl = new FormControl();
    adjustPriceForm: FormGroup = this.fb.group({
        warehouses: '',
        types: '',
        groups: '',
        channels: '',
        clusters: '',
        price: '',
    });
    taxes: CatalogueTax[];
    pricingTypes: PricingType[] = [
        {
            id: EXCLUDE_PPN,
            name: 'Exclude PPN',
            tooltip: 'Price will be calculated based on the ppn',
        },
        {
            id: INCLUDE_PPN,
            name: 'Include PPN',
            tooltip:
                'You need to input the price including PPN. PPN calculation will be shown on the invoice',
        },
    ];
    statusAddBulkFirst: boolean = false;
    statusFormBulk: boolean = false; /** jika nilainya TRUE maka form bulk price INVALID */
    catalogueMinQty: number = 0;

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private authFacade: AuthFacadeService,
        private catalogueFacade: CatalogueFacadeService,
        private store: NgRxStore<fromCatalogue.FeatureState>,
        private catalogue$: CataloguesService,
        private applyDialogFactoryService: ApplyDialogFactoryService,
        private errorMessage$: ErrorMessageService,
        private readonly catalogueTaxFacade: CatalogueTaxFacadeService,
        private calculateAfterTaxPipe: CalculateAfterTaxPipe,
        private calculateBeforeTaxPipe: CalculateBeforeTaxPipe
    ) {}

    ngOnInit(): void {
        const { id } = this.route.snapshot.params;
        this.selectedCatalogueId = id;

        this.dataSource = new CataloguePriceSegmentationDataSource(this.catalogueFacade);

        this.form = this.fb.group({
            id: null,
            supplierId: null,
            discountRetailBuyerPrice: null,
            discountRetailBuyerPriceView: null,
            tax: [
                0,
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            taxView: 0,
            retailBuyingPrice: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: 'Price must be greater than 0',
                    }),
                ],
            ],
            retailBuyingPriceView: null,
            retailBuyingPriceAfterTax: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: 'Price must be greater than 0',
                    }),
                ],
            ],
            retailBuyingPriceAfterTaxView: null,
            priceToAll: null,
            priceSettings: this.fb.array([]),
            advancePrice: false,
            bulkPrices: this.fb.array(
                [],
                this.bulkPriceSettingStatus === 'bulk_pricing'
                    ? (this._checkConditionsBulkPrices as ValidatorFn)
                    : null
            ),
            pricingType: [
                EXCLUDE_PPN,
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
        });

        //data bulk price setting
        this.store
            .select(CatalogueSelectors.getCataloguePriceBulkSettings)
            .pipe(takeUntil(this.unSubs$))
            .subscribe((payload) => {
                this.bulkPriceSettingStatus = payload.code;
                this.cdRef.detectChanges();
            });

        // Get tax list
        this.catalogueTaxFacade.catalogueTaxes$
            .pipe(
                tap((taxes) => {
                    if (!taxes || !taxes.length) {
                        this.catalogueTaxFacade.fetchCatalogueTaxes();
                    }
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe((taxes) => {
                this.taxes = taxes;
                this.cdRef.detectChanges();
            });

        /* this.dataSource
            .collections$()
            .pipe(
                tap(() => {
                    if (this.formModeValue === 'edit') {
                        this.updateForm$.next(this.formModeValue);
                    }
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe(); */

        this.catalogue$
            .getUpdateForm()
            .pipe(
                tap((value) => HelperService.debug('UPDATE FORM CHANGED', value)),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                if (value) {
                    if (this.isDelete) {
                        // const priceSettingsCtrl = this.form.get('priceSettings') as FormArray;

                        // priceSettingsCtrl.removeAt(+value);
                        // this._initTable;
                        this.isDelete = null;
                    } else {
                        const formControl = this.form.get(['priceSettings', value, 'price']);

                        formControl.enable({ onlySelf: true, emitEvent: false });
                        formControl.markAsPristine();
                        formControl.markAsUntouched();
                    }
                }
            });

        this.catalogueFacade.isRefresh$.pipe(takeUntil(this.unSubs$)).subscribe((isRefresh) => {
            if (isRefresh) {
                // this.onApplyFilter();
                // this._initTable(this.selectedCatalogue$.value.id);
            }

            this.catalogueFacade.setRefresh(false);
        });

        this.filterForm = this.fb.group({
            warehouses: [''],
            storeType: [''],
            storeGroup: [''],
            storeChannel: [''],
            storeCluster: [''],
        });

        this._checkRoute();
        this._initFormCheck();

        combineLatest([
            this.dataSource.isLoading$,
            this.dataSource.totalCataloguePrice$,
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
        ])
            .pipe(
                map(([isLoading, totalItem, catalogueDetail]) => ({
                    isLoading,
                    totalItem,
                    catalogueDetail,
                })),
                tap(() => {
                    if (this.formModeValue === 'edit') {
                        this.updateForm$.next(this.formModeValue);
                    }
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe(({ isLoading, totalItem, catalogueDetail }) => {
                this.isLoading = isLoading;
                this.totalItem = totalItem;
                if (catalogueDetail) {
                    this.catalogueMinQty = catalogueDetail.minQty;
                }

                this.form
                    .get('advancePrice')
                    .setValue(this.isApplyFilter ? this.isApplyFilter : totalItem > 0);

                this.cdRef.markForCheck();
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (
                (!changes['formMode'].isFirstChange() &&
                    changes['formMode'].currentValue === 'edit') ||
                changes['formMode'].currentValue === 'view'
            ) {
                this.trigger$.next('');
                this.updateForm$.next(changes['formMode'].currentValue);
            }
        }
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();

        this.updateForm$.next(null);
        this.updateForm$.complete();

        if (!this.subs.closed) {
            this.subs.unsubscribe();
        }

        this.store.dispatch(CatalogueActions.resetCataloguePriceSettings());
    }

    drop(event: CdkDragDrop<string[]>): void {
        // this.cataloguePriceTools.
        moveItemInArray(this.cataloguePriceTools, event.previousIndex, event.currentIndex);
    }

    isAddMode(): boolean {
        return this.formMode === 'add';
    }

    isEditMode(): boolean {
        return this.formMode === 'edit';
    }

    isViewMode(): boolean {
        return this.formMode === 'view';
    }

    get bulkPriceSetting(): FormArray {
        return this.form.get('bulkPrices') as FormArray;
    }

    get bulkPriceSettingCtrl(): AbstractControl[] {
        return this.bulkPriceSetting.controls;
    }

    addCondition(idx?: number): void {
        this.statusAddBulkFirst = true;

        const conditions = this.bulkPriceSetting.getRawValue();

        if (conditions && conditions.length > 0) {
            const nextIdx = conditions.length;
            const prevIdx = conditions.length - 1;

            if (prevIdx >= 0) {
                const prevCondition = conditions[prevIdx];

                //setting auto fill if add minQty+2 dan price -1

                //jika pny min Qty dan > 0
                if (prevCondition && prevCondition.minQty > 0) {
                    prevCondition.minQty = parseInt(prevCondition.minQty);
                } else {
                    //jika min Qty kosong "" atau 0
                    prevCondition.minQty = nextIdx * 2;
                }

                //jika pny price dan > 0
                if (prevCondition && prevCondition.price > 0) {
                    prevCondition.price = parseInt(prevCondition.price);
                } else {
                    let produkBasePrice = this.form.get('retailBuyingPrice').value;
                    prevCondition.price = parseInt(produkBasePrice) - nextIdx;
                }

                this.bulkPriceSetting.push(
                    this._createConditionsBulk(new ConditionBulkDto(prevCondition), nextIdx + 1)
                );
            }

            this.bulkPriceSettingCtrl.forEach((data, idx) => {
                if (data.value.price < 1 || data.value.priceAfterTax < 1) {
                    this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'error');
                    this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'error');
                    this.formStatusChange.emit('INVALID');
                } else {
                    this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'success');
                    this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'success');
                    this.formStatusChange.emit('VALID');
                }
            });

            return;
        }

        this.bulkPriceSetting.push(this._createConditionsBulk());

        this.bulkPriceSettingCtrl.forEach((data, idx) => {
            if (data.value.price < 1 || data.value.priceAfterTax < 1) {
                this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'error');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'error');
                this.formStatusChange.emit('INVALID');
            } else {
                this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'success');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'success');
                this.formStatusChange.emit('VALID');
            }
        });
    }

    /* Start Handle Error Form */

    deleteCondition(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        let lastIdx = idx;
        let prevLastIdx = idx;

        this.bulkPriceSetting.removeAt(idx);

        const pricingType = this.form.get('pricingType').value;
        const tax = this.form.get('tax').value;

        const config =
            pricingType === EXCLUDE_PPN
                ? {
                      bulkPriceProperty: 'price',
                      priceProperty: 'retailBuyingPrice',
                  }
                : {
                      bulkPriceProperty: 'priceAfterTax',
                      priceProperty: 'retailBuyingPriceAfterTax',
                  };

        const conditionsBulknya = this.bulkPriceSetting.getRawValue();

        if (conditionsBulknya && conditionsBulknya.length > 0) {
            const nextIdx = conditionsBulknya.length;
            lastIdx = nextIdx - 1;
            prevLastIdx = nextIdx;
            let newValue = [];
            let retailBuyingPrice = 0;

            if (this.form.get(config.priceProperty).value) {
                retailBuyingPrice = isNaN(
                    parseInt(
                        String(this.form.get(config.priceProperty).value)
                            .replace(new RegExp('Rp', 'g'), '')
                            .split('.')
                            .join('')
                    )
                )
                    ? 0
                    : parseInt(
                          String(this.form.get(config.priceProperty).value)
                              .replace(new RegExp('Rp', 'g'), '')
                              .split('.')
                              .join('')
                      );
            }

            for (var i = 0; i < conditionsBulknya.length; i++) {
                conditionsBulknya[i].level = i + 1;
                newValue.push(conditionsBulknya[i]);

                const currentPrice = parseInt(
                    String(conditionsBulknya[i][config.bulkPriceProperty]).replace(/\.00/g, ''),
                    10
                );
                const previousLevelPrice = conditionsBulknya[i - 1]
                    ? parseInt(
                          String(conditionsBulknya[i - 1][config.bulkPriceProperty]).replace(
                              /\.00/g,
                              ''
                          ),
                          10
                      )
                    : retailBuyingPrice;

                /** pengecekan level saat ini ke level sebelumnya */
                if (pricingType === EXCLUDE_PPN) {
                    if (currentPrice >= previousLevelPrice) {
                        newValue[i].price = previousLevelPrice - 1;
                    } else {
                        newValue[i].price = currentPrice;
                    }
                    newValue[i].priceAfterTax = this.calculateAfterTaxPipe.transform(
                        newValue[i].price.toString(),
                        tax
                    );
                } else {
                    if (currentPrice >= previousLevelPrice) {
                        newValue[i].priceAfterTax = previousLevelPrice - 1;
                    } else {
                        newValue[i].priceAfterTax = currentPrice;
                    }
                    newValue[i].price = this.calculateBeforeTaxPipe.transform(
                        newValue[i].priceAfterTax.toString(),
                        tax
                    );
                }

                this._onChangeInputStyle(`bulkPrice.price.${i}`, 'success');
                this._onChangeInputStyle(`bulkPrice.price.${i + 1}`, 'success');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${i}`, 'success');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${i + 1}`, 'success');
            }

            if (newValue.length) {
                this.bulkPriceSetting.setValue(newValue);
            }
        } else {
            while (idx <= lastIdx) {
                // this._newTierValidation(idx);
                idx++;
            }
        }

        if (conditionsBulknya.length > 0) {
            this.comparedata(this.form.get('bulkPrices').value);
        }

        if (this.form.status === 'VALID' && !this.statusFormBulk) {
            this.formStatusChange.emit('VALID');
        } else if (this.form.status === 'VALID' && this.statusFormBulk) {
            this.formStatusChange.emit('INVALID');
        }
    }

    private _checkConditionsBulkPrices(control: AbstractControl): ValidationErrors {
        const onChangeInputStyle = (elementId, type) => {
            const attribute =
                type === 'success'
                    ? {
                          color: 'black',
                          border: '1px solid lightgray',
                          borderRadius: '4px',
                      }
                    : {
                          color: 'red',
                          border: '1px solid red',
                          borderRadius: '4px',
                      };
            if (document.getElementById(elementId)) {
                try {
                    document.getElementById(elementId).style.color = attribute.color;
                    document.getElementById(elementId).style.border = attribute.border;
                    document.getElementById(elementId).style.borderRadius = attribute.borderRadius;
                } catch (err) {
                    console.error(err);
                }
            }
        };

        const values = control.value;

        const invalidMinQty = [];
        const invalidPrice = [];
        const invalidPriceAfterTax = [];
        let statusnya = false;

        if (values.length === 1) {
            if (Math.floor(Number(values[values.length - 1].minQty)) === 0) {
                onChangeInputStyle(`bulkPrice.minQty.${0}`, 'error');
                invalidMinQty.push(0);
            }
            if (Math.floor(Number(values[values.length - 1].price)) === 0) {
                onChangeInputStyle(`bulkPrice.price.${0}`, 'error');
                invalidPrice.push(0);
            }
            if (Math.floor(Number(values[values.length - 1].priceAfterTax)) === 0) {
                onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'error');
                invalidPriceAfterTax.push(0);
            }
        } else {
            values.forEach(
                (
                    curItem: { level: any; minQty: string; price: string; priceAfterTax: string },
                    index: number,
                    arr: Array<{ level: any; minQty: string; price: string; priceAfterTax: string }>
                ) => {
                    if (!index) {
                        return;
                    }

                    const prevItem = arr[index - 1];

                    if (parseFloat(curItem.minQty) <= parseFloat(prevItem.minQty)) {
                        invalidMinQty.push(index);
                        statusnya = true;
                        onChangeInputStyle(`bulkPrice.minQty.${index}`, 'error');
                    } else {
                        onChangeInputStyle(`bulkPrice.minQty.${index}`, 'success');
                    }

                    if (parseFloat(curItem.price) >= parseFloat(prevItem.price)) {
                        invalidPrice.push(index);
                        statusnya = true;
                        onChangeInputStyle(`bulkPrice.price.${index}`, 'error');
                    } else {
                        onChangeInputStyle(`bulkPrice.price.${index}`, 'success');
                    }

                    if (parseFloat(curItem.priceAfterTax) >= parseFloat(prevItem.priceAfterTax)) {
                        invalidPrice.push(index);
                        statusnya = true;
                        onChangeInputStyle(`bulkPrice.priceAfterTax.${index}`, 'error');
                    } else {
                        onChangeInputStyle(`bulkPrice.priceAfterTax.${index}`, 'success');
                    }
                }
            );
        }

        if (!invalidMinQty.length && !invalidPrice.length && !invalidPriceAfterTax.length) {
            return null;
        }

        const errors = new Map();

        invalidMinQty.forEach((item) => {
            errors.set(item, {
                invalidMinQty: true,
            });
        });

        invalidPrice.forEach((item) => {
            const co = errors.get(item) || {};

            errors.set(item, {
                ...co,
                invalidPrice: true,
            });
        });

        invalidPriceAfterTax.forEach((item) => {
            const co = errors.get(item) || {};

            errors.set(item, {
                ...co,
                invalidPriceAfterTax: true,
            });
        });

        return errors;
    }

    private _createConditionsBulk(condition?: ConditionBulkDto, id?: number): FormGroup {
        let produkPrice = this.form
            .get('retailBuyingPrice')
            .value.replace(new RegExp('Rp', 'g'), '')
            .split('.')
            .join('');

        let priceDefaultFirst = parseInt(produkPrice) - 1;
        let minQtyProductCount = this.catalogueMinQty;

        let minQtyBulkCompare = 0;
        if (!id) {
            if (minQtyProductCount > 1) {
                minQtyBulkCompare = minQtyProductCount + 2;
            } else {
                minQtyBulkCompare = +2;
            }
        }

        const price =
            id && condition.price > 0
                ? condition.price - 1
                : id && !condition.price
                ? parseInt(produkPrice) - (id - 1)
                : priceDefaultFirst;

        const pricingType = this.form.get('pricingType').value;

        // event.value
        return this.fb.group({
            level: id ? id : 1,
            minQty: id ? condition.minQty + 2 : minQtyBulkCompare,
            price: { value: price, disabled: pricingType === INCLUDE_PPN },
            priceAfterTax: {
                value: this.calculateAfterTaxPipe.transform(
                    price.toString(),
                    this.form.get('tax').value
                ),
                disabled: pricingType === EXCLUDE_PPN,
            },
        });
    }

    onAdjustPrice(item: CataloguePrice, idx: number): void {
        if (!item || !item.id) {
            return;
        }

        this.selectedSegmentId = item.id || null;
        this.tmpProductName = this.selectedCatalogue$.value.name;
        this.tmpSegmentationName = item.name;
        this.tmpWarehouses =
            item.warehouses && item.warehouses.length
                ? item.warehouses.map((i) => ({ id: i.id, label: i.name }))
                : [];
        this.tmpTypes =
            item.types && item.types.length
                ? item.types.map((i) => ({ id: i.id, label: i.name }))
                : [];
        this.tmpGroups =
            item.groups && item.groups.length
                ? item.groups.map((i) => ({ id: i.id, label: i.name }))
                : [];
        this.tmpChannels =
            item.channels && item.channels.length
                ? item.channels.map((i) => ({ id: i.id, label: i.name }))
                : [];
        this.tmpClusters =
            item.clusters && item.clusters.length
                ? item.clusters.map((i) => ({ id: i.id, label: i.name }))
                : [];

        this.adjustPriceForm.get('price').setValue(item.price);
        // this.adjustPriceCtrl.setValue(item.price);

        const dialogRef = this.applyDialogFactoryService.open(
            {
                title: 'Adjust Price',
                template: this.dialogAdjustPrice,
                isApplyEnabled: true,
                showApplyButton: true,
                showCloseButton: true,
                applyButtonLabel: 'Save',
                closeButtonLabel: 'Cancel',
            },
            {
                autoFocus: false,
                restoreFocus: false,
                disableClose: true,
                width: '35vw',
                minWidth: '30vw',
                maxWidth: '50vw',
                panelClass: 'dialog-container-no-padding',
            }
        );

        dialogRef.closed$.subscribe((res) => {
            if (res === 'apply') {
                const { channels, clusters, groups, types, warehouses, price } =
                    this.adjustPriceForm.value;

                const channelIds =
                    channels && channels.length ? channels.map((item) => item.id) : [];
                const clusterIds =
                    clusters && clusters.length ? clusters.map((item) => item.id) : [];
                const groupIds = groups && groups.length ? groups.map((item) => item.id) : [];
                const typeIds = types && types.length ? types.map((item) => item.id) : [];
                const warehouseIds =
                    warehouses && warehouses.length ? warehouses.map((item) => item.id) : [];

                const payload: AdjustCataloguePriceDto = {
                    catalogueId: this.selectedCatalogue$.value.id,
                    channelIds,
                    clusterIds,
                    groupIds,
                    price,
                    segmentationId: item.segmentationId,
                    segmentedCatalogueId: item.id,
                    typeIds,
                    warehouseIds,
                };

                this.store.dispatch(
                    CatalogueDetailPageActions.adjustPriceSettingRequest({ payload })
                );
            }

            this.selectedSegmentId = null;
            this.cdRef.markForCheck();
        });
    }

    onChangeCustomQty(ev: MatCheckboxChange, item: CataloguePrice, idx: number): void {
        /* HelperService.debug('[CataloguePriceSettingsComponent] onChangeCustomQty', {
            ev,
            idx,
            selectedCatalogue: this.selectedCatalogue$.value,
        }); */

        const maxOrderQtyControl = this.form.get(['priceSettings', idx, 'maxOrderQtyValue']);

        maxOrderQtyControl.reset();

        if (ev.checked) {
            const { minQty } = this.selectedCatalogue$.value;

            maxOrderQtyControl.setValidators([
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.minNumber({
                    value: minQty,
                    message: this.errorMessage$.getErrorMessageNonState('default', 'gte_number', {
                        limitValue: minQty,
                    }),
                }),
                RxwebValidators.digit({
                    message: this.errorMessage$.getErrorMessageNonState('default', 'numeric'),
                }),
            ]);
            maxOrderQtyControl.updateValueAndValidity({ onlySelf: true });
            maxOrderQtyControl.enable({ onlySelf: true });

            /* HelperService.debug(
                '[CataloguePriceSettingsComponent] onChangeCustomQty checked TRUE',
                {
                    minQty,
                    maxQtyValue: maxOrderQtyControl,
                }
            ); */
        } else {
            maxOrderQtyControl.clearValidators();
            maxOrderQtyControl.updateValueAndValidity({ onlySelf: true });
            maxOrderQtyControl.disable({ onlySelf: true });

            const payload: MaxOrderQtySegmentationDto = {
                id: item.id,
                isMaximum: ev.checked,
                maxQty: null,
            };

            this.catalogueFacade.updateMaxOrderQtySegmentation(payload, idx);

            /* HelperService.debug('[CataloguePriceSettingsComponent] onChangeCustomQty checked FALSE', {
                maxQtyValue: maxOrderQtyControl,
            }); */
        }
    }

    onChangeMaxOrderQty(item: CataloguePrice, idx: number): void {
        const { minQty, multipleQtyType } = this.selectedCatalogue$.value;
        const maxOrderQtyControl = this.form.get(['priceSettings', idx, 'maxOrderQtyValue']);
        const hasErrorMinQty = maxOrderQtyControl.hasError('minNumber');

        const isMaximum = this.form.get(['priceSettings', idx, 'isMaximum']).value;

        /* HelperService.debug('[CataloguePriceSettingsComponent] onChangeMaxOrderQty', {
            item,
            idx,
            form: maxOrderQtyControl,
            hasError: hasErrorMinQty,
        }); */

        if (hasErrorMinQty) {
            this.notice$.open(`Minimum order quantity is ${minQty} ${multipleQtyType}`, 'error', {
                verticalPosition: 'bottom',
                horizontalPosition: 'right',
            });
        } else if (isMaximum) {
            const payload: MaxOrderQtySegmentationDto = {
                id: item.id,
                isMaximum,
                maxQty: maxOrderQtyControl.value,
            };

            this.catalogueFacade.updateMaxOrderQtySegmentation(payload, idx);
        }
    }

    onDelete(item: CataloguePrice, idx: number): void {
        if (!item || !item.id) {
            return;
        }

        this.selectedSegmentId = item.id || null;

        const dialogRef = this.applyDialogFactoryService.open(
            {
                title: 'Delete',
                template: this.alertDelete,
                isApplyEnabled: true,
                showApplyButton: true,
                showCloseButton: true,
                applyButtonLabel: 'Delete',
                closeButtonLabel: 'Cancel',
            },
            {
                autoFocus: false,
                restoreFocus: false,
                disableClose: true,
                width: '35vw',
                minWidth: '30vw',
                maxWidth: '50vw',
                panelClass: 'dialog-container-no-padding',
            }
        );

        dialogRef.closed$.subscribe((res) => {
            if (res === 'apply') {
                this.isDelete = true;
                this.catalogueFacade.deleteCataloguePrice(item.id, idx);
            }

            this.selectedSegmentId = null;
            this.cdRef.markForCheck();
        });
    }

    onSelectedWarehouses($event: any[]): void {
        HelperService.debug('onSelectedWarehouses', $event);

        if ($event && Array.isArray($event)) {
            this.filterForm.get('warehouses').setValue($event.map((e) => e.warehouseId));
        }
    }

    onSelectedStoreSegmentationTypes($event: Array<Selection>): void {
        HelperService.debug('onSelectedStoreSegmentationTypes', $event);
        this.filterForm.get('storeType').setValue($event.map((e) => e.id));
    }

    onSelectedStoreSegmentationGroup($event: Array<Selection>): void {
        HelperService.debug('onSelectedStoreSegmentationGroup', $event);
        this.filterForm.get('storeGroup').setValue($event.map((e) => e.id));
    }

    onSelectedStoreSegmentationChannel($event: Array<Selection>): void {
        HelperService.debug('onSelectedStoreSegmentationChannel', $event);
        this.filterForm.get('storeChannel').setValue($event.map((e) => e.id));
    }

    onSelectedStoreSegmentationCluster($event: Array<Selection>): void {
        HelperService.debug('onSelectedStoreSegmentationCluster', $event);
        this.filterForm.get('storeCluster').setValue($event.map((e) => e.id));
    }

    onApplyPriceToAll(): void {
        const priceValue = this.form.get('priceToAll').value;

        if (!priceValue || priceValue === '0.00') {
            this.notice$.open('Input the price value.', 'error', {
                horizontalPosition: 'right',
                verticalPosition: 'bottom',
                duration: 5000,
            });
        } else {
            const dialogRef = this.dialog.open<DeleteConfirmationComponent, any, string>(
                DeleteConfirmationComponent,
                {
                    data: {
                        id: 'apply-price-to-all',
                        title: 'Clear',
                        message: `It will apply to the price settings which based on your filter.
                        Are you sure want to proceed?`,
                    },
                    disableClose: true,
                }
            );

            dialogRef
                .afterClosed()
                .pipe(tap((value) => HelperService.debug('APPLY WARNING DIALOG CLOSED', value)))
                .subscribe((value) => {
                    if (value === 'apply-price-to-all') {
                        const data = {};
                        const filterFormValue = this.filterForm.getRawValue();

                        if (Array.isArray(filterFormValue.warehouses)) {
                            data['warehouseCatalogueId'] =
                                filterFormValue.warehouses.length === 0
                                    ? 'all'
                                    : filterFormValue.warehouses;
                        } else {
                            data['warehouseCatalogueId'] = 'all';
                        }

                        if (Array.isArray(filterFormValue.storeType)) {
                            data['typeIds'] =
                                filterFormValue.storeType.length === 0
                                    ? 'all'
                                    : filterFormValue.storeType;
                        } else {
                            data['typeIds'] = 'all';
                        }

                        if (Array.isArray(filterFormValue.storeGroup)) {
                            data['groupIds'] =
                                filterFormValue.storeGroup.length === 0
                                    ? 'all'
                                    : filterFormValue.storeGroup;
                        } else {
                            data['groupIds'] = 'all';
                        }

                        if (Array.isArray(filterFormValue.storeChannel)) {
                            data['channelIds'] =
                                filterFormValue.storeChannel.length === 0
                                    ? 'all'
                                    : filterFormValue.storeChannel;
                        } else {
                            data['channelIds'] = 'all';
                        }

                        if (Array.isArray(filterFormValue.storeCluster)) {
                            data['clusterIds'] =
                                filterFormValue.storeCluster.length === 0
                                    ? 'all'
                                    : filterFormValue.storeCluster;
                        } else {
                            data['clusterIds'] = 'all';
                        }

                        this.store.dispatch(
                            CatalogueActions.applyFilteredCataloguePriceRequest({
                                payload: {
                                    catalogueId: this.form.get('id').value,
                                    supplierId: this.form.get('supplierId').value,
                                    price: this.form.get('priceToAll').value,
                                    warehouseCatalogueId: data['warehouseCatalogueId'],
                                    typeId: data['typeIds'],
                                    groupId: data['groupIds'],
                                    channelId: data['channelIds'],
                                    clusterId: data['clusterIds'],
                                },
                            })
                        );
                    }
                });
        }
    }

    onApplyFilter(): void {
        HelperService.debug('onApplyFilter', {});
        this.isApplyFilter = true;
        this.updateForm$.next(null);

        const filterFormValue = this.filterForm.getRawValue();

        const data: IQueryParams = {
            limit: this.paginator ? this.paginator.pageSize : 10,
            skip: this.paginator ? this.paginator.pageSize * this.paginator.pageIndex : 0,
        };

        data['paginate'] = true;
        data['catalogueId'] = this.selectedCatalogue$.value.id;

        if (Array.isArray(filterFormValue.warehouses)) {
            data['warehouseIds'] = filterFormValue.warehouses;
        } else {
            data['warehouseIds'] = [];
        }

        if (Array.isArray(filterFormValue.storeType)) {
            data['typeIds'] = filterFormValue.storeType;
        } else {
            data['typeIds'] = [];
        }

        if (Array.isArray(filterFormValue.storeGroup)) {
            data['groupIds'] = filterFormValue.storeGroup;
        } else {
            data['groupIds'] = [];
        }

        if (Array.isArray(filterFormValue.storeChannel)) {
            data['channelIds'] = filterFormValue.storeChannel;
        } else {
            data['channelIds'] = [];
        }

        if (Array.isArray(filterFormValue.storeCluster)) {
            data['clusterIds'] = filterFormValue.storeCluster;
        } else {
            data['clusterIds'] = [];
        }

        this.store.dispatch(
            CatalogueActions.fetchCataloguePriceSettingsRequest({
                payload: data,
            })
        );
    }

    onChangePage(ev: PageEvent): void {
        HelperService.debug('onChangePage', ev);
        this.updateForm$.next(null);
        this.changePage.emit();

        // this._initTable(this.selectedCatalogue$.value.id);
    }

    onTaxChange(ev: MatRadioChange): void {
        HelperService.debug('[CataloguePriceSettingsComponent] onTaxChange', { ev });

        // Get Tax Id
        /* const taxId =
            this.taxes && !!this.taxes.length
                ? +this.taxes.find((tax) => tax.amount === ev.value).id
                : null;

        if (taxId) {
            this.formValueChange.emit({ catalogueTaxId: taxId } as Catalogue);
        } */
    }

    onTrackPriceSetting(index: number, item: CataloguePrice): string {
        if (!item) {
            return null;
        }

        return item.id;
    }

    updateSegmentationPrice(control: FormControl, index: number): void {
        const { value } = control;
        const selected = this.selectedSegmentationPrice$.value;

        if (selected && selected.price && (value !== '0.00' || value)) {
            control.disable();

            const priceSettingId = control.parent.get('id').value;
            const price = Number(String(value).replace(/\./g, '').replace(/,/g, '.'));

            this.segmentationPriceChanges$.next({
                priceSettingId,
                price,
                priceIndex: index,
            });
        }
    }

    private _initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>)
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug(
                        '[CataloguePriceSettingsComponent - _initFormCheck] statusChanges',
                        { value }
                    )
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((status) => {
                if (this.bulkPriceSettingStatus === 'bulk_pricing') {
                    if (this.statusFormBulk === true) {
                        status = 'INVALID';
                    }
                }
                if (status === 'PENDING') status = 'VALID';
                this.formStatusChange.emit(status);
            });

        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug('[CataloguePriceSettingsComponent] Before MAP', value)
                ),
                map((value) => {
                    /** hitung price berdasarkan price after tax jika pricing type include ppn */
                    value.bulkPrices = value.bulkPrices.map((item) => {
                        const priceAfterTax = parseFloat(
                            String(item.priceAfterTax).replace(/\.00/g, '')
                        );
                        const priceValue = item.price
                            ? item.price
                            : item.priceAfterTax
                            ? this.calculateBeforeTaxPipe.transform(
                                  priceAfterTax.toString(),
                                  value.tax
                              )
                            : 0;

                        const price = parseFloat(String(priceValue).replace(/\.00/g, ''));

                        return {
                            ...item,
                            price,
                        };
                    });
                    return value;
                }),
                map((value) => {
                    this.comparedata(value.bulkPrices);
                    // Get Tax Id
                    const taxId =
                        this.taxes && !!this.taxes.length
                            ? +this.taxes.find((tax) => tax.amount === value.tax).id
                            : null;

                    const formValue = {
                        retailBuyingPrice: undefined,
                        discountedRetailBuyingPrice: undefined,
                        catalogueTaxId: undefined,
                        bulkPrices: undefined,
                        pricingInputWithTaxFlag: false,
                    };

                    if (taxId) {
                        formValue.catalogueTaxId = taxId;
                    }

                    formValue.retailBuyingPrice = value.retailBuyingPrice
                        ? value.retailBuyingPrice
                        : this.form.get('retailBuyingPrice').value;
                    formValue.discountedRetailBuyingPrice = value.discountRetailBuyerPrice;
                    formValue.bulkPrices = value.bulkPrices;
                    formValue.pricingInputWithTaxFlag =
                        value.pricingType === EXCLUDE_PPN ? false : true;

                    return formValue;
                }),
                tap((value) =>
                    HelperService.debug('[CataloguePriceSettingsComponent] After MAP', value)
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                HelperService.debug('[CataloguePriceSettingsComponent] Subscribe', value);
                this.formValueChange.emit(value as Catalogue);
            });

        /* this.form
            .get('retailBuyingPrice')
            .valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug(
                        '[CataloguePriceSettingsComponent - _initFormCheck] retailBuyingPrice valueChanges',
                        { value }
                    )
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit({ retailBuyingPrice: value } as Catalogue);
            });

        this.form
            .get('discountRetailBuyerPrice')
            .valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug(
                        '[CataloguePriceSettingsComponent - _initFormCheck] discountRetailBuyerPrice valueChanges',
                        { value }
                    )
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit({ discountedRetailBuyingPrice: value } as Catalogue);
            }); */

        /* this.form
            .get('retailBuyingPrice')
            .statusChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((status) =>
                    HelperService.debug(
                        'CATALOGUE PRICE SETTINGS -> RETAIL BUYING PRICE FORM STATUS CHANGED',
                        status
                    )
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((status) => {
                this.formStatusChange.emit(status);
            }); */

        this.updateForm$
            .pipe(
                tap((formMode) =>
                    HelperService.debug('CATALOGUE PRICE SETTINGS FORM MODE CHANGED:', formMode)
                ),
                withLatestFrom(
                    this.catalogueFacade.catalogue$,
                    this.catalogueFacade.cataloguePrices$,
                    (formMode, catalogue, cataloguePrices) => ({
                        formMode,
                        catalogue,
                        cataloguePrices,
                    })
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe(({ formMode, catalogue, cataloguePrices }) => {
                this.subs.unsubscribe();
                this.subs = new Subscription();

                if (formMode === 'edit') {
                    (this.form.get('priceSettings') as FormArray).clear();

                    for (const [idx, cataloguePrice] of cataloguePrices.entries()) {
                        const control = this.fb.group({
                            id: [cataloguePrice.id],
                            price: [
                                cataloguePrice.price,
                                {
                                    validators: [
                                        RxwebValidators.required({
                                            message: this.errorMessage$.getErrorMessageNonState(
                                                'default',
                                                'required'
                                            ),
                                        }),
                                    ],
                                },
                            ],
                            isMaximum: cataloguePrice.isMaximum || false,
                            maxOrderQtyValue: [
                                {
                                    value: cataloguePrice.maxQty,
                                    disabled: !cataloguePrice.isMaximum,
                                },
                                { updateOn: 'blur' },
                            ],
                        });

                        (this.form.get('priceSettings') as FormArray).push(control);

                        const sub = control
                            .get('price')
                            .valueChanges.pipe(
                                distinctUntilChanged(),
                                debounceTime(100),
                                tap((value) =>
                                    HelperService.debug(
                                        'CATALOGUE PRICE SETTINGS FORM VALUE CHANGED',
                                        value
                                    )
                                )
                            )
                            .subscribe((value) => {
                                if (value !== '0.00' || value) {
                                    const priceSettingId = control.get('id').value;
                                    const price = Number(
                                        String(value).replace(/\./g, '').replace(/,/g, '.')
                                    );

                                    this.selectedSegmentationPrice$.next({
                                        price,
                                        priceIndex: idx,
                                        priceSettingId,
                                    });
                                }
                            });

                        this.subs.add(sub);
                    }

                    if (cataloguePrices.length > 0) {
                        this.subs.add(
                            this.segmentationPriceChanges$
                                .asObservable()
                                .pipe(
                                    debounceTime(100),
                                    withLatestFrom(
                                        this.selectedSegmentationPrice$.asObservable(),
                                        this.store.select(FormSelectors.getIsClickCancelButton),
                                        (payload, selectedPrice, isClicked) => ({
                                            payload,
                                            selectedPrice,
                                            isClicked,
                                        })
                                    ),
                                    tap((v) =>
                                        HelperService.debug(
                                            '[CATALOGUE EDIT FORM / SEGMENTED PRICE] onBlur triggered to update',
                                            v
                                        )
                                    )
                                )
                                .subscribe(({ isClicked, payload }) => {
                                    if (!isClicked && payload) {
                                        this.selectedSegmentationPrice$.next(null);
                                        this.segmentationPriceChanges$.next(null);

                                        this.catalogueFacade.updateCataloguePrice(
                                            payload.priceSettingId,
                                            payload.price,
                                            payload.priceIndex
                                        );
                                    }
                                })
                        );
                    }

                    const pricingType = catalogue.pricingInputWithTaxFlag
                        ? INCLUDE_PPN
                        : EXCLUDE_PPN;

                    this.form.patchValue({
                        id: catalogue.id,
                        supplierId: (catalogue.brand as any).supplierId,
                        retailBuyingPrice: catalogue.retailBuyingPrice
                            ? String(catalogue.retailBuyingPrice).replace('.', ',')
                            : null,
                        retailBuyingPriceView: catalogue.retailBuyingPrice,
                        tax: catalogue.catalogueTax.amount,
                        taxView: catalogue.catalogueTax.amount,
                        discountRetailBuyerPrice: catalogue.discountedRetailBuyingPrice
                            ? String(catalogue.discountedRetailBuyingPrice).replace('.', ',')
                            : null,
                        discountRetailBuyerPriceView: catalogue.discountedRetailBuyingPrice,
                        bulkPrices: catalogue.bulkPrices,
                        retailBuyingPriceAfterTax: this.calculateAfterTaxPipe.transform(
                            catalogue.retailBuyingPrice.toString(),
                            catalogue.catalogueTax.amount
                        ),
                        pricingType,
                    });

                    (this.form.get('bulkPrices') as FormArray).clear();

                    for (const [_, bulkPrice] of catalogue.bulkPrices.entries()) {
                        const control = this.fb.group({
                            id: bulkPrice.id,
                            level: bulkPrice.level,
                            minQty: bulkPrice.minQty,
                            maxQty: bulkPrice.maxQty,
                            price: bulkPrice.price,
                            priceAfterTax: this.calculateAfterTaxPipe.transform(
                                bulkPrice.price.toString(),
                                catalogue.catalogueTax.amount
                            ),
                        });

                        (this.form.get('bulkPrices') as FormArray).push(control);
                    }
                    if (this.bulkPriceSetting.value.length) {
                        this.statusAddBulkFirst = true;
                    }

                    this.onChangePricingType({ value: pricingType });

                    /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                    this.form.markAsDirty({ onlySelf: false });
                    this.form.markAllAsTouched();
                    this.form.markAsPristine();
                    this.form.updateValueAndValidity();

                    this.cdRef.detectChanges();
                    this.cdRef.markForCheck();
                }

                this._updateFormView();
            });
    }

    private _checkRoute(): void {
        /* this.route.url.pipe(take(1)).subscribe((urls) => {

        }); */

        const { id } = this.route.snapshot.params;
        const urls = this.route.snapshot.url;

        if (id) {
            if (urls.filter((url) => url.path === 'edit').length) {
                this.displayedColumns = [
                    'segmentation-name',
                    'warehouse-name',
                    'store-type',
                    'store-group',
                    'store-channel',
                    'store-cluster',
                    'price',
                    'price-after-tax',
                    'custom-qty',
                    'max-order-qty',
                    'actions',
                ];
                this.formMode = 'edit';
                this._prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'view')) {
                this.displayedColumns = [
                    'segmentation-name',
                    'warehouse-name',
                    'store-type',
                    'store-group',
                    'store-channel',
                    'store-cluster',
                    'price',
                    'price-after-tax',
                    'custom-qty',
                    'max-order-qty',
                ];
                this.formMode = 'view';
                this._prepareEditCatalogue();
            }
        } else if (urls.filter((url) => url.path === 'add').length) {
            this.formMode = 'add';
        }

        this._updateFormView();
    }

    private _prepareEditCatalogue(): void {
        combineLatest([this.catalogueFacade.catalogue$, this.authFacade.getUserSupplier$])
            .pipe(
                withLatestFrom(
                    this.catalogueFacade.cataloguePrices$,
                    ([catalogue, userSupplier], cataloguePrices) => ({
                        catalogue,
                        userSupplier,
                        cataloguePrices,
                    })
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe(({ catalogue, userSupplier, cataloguePrices }) => {
                /** Mengambil ID dari URL (untuk jaga-jaga ketika ID katalog yang terpilih tidak ada di state) */
                const { id } = this.route.snapshot.params;

                /** Butuh mengambil data katalog jika belum ada di state. */
                if (!catalogue) {
                    this.catalogueFacade.getCatalogueById(id);
                    return;
                }

                if (!cataloguePrices.length) {
                    // this._initTable(catalogue.id);
                }

                /** Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut. */
                if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                    this.catalogueFacade.delete(id);

                    this.notice$
                        .open('Produk tidak ditemukan.', 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        })
                        .afterOpened()
                        .pipe(delay(1000))
                        .subscribe(() =>
                            this.router.navigate(['pages', 'catalogues', 'list'], {
                                replaceUrl: true,
                            })
                        );

                    return;
                }

                this.catalogueMinQty = catalogue.minQty;
                this.dataSourcePriceSettings = catalogue.bulkPrices;
                this.totalItemPriceSettings = this.dataSourcePriceSettings.length;
                if (this.isViewMode()) {
                    this.form.get('advancePrice').disable();
                } else {
                    this.form.get('advancePrice').enable();
                }

                this.selectedCatalogue$.next(catalogue);

                this.form.patchValue({
                    id: catalogue.id,
                    supplierId: (catalogue.brand as any).supplierId,
                    retailBuyingPrice: catalogue.retailBuyingPrice
                        ? String(catalogue.retailBuyingPrice).replace('.', ',')
                        : null,
                    retailBuyingPriceView: catalogue.retailBuyingPrice,
                    tax: catalogue.catalogueTax.amount,
                    taxView: catalogue.catalogueTax.amount,
                    discountRetailBuyerPrice: catalogue.discountedRetailBuyingPrice
                        ? String(catalogue.discountedRetailBuyingPrice).replace('.', ',')
                        : null,
                    discountRetailBuyerPriceView: catalogue.discountedRetailBuyingPrice,
                    retailBuyingPriceAfterTax: this.calculateAfterTaxPipe.transform(
                        catalogue.retailBuyingPrice.toString(),
                        catalogue.catalogueTax.amount
                    ),
                    pricingType: catalogue.pricingInputWithTaxFlag ? INCLUDE_PPN : EXCLUDE_PPN,
                });

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();

                this.cdRef.detectChanges();
                this.cdRef.markForCheck();
            });
    }

    private _updateFormView(): void {
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'custom-field': !this.isViewMode(),
            'view-field-right': this.isViewMode(),
        };

        this.catalogueContent = {
            'mt-16': true,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode(),
        };

        if (this.isViewMode()) {
            this.displayedColumns = [
                'segmentation-name',
                'warehouse-name',
                'store-type',
                'store-group',
                'store-channel',
                'store-cluster',
                'price',
                'price-after-tax',
                'custom-qty',
                'max-order-qty',
            ];

            this.form.get('advancePrice').disable();
        } else {
            if (this.isEditMode()) {
                this.displayedColumns = [
                    'segmentation-name',
                    'warehouse-name',
                    'store-type',
                    'store-group',
                    'store-channel',
                    'store-cluster',
                    'price',
                    'price-after-tax',
                    'custom-qty',
                    'max-order-qty',
                    'actions',
                ];
            }

            this.form.get('advancePrice').enable();
        }

        this.cdRef.detectChanges();
    }

    private _initTable(catalogueId: string): void {
        const data: IQueryParams = {
            limit: this.paginator ? this.paginator.pageSize || this.defaultPageSize : 10,
            skip: this.paginator ? this.paginator.pageSize * this.paginator.pageIndex || 0 : 0,
            paginate: true,
        };

        data['catalogueId'] = catalogueId;

        this.dataSource.getWithQuery(data);
    }

    comparedata(data) {
        const onCheckPrice = (
            { curItem, prevItem },
            elementId: string,
            propertyName: string,
            callback: Function,
            comparePriceValue: number
        ) => {
            if (parseFloat(curItem[propertyName]) >= parseFloat(prevItem[propertyName])) {
                callback();
                this._onChangeInputStyle(elementId, 'error');
            } else if (parseFloat(curItem[propertyName]) < 1) {
                callback();
                this._onChangeInputStyle(elementId, 'error');
            } else if (parseFloat(prevItem[propertyName]) < 1) {
                callback();
                this._onChangeInputStyle(elementId, 'error');
            } else if (parseFloat(curItem[propertyName]) >= comparePriceValue) {
                callback();
                this._onChangeInputStyle(elementId, 'error');
            } else if (parseFloat(prevItem[propertyName]) >= comparePriceValue) {
                callback();
                this._onChangeInputStyle(elementId, 'error');
            }
        };
        let retailBuyingPrice = 0;
        let retailBuyingPriceAfterTax = 0;
        if (this.form.get('retailBuyingPrice').value) {
            retailBuyingPrice = this._getPriceNumber('retailBuyingPrice');
            retailBuyingPriceAfterTax = this._getPriceNumber('retailBuyingPriceAfterTax');
        }
        const invalidPrice = [];
        const invalidMinQty = [];
        if (data) {
            if (data.length > 1) {
                data.forEach(
                    (
                        curItem: {
                            level: any;
                            minQty: string;
                            price: string;
                            priceAfterTax: string;
                        },
                        index: number,
                        arr: Array<{
                            level: any;
                            minQty: string;
                            price: string;
                            priceAfterTax: string;
                        }>
                    ) => {
                        if (!index) {
                            return;
                        }

                        const prevItem = arr[index - 1];
                        if (
                            Number(curItem.minQty) <= Number(prevItem.minQty) ||
                            Number(curItem.minQty) <= this.catalogueMinQty ||
                            Number(prevItem.minQty) <= this.catalogueMinQty
                        ) {
                            invalidMinQty.push(index);
                        }

                        if (curItem.price && prevItem.price) {
                            onCheckPrice(
                                { curItem, prevItem },
                                `bulkPrice.price.${index}`,
                                'price',
                                () => invalidPrice.push(index),
                                retailBuyingPrice
                            );
                        }
                        if (curItem.priceAfterTax && prevItem.priceAfterTax) {
                            onCheckPrice(
                                { curItem, prevItem },
                                `bulkPrice.priceAfterTax.${index}`,
                                'priceAfterTax',
                                () => invalidPrice.push(index),
                                retailBuyingPriceAfterTax
                            );
                        }
                    }
                );

                if (parseInt(data[0].minQty) <= this.catalogueMinQty) {
                    invalidMinQty.push(0);
                }
                if (data[0].price) {
                    if (parseFloat(data[0].price) >= retailBuyingPrice) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.price.0`, 'error');
                    } else if (parseFloat(data[0].price) === 0) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.price.0`, 'error');
                    }
                }
                if (data[0].priceAfterTax) {
                    if (parseFloat(data[0].priceAfterTax) >= retailBuyingPriceAfterTax) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.0`, 'error');
                    } else if (parseFloat(data[0].priceAfterTax) === 0) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.0`, 'error');
                    }
                }
            } else if (data.length === 1) {
                if (parseInt(data[0].minQty) <= this.catalogueMinQty) {
                    invalidMinQty.push(0);
                }
                if (data[0].price) {
                    if (parseFloat(data[0].price) >= retailBuyingPrice) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.price.0`, 'error');
                    } else if (parseFloat(data[0].price) === 0) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.price.0`, 'error');
                    }
                }
                if (data[0].priceAfterTax) {
                    if (parseFloat(data[0].priceAfterTax) >= retailBuyingPriceAfterTax) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.0`, 'error');
                    } else if (parseFloat(data[0].priceAfterTax) === 0) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.0`, 'error');
                    }
                }
            }
        }

        if (invalidMinQty.length > 0 || invalidPrice.length > 0) {
            this.statusFormBulk = true;
        } else {
            this.statusFormBulk = false;
        }
    }

    onChangeMinQtyBulk(val: string, idx) {
        const minQtyBulk = val ? parseInt(val.split('.').join('')) : 0;
        const minQtyAmount = this.catalogueMinQty;

        if (idx === 0) {
            if (minQtyBulk <= minQtyAmount) {
                this._onChangeInputStyle(`bulkPrice.minQty.${0}`, 'error');
                this._checkConditionsBulkPrices(this.form.get('bulkPrices'));
                this.statusFormBulk = true;
                this.comparedata(this.form.get('bulkPrices').value);
            } else {
                this.comparedata(this.form.get('bulkPrices').value);
                this._onChangeInputStyle(`bulkPrice.minQty.${0}`, 'success');
                this._checkConditionsBulkPrices(this.form.get('bulkPrices'));
            }
        } else {
            if (this.form.get('bulkPrices').value.length > 1) {
                this.comparedata(this.form.get('bulkPrices').value);
            }
        }
    }

    onChangeretailBuyingPrice(val: string) {
        const retailBP = val
            ? parseFloat(
                  val
                      .replace(new RegExp('Rp', 'g'), '')
                      .split('.')
                      .join('')
                      .replace(new RegExp(',', 'g'), '.')
              )
            : 0;

        const tax = this.form.get('tax').value;
        if (this.bulkPriceSettingStatus === 'bulk_pricing') {
            if (this.form.get('bulkPrices').value.length > 0) {
                let dataPriceBulk = this.form.get('bulkPrices').value[0].price;

                if (dataPriceBulk > retailBP || dataPriceBulk < 1) {
                    this.bulkPriceSettingCtrl.forEach((_, idx) => {
                        this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'error');
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'error');
                        this.formStatusChange.emit('INVALID');
                    });
                    this.comparedata(this.form.get('bulkPrices').value);
                } else {
                    this.bulkPriceSettingCtrl.forEach((_, idx) => {
                        this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'success');
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'success');
                        this.formStatusChange.emit('VALID');
                    });
                }
            }
        }

        this.form
            .get('retailBuyingPriceAfterTax')
            .setValue(this.calculateAfterTaxPipe.transform(retailBP.toString(), tax));
    }

    onChangeBulkPrice(val: string, idx, type = 'beforeTax') {
        const bulkPrice = val
            ? parseFloat(
                  val
                      .replace(new RegExp('Rp', 'g'), '')
                      .split('.')
                      .join('')
                      .replace(new RegExp(',', 'g'), '.')
              )
            : 0;

        const retailBuyingPrice = this._getPriceNumber(
            type === 'beforeTax' ? 'retailBuyingPrice' : 'retailBuyingPriceAfterTax'
        );
        const tax = this.form.get('tax').value;

        if (idx === 0) {
            if (bulkPrice >= retailBuyingPrice) {
                this.statusFormBulk = true;
                this._onChangeInputStyle(`bulkPrice.price.${0}`, 'error');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'error');
                this._checkConditionsBulkPrices(this.form.get('bulkPrices'));
                this.comparedata(this.form.get('bulkPrices').value);
            } else if (isNaN(bulkPrice) || bulkPrice === 0) {
                this._onChangeInputStyle(`bulkPrice.price.${0}`, 'error');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'error');
                this.comparedata(this.form.get('bulkPrices').value);
            } else {
                this.comparedata(this.form.get('bulkPrices').value);
                this._onChangeInputStyle(`bulkPrice.price.${0}`, 'success');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'success');
                this._checkConditionsBulkPrices(this.form.get('bulkPrices'));
            }
        } else {
            if (this.form.get('bulkPrices').value.length > 1) {
                this.comparedata(this.form.get('bulkPrices').value);
                this._checkConditionsBulkPrices(this.form.get('bulkPrices'));
            }
        }

        if (type === 'beforeTax') {
            this.bulkPriceSettingCtrl[idx].patchValue({
                priceAfterTax: this.calculateAfterTaxPipe.transform(bulkPrice.toString(), tax),
            });
        } else {
            this.bulkPriceSettingCtrl[idx].patchValue({
                price: this.calculateBeforeTaxPipe.transform(bulkPrice.toString(), tax),
            });
        }
    }

    onChangePricingType(event): void {
        if (event.value === EXCLUDE_PPN) {
            this.form.get('retailBuyingPrice').enable();
            this.form.get('retailBuyingPriceAfterTax').disable();

            this.bulkPriceSettingCtrl.forEach((element) => {
                element.get('price').enable();
                element.get('priceAfterTax').disable();
            });
        } else {
            this.form.get('retailBuyingPriceAfterTax').enable();
            this.form.get('retailBuyingPrice').disable();

            this.bulkPriceSettingCtrl.forEach((element) => {
                element.get('priceAfterTax').enable();
                element.get('price').disable();
            });
        }
    }

    _getPriceNumber(formName: string): number {
        let price = 0;

        if (this.form.get(formName).value) {
            price = isNaN(
                parseInt(
                    String(this.form.get(formName).value)
                        .replace(new RegExp('Rp', 'g'), '')
                        .split('.')
                        .join('')
                )
            )
                ? 0
                : parseInt(
                      String(this.form.get(formName).value)
                          .replace(new RegExp('Rp', 'g'), '')
                          .split('.')
                          .join('')
                  );
        }

        return price;
    }

    onChangeTax(value): void {
        const pricingType = this.form.get('pricingType').value;
        const retailBuyingPrice = this._getPriceNumber('retailBuyingPrice');
        const rbpAfterTax = this._getPriceNumber('retailBuyingPriceAfterTax');
        if (pricingType === EXCLUDE_PPN) {
            this.form
                .get('retailBuyingPriceAfterTax')
                .setValue(
                    this.calculateAfterTaxPipe.transform(retailBuyingPrice.toString(), value)
                );
            this.bulkPriceSettingCtrl.forEach((element) => {
                const price = parseInt(String(element.get('price').value).replace(/\.00/g, ''), 10);
                element
                    .get('priceAfterTax')
                    .setValue(this.calculateAfterTaxPipe.transform(price.toString(), value));
            });
        } else {
            this.form
                .get('retailBuyingPrice')
                .setValue(this.calculateBeforeTaxPipe.transform(rbpAfterTax.toString(), value));

            this.bulkPriceSettingCtrl.forEach((element) => {
                const price = parseInt(
                    String(element.get('priceAfterTax').value).replace(/\.00/g, ''),
                    10
                );
                element
                    .get('price')
                    .setValue(this.calculateBeforeTaxPipe.transform(price.toString(), value));
            });
        }
    }

    onChangeRbpAfterTax(value): void {
        const tax = this.form.get('tax').value;
        const price = value
            ? parseFloat(
                  value
                      .replace(new RegExp('Rp', 'g'), '')
                      .split('.')
                      .join('')
                      .replace(new RegExp(',', 'g'), '.')
              )
            : 0;

        if (this.bulkPriceSettingStatus === 'bulk_pricing') {
            if (this.form.get('bulkPrices').value.length > 0) {
                let dataPriceBulk = this.form.get('bulkPrices').value[0].priceAfterTax;
                if (dataPriceBulk > price || dataPriceBulk < 1) {
                    this.bulkPriceSettingCtrl.forEach((_, idx) => {
                        this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'error');
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'error');
                        this.formStatusChange.emit('INVALID');
                    });
                    this.comparedata(this.form.get('bulkPrices').value);
                } else {
                    this.bulkPriceSettingCtrl.forEach((_, idx) => {
                        this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'success');
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'success');
                        this.formStatusChange.emit('VALID');
                    });
                }
            }
        }

        this.form
            .get('retailBuyingPrice')
            .setValue(this.calculateBeforeTaxPipe.transform(price.toString(), tax));
    }

    _onChangeInputStyle(elementId, type) {
        const attribute =
            type === 'success'
                ? {
                      color: 'black',
                      border: '1px solid lightgray',
                      borderRadius: '4px',
                  }
                : {
                      color: 'red',
                      border: '1px solid red',
                      borderRadius: '4px',
                  };
        if (document.getElementById(elementId)) {
            try {
                document.getElementById(elementId).style.color = attribute.color;
                document.getElementById(elementId).style.border = attribute.border;
                document.getElementById(elementId).style.borderRadius = attribute.borderRadius;
            } catch (err) {
                console.error(err);
            }
        }
    }

    isBulkPriceInputDisabled(conditionIdx, propertyName: string): boolean {
        return (
            this.bulkPriceSettingCtrl[conditionIdx]['controls'][propertyName].status === 'DISABLED'
        );
    }
}

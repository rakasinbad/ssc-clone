import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, OnDestroy, EventEmitter, Output, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { PageEvent, MatPaginator } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { Observable, Subject, BehaviorSubject, of, combineLatest, } from 'rxjs';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { tap, withLatestFrom, takeUntil, take, catchError, switchMap, map, debounceTime, distinctUntilChanged, } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { StoreSegmentationType as Entity } from 'app/shared/components/selection-tree/store-segmentation/models';
import { StoreSegmentationTypesApiService as EntitiesApiService } from 'app/shared/components/selection-tree/store-segmentation/services';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler, FormStatus, } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { SelectionTree, SelectedTree } from 'app/shared/components/selection-tree/selection-tree/models';
import { environment } from 'environments/environment';
import { CatalogueMssSettings } from '../../models';
import { CatalogueActions } from '../../store/actions';

type IFormMode = 'add' | 'view' | 'edit';

interface ISelectedData {
    [id: number]: {
        nonMss: boolean;
        mssOnly: boolean;
        mssCore: boolean;
    }
}

@Component({
  selector: 'app-catalogue-mss-settings',
  templateUrl: './catalogue-mss-settings.component.html',
  styleUrls: ['./catalogue-mss-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class CatalogueMssSettingsComponent implements OnInit, OnChanges, OnDestroy {
    console = console;
    subs$: Subject<void> = new Subject<void>();
    trigger$: BehaviorSubject<string> = new BehaviorSubject('');
    updateForm$: BehaviorSubject<IFormMode> = new BehaviorSubject<IFormMode>(null);

    // state for table needs
    dataSource$: BehaviorSubject<Array<SelectionTree>> = new BehaviorSubject<Array<SelectionTree>>([]);
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    totalItem$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    displayedColumns = [
        `selected-cluster`,
        `non-mss`,
        `mss-only`,
        `mss-core`
    ];
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    formModeValue: IFormMode = 'add';
    
    selectedData: ISelectedData = {};

    form: FormGroup;

    formClass: {
        'custom-field-right': boolean;
        'view-field-right': boolean;
    };

    @Input() initSelection: number;

    @Output() selected: EventEmitter<TNullable<Array<Entity>>> = new EventEmitter<TNullable<Array<Entity>>>();

    @Output() selectionChanged: EventEmitter<SelectedTree> = new EventEmitter<SelectedTree>();

    @Output()
    formModeChange: EventEmitter<IFormMode> = new EventEmitter();

    @Output()
    changePage: EventEmitter<void> = new EventEmitter();

    @Output() formStatusChange: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    formValueChange: EventEmitter<CatalogueMssSettings> = new EventEmitter<CatalogueMssSettings>();

    @Input()
    get formMode(): IFormMode {
        return this.formModeValue;
    }

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    set formMode(mode: IFormMode) {
        this.formModeValue = mode;
        this.formModeChange.emit(this.formModeValue);
    }

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private entityApi$: EntitiesApiService,
        private fb: FormBuilder,
        private errorMessageService: ErrorMessageService,
        private route: ActivatedRoute,
        private notice$: NoticeService,
        private router: Router,
    ) {
        this.dataSource$.pipe(
            tap(x => HelperService.debug('AVAILABLE ENTITIES FROM CATALOGUE MSS SETTINGS', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.form = this.fb.group({
            radioButton: [],
            columnRadioButton: ['']
        });
    }

    ngOnInit(): void {
        this.onRequest();
        if (this.formMode === 'edit' || this.formMode === 'view') {
            this._patchForm();
            this.subscribeForm();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (
                (!changes['formMode'].isFirstChange() &&
                    changes['formMode'].currentValue === 'edit') ||
                changes['formMode'].currentValue === 'view'
            ) {
                if (changes['formMode'].currentValue === 'edit') {
                    this.checkSelectAll();
                }

                this.trigger$.next('');
                this.updateForm$.next(changes['formMode'].currentValue);
            }
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.totalItem$.next(null);
        this.totalItem$.complete();

        this.dataSource$.next(null);
        this.dataSource$.complete();

        this.isLoading$.next(null);
        this.isLoading$.complete();
    }

    onChangePage(ev: PageEvent): void {
        HelperService.debug('onChangePage', ev);
        this.updateForm$.next(null);
        this.changePage.emit();

        this.onRequest();
    }

    private requestEntity(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => HelperService.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<Entity>>>(([_, userSupplier]) => {
                // Jika user tidak ada data supplier.
                if (!userSupplier) {
                    throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                }

                // Mengambil ID supplier-nya.
                const { supplierId } = userSupplier;

                // Membentuk query baru.
                const newQuery: IQueryParams = { ... params };
                // Memasukkan ID supplier ke dalam params baru.
                newQuery['supplierId'] = supplierId;
                // Hanya mengambil yang tidak punya child.
                // newQuery['hasChild'] = false;
                // Request berdasarkan segmentasinya
                newQuery['segmentation'] = 'cluster';

                // Melakukan request data warehouse.
                return this.entityApi$
                    .find<IPaginatedResponse<Entity>>(newQuery)
                    .pipe(
                        tap(response => HelperService.debug('FIND ENTITY', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                if (Array.isArray(response)) {
                    response.map(item => {
                        if (!this.selectedData[item.id]) {
                            this.selectedData[item.id] = {
                                nonMss: true,
                                mssOnly: false,
                                mssCore: false
                            }
                            /** TODO:  check jika semua cluster mss-only | mss-core | non-mss */
                            // if (
                            //     Object.values(this.selectedData).every(item => item[type])
                            // ) {
                            //     this.form.controls["radioButton"].setValue(type);
                            // }
                        }
                        
                    })
                    this.dataSource$.next((response as Array<SelectionTree>));
                    this.totalItem$.next((response as Array<SelectionTree>).length);
                    this.isLoading$.next(false);
                } else {
                    response.data.map(item => {
                        if (!this.selectedData[item.id]) {
                            this.selectedData[item.id] = {
                                nonMss: true,
                                mssOnly: false,
                                mssCore: false
                            }
                        }
                        
                    })
                    this.dataSource$.next(response.data as unknown as Array<SelectionTree>);
                    this.totalItem$.next(response.total); 
                    this.isLoading$.next(false);
                }

            },
            error: (err) => {
                HelperService.debug('ERROR FIND ENTITY', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                HelperService.debug('FIND ENTITY COMPLETED');
            }
        });
    }

    private onRequest(): void {
        const limit = this.paginator.pageSize ? this.paginator.pageSize : this.defaultPageSize
        const skip = limit * this.paginator.pageIndex
        const params: IQueryParams = {
            paginate: true,
            limit,
            skip,
        };
        this.isLoading$.next(true);
        this.requestEntity(params);
    }

    getFormError(form: any): string {
        return this.errorMessage$.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        const { ignoreTouched, ignoreDirty } = args;

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

    onSelected($event: Array<SelectionTree>): void {
        this.selected.emit($event as unknown as Array<Entity>);
    }

    onSelectionChanged($event: SelectedTree): void {
        this.selectionChanged.emit($event);
    }

    mssTypeColumnClick(el, type) {
        if (this.formMode === 'edit') {
            this.selectedData[el.id] = {
                nonMss: type === 'non-mss',
                mssOnly: type === 'mss-only',
                mssCore: type === 'mss-core'
            }
        }
        
        this.checkSelectAll();
    }

    _patchForm(): void {
        combineLatest([this.trigger$])
            .pipe(
                takeUntil(this.subs$)
            )
            .subscribe(() => {
                const radioButton = this.form.get('radioButton');
                const columnRadioButton = this.form.get('columnRadioButton');

                if (this.formMode === 'view') {
                    radioButton.disable({ onlySelf: true });
                    columnRadioButton.disable({ onlySelf: true });
                } else if (this.formMode === 'edit') {
                    radioButton.enable({ onlySelf: true });
                    columnRadioButton.enable({ onlySelf: true });
                }
            });
    }

    subscribeForm() {
        (this.form.statusChanges as Observable<FormStatus>)
        .pipe(
            distinctUntilChanged(),
            debounceTime(250),
            // map(() => this.form.status),
            tap((value) =>
                HelperService.debug(
                    'CATALOGUE MSS SETTINGS SETTING FORM STATUS CHANGED:',
                    value
                )
            ),
            takeUntil(this.subs$)
        )
        .subscribe((status) => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges
        .pipe(
            debounceTime(250),
            // map(() => this.form.getRawValue()),
            tap((value) =>
                HelperService.debug(
                    '[BEFORE MAP] CATALOGUE MSS SETTINGS SETTINGS FORM VALUE CHANGED',
                    value
                )
            ),
            map((value) => {
                if (value.radioButton) {
                    this.dataSource$.value.map(item => {
                        this.selectedData[item.id] = {
                            nonMss: value.radioButton === 'non-mss',
                            mssOnly: value.radioButton === 'mss-only',
                            mssCore: value.radioButton === 'mss-core'
                        }
                    })
                }

                return value;
            }),
            tap((value) =>
                HelperService.debug(
                    '[AFTER MAP] CATALOGUE MSS SETTINGS SETTINGS FORM VALUE CHANGED',
                    value
                )
            ),
            takeUntil(this.subs$)
        )
        .subscribe((value) => {
            this.formValueChange.emit(value);
        });
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.trigger$,
        ])
            .pipe(
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserSupplier),
                    ([catalogue], userSupplier) => ({
                        catalogue,
                        userSupplier,
                    })
                ),
                takeUntil(this.subs$)
            )
            .subscribe(({ catalogue, userSupplier, ...props }) => {
                if (!props) {
                    const { id } = this.route.snapshot.params;

                    this.store.dispatch(
                        CatalogueActions.fetchCatalogueRequest({
                            payload: id,
                        })
                    );

                    this.store.dispatch(
                        CatalogueActions.setSelectedCatalogue({
                            payload: id,
                        })
                    );

                    return;
                } else {
                    /** checking if this data not under supplier id */
                    // if (propertyName.supplierId !== userSupplier.supplierId) {
                    //     this.store.dispatch(
                    //         CatalogueActions.spliceCatalogue({
                    //             payload: catalogue.id,
                    //         })
                    //     );

                    //     this.notice$.open('Produk tidak ditemukan.', 'error', {
                    //         verticalPosition: 'bottom',
                    //         horizontalPosition: 'right',
                    //     });

                    //     setTimeout(
                    //         () => this.router.navigate(['pages', 'catalogues', 'list']),
                    //         1000
                    //     );

                    //     return;
                    // }
                }

                /** Set form value */
                setTimeout(() => {
                    HelperService.debug(
                        '[CatalogueMssSettingsComponent - BEFORE] prepareEditCatalogue form.patchValue',
                        {
                            catalogue,
                            form: this.form.getRawValue(),
                        }
                    );

                    HelperService.debug(
                        '[CatalogueMssSettingsComponent - AFTER] prepareEditCatalogue form.patchValue',
                        {
                            catalogue,
                            formRaw: this.form.getRawValue(),
                            form: this.form.value,
                        }
                    );
                    
                }, 500);

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    checkSelectAll() {
        const radioButton = this.form.get('radioButton');
        const checkRadioButton = (type) => Object.values(this.selectedData).every(item => item[type]);
        checkRadioButton('nonMss') && radioButton.setValue('non-mss');
        checkRadioButton('mssOnly') && radioButton.setValue('mss-only');
        checkRadioButton('mssCore') && radioButton.setValue('mss-core');

        if (
            !checkRadioButton('nonMss') &&
            !checkRadioButton('mssOnly') &&
            !checkRadioButton('mssCore')
        ) {
            radioButton.setValue(null);
        }
    }
}

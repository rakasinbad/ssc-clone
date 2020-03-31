import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChildren, QueryList, Output, Input, EventEmitter, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { fromCatalogue } from '../../store/reducers';
import { ErrorMessageService, NoticeService, HelperService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil, tap } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { CatalogueSelectors, BrandSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { CataloguesService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { CatalogueUnit, CatalogueCategory, Catalogue } from '../../models';
import { CatalogueActions, BrandActions } from '../../store/actions';
import { MatDialog, PageEvent, MatPaginator, MatSort } from '@angular/material';
import { Brand } from 'app/shared/models/brand.model';
import { SafeHtml } from '@angular/platform-browser';
import { TNullable, FormStatus } from 'app/shared/models/global.model';
import { CataloguePrice } from '../../models/catalogue-price.model';
import { environment } from 'environments/environment';

type IFormMode = 'add' | 'view' | 'edit';
// 
@Component({
    selector: 'catalogue-price-settings',
    templateUrl: './catalogue-price-settings.component.html',
    styleUrls: ['./catalogue-price-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class CataloguePriceSettingsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk form.
    form: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';
    // Untuk mendapatkan nilai status loading dari state-nya catalogue.
    isLoading$: Observable<boolean>;
    // Untuk menyimpan price settings-nya catalogue.
    cataloguePrices$: Observable<Array<CataloguePrice>>;
    // Untuk menyimpan jumlah price setting-nya catalogue yang tersedia di back-end.
    totalCataloguePrice$: Observable<number>;
    // Untuk menyimpan kolom tabel yang ingin dimunculkan.
    displayedColumns: Array<string> = [
        'warehouse',
        'storeType',
        'storeGroup',
        'storeChannel',
        'storeCluster',
        'price',
    ];

    defaultPageSize: number = environment.pageSize;
    defaultPageSizeTable: Array<number> = environment.pageSizeTable;

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output() formValueChange: EventEmitter<CataloguePrice> = new EventEmitter<CataloguePrice>();

    // Untuk mendapatkan event ketika form mode berubah.
    @Output() formModeChange: EventEmitter<IFormMode> = new EventEmitter<IFormMode>();

    @Input()
    get formMode(): IFormMode {
        return this.formModeValue;
    }

    set formMode(mode: IFormMode) {
        this.formModeValue = mode;
        this.formModeChange.emit(this.formModeValue);
    }


    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
    formClass: {
        'custom-field-right': boolean;
        'view-field-right': boolean;
    };
    cataloguePriceTools: Array<string> = [
        'warehouse',
        'type',
        'group',
        'channel',
        'cluster',
    ];

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef<HTMLElement>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private store: NgRxStore<fromCatalogue.FeatureState>,
        private catalogue$: CataloguesService,
        private errorMessage$: ErrorMessageService,
    ) {
        this.cataloguePrices$ = this.store.select(
            CatalogueSelectors.getCataloguePriceSettings
        ).pipe(
            takeUntil(this.subs$)
        );

        this.totalCataloguePrice$ = this.store.select(
            CatalogueSelectors.getTotalCataloguePriceSettings
        ).pipe(
            takeUntil(this.subs$)
        );

        this.isLoading$ = this.store.select(
            CatalogueSelectors.getIsLoading
        ).pipe(
            takeUntil(this.subs$)
        );
    }

    drop(event: CdkDragDrop<Array<string>>): void {
        // this.cataloguePriceTools.
        moveItemInArray(this.cataloguePriceTools, event.previousIndex, event.currentIndex);
    }

    private updateFormView(): void {
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'view-field-right': this.isViewMode()
        };

        this.catalogueContent = {
            'mt-16': true,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode()
        };
    }

    private checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe(urls => {
            if (urls.filter(url => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this.prepareEditCatalogue();
            } else if (urls.filter(url => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEditCatalogue();
            } else if (urls.filter(url => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
            this.store.select(AuthSelectors.getUserSupplier)
        ])
            .pipe(
                withLatestFrom(this.cataloguePrices$),
                takeUntil(this.subs$)
            ).subscribe(([[catalogue, userSupplier], cataloguePrices]: [[Catalogue, UserSupplier], Array<CataloguePrice>]) => {
                /** Mengambil ID dari URL (untuk jaga-jaga ketika ID katalog yang terpilih tidak ada di state) */
                const { id } = this.route.snapshot.params;

                /** Butuh mengambil data katalog jika belum ada di state. */
                if (!catalogue) {
                    this.store.dispatch(
                        CatalogueActions.fetchCatalogueRequest({
                            payload: id
                        })
                    );

                    this.store.dispatch(
                        CatalogueActions.setSelectedCatalogue({
                            payload: id
                        })
                    );

                    return;
                }

                if (cataloguePrices.length === 0) {
                    const query: IQueryParams = {
                        paginate: true,
                        limit: environment.pageSize,
                        skip: 0
                    };

                    query['catalogueId'] = catalogue.id;
                    query['warehouseIds'] = [];

                    this.store.dispatch(
                        CatalogueActions.fetchCataloguePriceSettingsRequest({
                            payload: query
                        })
                    );
                }

                /** Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut. */
                if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                    this.store.dispatch(
                        CatalogueActions.spliceCatalogue({
                            payload: id
                        })
                    );

                    this.notice$.open('Produk tidak ditemukan.', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    setTimeout(() => this.router.navigate(['pages', 'catalogues', 'list']), 1000);

                    return;
                }

                if (!this.isAddMode()) {
                    this.form.get('advancePrice').disable();
                } else {
                    this.form.get('advancePrice').enable();
                }

                /** Pemberian jeda untuk memasukkan data katalog ke dalam form. */
                setTimeout(() => {
                    this.form.patchValue({
                        id: catalogue.id,
                        retailBuyingPrice: catalogue.retailBuyingPrice,
                    });

                    this.cdRef.markForCheck();
                });

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>).pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(value => HelperService.debug('CATALOGUE PRICE SETTINGS FORM STATUS CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe(status => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(value => HelperService.debug('[BEFORE MAP] CATALOGUE PRICE SETTINGS FORM VALUE CHANGED', value)),
            map(value => {
                const formValue = {
                    catalogueDimension: isNaN(Number(value.productShipment.catalogueDimension))
                        ? null
                        : Number(value.productShipment.catalogueDimension),
                    catalogueWeight: isNaN(Number(value.productShipment.catalogueWeight))
                        ? null
                        : Number(value.productShipment.catalogueWeight),
                    packagedDimension: isNaN(Number(value.productShipment.packagedDimension))
                        ? null
                        : Number(value.productShipment.packagedDimension),
                    packagedWeight: isNaN(Number(value.productShipment.packagedWeight))
                        ? null
                        : Number(value.productShipment.packagedWeight),
                    dangerItem: false,
                };

                return formValue;
            }),
            tap(value => HelperService.debug('[AFTER MAP] CATALOGUE WEIGHT & DIMENSION FORM VALUE CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            // this.formValueChange.emit(value);
        });
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
            return form.errors && form.touched;
        }

        if (ignoreTouched) {
            return form.errors && form.dirty;
        }

        return form.errors && (form.dirty || form.touched);
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

    onChangePage(ev: PageEvent): void {
        HelperService.debug('onChangePage', ev);

        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        this.store.dispatch(
            CatalogueActions.fetchCataloguePriceSettingsRequest({
                payload: data
            })
        );

        // this.table.nativeElement.scrollIntoView();
    }

    ngOnInit(): void {
        /** Menyiapkan form. */
        this.form = this.fb.group({
            id: [''],
            // basePrice: [
            //     '',
            //     [
            //         RxwebValidators.required({
            //             message: this.errorMessage$.getErrorMessageNonState(
            //                 'default',
            //                 'required'
            //             )
            //         })
            //     ]
            // ],
            retailBuyingPrice: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState(
                            'default',
                            'required'
                        )
                    })
                ]
            ],
            advancePrice: [true]
        });

        this.checkRoute();
        // this.initFormCheck();
    }

    ngAfterViewInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['formMode'].isFirstChange() && changes['formMode'].currentValue === 'edit') {
            this.trigger$.next('');

            setTimeout(() => {
                this.updateFormView();
            });
        } else if (changes['formMode'].currentValue) {
            this.trigger$.next('');
            setTimeout(() => this.updateFormView());
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

}

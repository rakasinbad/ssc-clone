import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject } from 'rxjs';

import { FeatureState as PeriodTargetPromoCoreFeatureState } from '../../store/reducers';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil, tap } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { PeriodTargetPromoSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { PeriodTargetPromoApiService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { PeriodTargetPromo } from '../../models';
import { PeriodTargetPromoActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { Brand } from 'app/shared/models/brand.model';
import { FormStatus } from 'app/shared/models/global.model';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import * as moment from 'moment';
import { Catalogue, StoreSegmentationGroup, StoreSegmentationChannel, StoreSegmentationCluster } from 'app/main/pages/catalogues/models';
import { Warehouse } from 'app/main/pages/logistics/warehouse-coverages/models/warehouse-coverage.model';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { Selection } from 'app/shared/components/multiple-selection/models';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'period-target-promo-customer-segmentation-settings',
    templateUrl: './customer-segmentation-settings.component.html',
    styleUrls: ['./customer-segmentation-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PeriodTargetPromoCustomerSegmentationSettingsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk keperluan nilai awal pada multiple selection.
    chosen$: Array<BehaviorSubject<Array<Selection>>> = [
        new BehaviorSubject<Array<Selection>>([]), // untuk store
        new BehaviorSubject<Array<Selection>>([]), // untuk warehouse
        new BehaviorSubject<Array<Selection>>([]), // untuk store segmentation type
        new BehaviorSubject<Array<Selection>>([]), // untuk store segmentation group
        new BehaviorSubject<Array<Selection>>([]), // untuk store segmentation channel
        new BehaviorSubject<Array<Selection>>([]), // untuk store segmentation cluster
    ];
    // Untuk menyimpan daftar platform.
    platforms$: Observable<Array<Brand>>;
    // Untuk form.
    form: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';

    // tslint:disable-next-line: no-inferrable-types
    labelLength: number = 10;
    // tslint:disable-next-line: no-inferrable-types
    formFieldLength: number = 40;

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output() formValueChange: EventEmitter<PeriodTargetPromo> = new EventEmitter<PeriodTargetPromo>();

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

    // Untuk class yang digunakan di berbeda mode form.
    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        // 'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
    // Untuk styling form field di mode form yang berbeda.
    formClass: {
        'custom-field': boolean;
        'view-field label-no-padding': boolean;
    };

    // @ViewChild('imageSuggestionPicker', { static: false, read: ElementRef }) imageSuggestionPicker: ElementRef<HTMLInputElement>;

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private store: NgRxStore<PeriodTargetPromoCoreFeatureState>,
        private promo$: PeriodTargetPromoApiService,
        private errorMessage$: ErrorMessageService,
    ) { }

    private updateFormView(): void {
        // Penetapan class pada form field berdasarkan mode form-nya.
        this.formClass = {
            'custom-field': !this.isViewMode(),
            'view-field label-no-padding': this.isViewMode()
        };
        // Penetapan class pada konten katalog berdasarkan mode form-nya.
        this.catalogueContent = {
            'mt-16': true,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            // 'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode()
        };

        this.cdRef.markForCheck();
    }

    private checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe(urls => {
            if (urls.filter(url => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this.prepareEdit();
            } else if (urls.filter(url => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEdit();
            } else if (urls.filter(url => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private prepareEdit(): void {
        combineLatest([
            this.trigger$,
            this.store.select(PeriodTargetPromoSelectors.getSelectedPeriodTargetPromo)
        ]).pipe(
            withLatestFrom(
                this.store.select(AuthSelectors.getUserSupplier),
                ([_, periodTargetPromo], userSupplier) => ({ periodTargetPromo, userSupplier })
            ),
            takeUntil(this.subs$)
        ).subscribe(({ periodTargetPromo, userSupplier }) => {
            // Butuh mengambil data period target promo jika belum ada di state.
            if (!periodTargetPromo) {
                // Mengambil ID dari parameter URL.
                const { id } = this.route.snapshot.params;

                this.store.dispatch(
                    PeriodTargetPromoActions.fetchPeriodTargetPromoRequest({
                        payload: (id as string)
                    })
                );

                this.store.dispatch(
                    PeriodTargetPromoActions.selectPeriodTargetPromo({
                        payload: (id as string)
                    })
                );

                return;
            } else {
                // Harus keluar dari halaman form jika promo yang diproses bukan milik supplier tersebut.
                if (periodTargetPromo.supplierId !== userSupplier.supplierId) {
                    this.store.dispatch(
                        PeriodTargetPromoActions.resetPeriodTargetPromo()
                    );

                    this.notice$.open('Promo tidak ditemukan.', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    setTimeout(() => this.router.navigate(['pages', 'promos', 'period-target-promo']), 1000);

                    return;
                }
            }

            this.form.patchValue({
                id: periodTargetPromo.id,
                segmentationBase: periodTargetPromo.target === 'store' ? 'direct-store' : periodTargetPromo.target,
                chosenStore: periodTargetPromo.promoStores.length === 0 ? '' : periodTargetPromo.promoStores,
                chosenWarehouse: periodTargetPromo.promoWarehouses.length === 0 ? '' : periodTargetPromo.promoWarehouses,
                chosenStoreType: periodTargetPromo.promoTypes.length === 0 ? '' : periodTargetPromo.promoTypes,
                chosenStoreGroup: periodTargetPromo.promoGroups.length === 0 ? '' : periodTargetPromo.promoGroups,
                chosenStoreChannel: periodTargetPromo.promoChannels.length === 0 ? '' : periodTargetPromo.promoChannels,
                chosenStoreCluster: periodTargetPromo.promoClusters.length === 0 ? '' : periodTargetPromo.promoClusters,
            });

            if (periodTargetPromo.target === 'store') {
                // STORE
                this.chosen$[0].next(periodTargetPromo.promoStores.map(data => ({
                    id: data.store.id,
                    label: data.store.name,
                    group: 'supplier-stores',
                })));
            } else if (periodTargetPromo.target === 'segmentation') {
                // WAREHOUSE
                this.chosen$[1].next(periodTargetPromo.promoWarehouses.map(data => ({
                    id: data.warehouse.id,
                    label: data.warehouse.name,
                    group: 'warehouses',
                })));
                // STORE SEGMENTATION TYPE
                this.chosen$[2].next(periodTargetPromo.promoTypes.map(data => ({
                    id: data.type.id,
                    label: data.type.name,
                    group: 'store-segmentation-types',
                })));
                // STORE SEGMENTATION GROUP
                this.chosen$[3].next(periodTargetPromo.promoGroups.map(data => ({
                    id: data.group.id,
                    label: data.group.name,
                    group: 'store-segmentation-groups',
                })));
                // STORE SEGMENTATION CHANNEL
                this.chosen$[4].next(periodTargetPromo.promoChannels.map(data => ({
                    id: data.channel.id,
                    label: data.channel.name,
                    group: 'store-segmentation-channels',
                })));
                // STORE SEGMENTATION CLUSTER
                this.chosen$[5].next(periodTargetPromo.promoClusters.map(data => ({
                    id: data.cluster.id,
                    label: data.cluster.name,
                    group: 'store-segmentation-clusters',
                })));
            }

            if (this.formMode === 'view') {
                this.form.get('segmentationBase').disable({ onlySelf: true, emitEvent: false });
            } else {
                this.form.get('segmentationBase').enable({ onlySelf: true, emitEvent: false });
            }

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.markAsDirty({ onlySelf: false });
            this.form.markAllAsTouched();
            this.form.markAsPristine();
        });
    }

    private initForm(): void {
        this.form = this.fb.group({
            id: [''],
            segmentationBase: ['segmentation', [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            chosenStore: ['', [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            chosenWarehouse: ['', [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            chosenStoreType: ['', [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            chosenStoreGroup: ['', [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            chosenStoreChannel: ['', [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            chosenStoreCluster: ['', [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
        });
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>).pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(value => HelperService.debug('PERIOD TARGET PROMO CUSTOMER SEGMENTATION SETTINGS FORM STATUS CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe(status => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(200),
            // tap(value => HelperService.debug('PERIOD TARGET PROMO CUSTOMER SEGMENTATION SETTINGS FORM VALUE CHANGED', value)),
            tap(value => HelperService.debug('[BEFORE MAP] PERIOD TARGET PROMO CUSTOMER SEGMENTATION SETTINGS FORM VALUE CHANGED', value)),
            map(() => {
                const rawValue = this.form.getRawValue();

                if (rawValue.segmentationBase === 'direct-store') {
                    return ({
                        id: rawValue.id,
                        segmentationBase: rawValue.segmentationBase,
                        chosenStore: rawValue.chosenStore.length === 0 ? [] : rawValue.chosenStore,
                    });
                } else if (rawValue.segmentationBase === 'segmentation') {
                    return ({
                        id: rawValue.id,
                        segmentationBase: rawValue.segmentationBase,
                        chosenWarehouse: rawValue.chosenWarehouse.length === 0 ? [] : rawValue.chosenWarehouse,
                        chosenStoreType: rawValue.chosenStoreType.length === 0 ? [] : rawValue.chosenStoreType,
                        chosenStoreGroup: rawValue.chosenStoreGroup.length === 0 ? [] : rawValue.chosenStoreGroup,
                        chosenStoreChannel: rawValue.chosenStoreChannel.length === 0 ? [] : rawValue.chosenStoreChannel,
                        chosenStoreCluster: rawValue.chosenStoreCluster.length === 0 ? [] : rawValue.chosenStoreCluster,
                    });
                }

                return rawValue;
            }),
            tap(value => HelperService.debug('[AFTER MAP] PERIOD TARGET PROMO CUSTOMER SEGMENTATION SETTINGS FORM VALUE CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            this.formValueChange.emit(value);
        });

        this.form.get('segmentationBase').valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(value => HelperService.debug('PERIOD TARGET PROMO CUSTOMER SEGMENTATION SETTINGS SEGMENTATION BASE VALUE CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (value === 'direct-store') {
                this.form.get('chosenStore').enable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenWarehouse').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenStoreType').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenStoreGroup').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenStoreChannel').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenStoreCluster').disable({ onlySelf: true, emitEvent: true });
            }
            else if (value === 'segmentation') {
                this.form.get('chosenStore').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenWarehouse').enable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenStoreType').enable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenStoreGroup').enable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenStoreChannel').enable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenStoreCluster').enable({ onlySelf: true, emitEvent: true });
            }

            this.form.updateValueAndValidity();
        });
    }

    // onEditCategory(): void {
    //     this.dialog.open(CataloguesSelectCategoryComponent, { width: '1366px' });
    // }

    // checkExternalId(): AsyncValidatorFn {
    //     return (control: AbstractControl): Observable<ValidationErrors | null> => {
    //         return control.valueChanges.pipe(
    //             distinctUntilChanged(),
    //             debounceTime(500),
    //             withLatestFrom(
    //                 this.store.select(AuthSelectors.getUserSupplier),
    //                 this.store.select(CatalogueSelectors.getSelectedCatalogueEntity)
    //             ),
    //             take(1),
    //             switchMap(([value, userSupplier, catalogue]) => {
    //                 if (!value) {
    //                     return of({
    //                         required: true
    //                     });
    //                 }

    //                 const params: IQueryParams = {
    //                     limit: 1,
    //                     paginate: true
    //                 };

    //                 params['externalId'] = value;
    //                 params['supplierId'] = userSupplier.supplierId;

    //                 return this.catalogue$.findAll(params).pipe(
    //                     map(response => {
    //                         if (response.total > 0) {
    //                             if (!this.isAddMode()) {
    //                                 if (response.data[0].id === catalogue.id) {
    //                                     return null;
    //                                 }
    //                             }

    //                             return {
    //                                 skuSupplierExist: true
    //                             };
    //                         }

    //                         return null;
    //                     })
    //                 );
    //             })
    //         );
    //     };
    // }

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

    onStoreSelected(event: Array<SupplierStore>): void {
        this.form.get('chosenStore').markAsDirty({ onlySelf: true });
        this.form.get('chosenStore').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('chosenStore').setValue('');
        } else {
            this.form.get('chosenStore').setValue(event);
        }
    }

    onWarehouseSelected(event: Array<Warehouse>): void {
        this.form.get('chosenWarehouse').markAsDirty({ onlySelf: true });
        this.form.get('chosenWarehouse').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('chosenWarehouse').setValue('');
        } else {
            this.form.get('chosenWarehouse').setValue(event);
        }
    }

    onStoreTypeSelected(event: Array<StoreSegmentationType>): void {
        this.form.get('chosenStoreType').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreType').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('chosenStoreType').setValue('');
        } else {
            this.form.get('chosenStoreType').setValue(event);
        }
    }

    onStoreGroupSelected(event: Array<StoreSegmentationGroup>): void {
        this.form.get('chosenStoreGroup').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreGroup').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('chosenStoreGroup').setValue('');
        } else {
            this.form.get('chosenStoreGroup').setValue(event);
        }
    }

    onStoreChannelSelected(event: Array<StoreSegmentationChannel>): void {
        this.form.get('chosenStoreChannel').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreChannel').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('chosenStoreChannel').setValue('');
        } else {
            this.form.get('chosenStoreChannel').setValue(event);
        }
    }

    onStoreClusterSelected(event: Array<StoreSegmentationCluster>): void {
        this.form.get('chosenStoreCluster').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreCluster').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('chosenStoreCluster').setValue('');
        } else {
            this.form.get('chosenStoreCluster').setValue(event);
        }
    }

    ngOnInit(): void {
        /** Menyiapkan form. */
        this.initForm();

        this.checkRoute();
        this.initFormCheck();
        // this.initCatalogueBrand();
        // this.initCatalogueUnitState();
        // this.initCatalogueCategoryState();
        // this.checkSelectedCatalogueCategory();
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

        this.trigger$.next('');
        this.trigger$.complete();

        this.chosen$.forEach(chosen => {
            chosen.next([]);
            chosen.complete();
        });

        // this.catalogueCategories$.next([]);
        // this.catalogueCategories$.complete();

        // this.catalogueUnits$.next([]);
        // this.catalogueUnits$.complete();

        // this.store.dispatch(CatalogueActions.resetCatalogueUnits());
        // this.store.dispatch(UiActions.hideFooterAction());
        // this.store.dispatch(FormActions.resetCancelButtonAction());
        // this.store.dispatch(CatalogueActions.resetCatalogueUnits());
    }

}

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
    MatSelectChange,
    MatSlideToggleChange,
    MatDialog,
} from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
// import {
//     StoreSegmentationChannel,
//     StoreSegmentationCluster,
//     StoreSegmentationGroup,
// } from 'app/main/pages/catalogues/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
// import { CreditLimitGroup, CreditLimitStore } from 'app/main/pages/finances/credit-limit-balance/models';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation/store-segmentation-types/models';
import { StoreSegmentationTypesApiService } from 'app/shared/components/dropdowns/store-segmentation/store-segmentation-types/services';
import { SelectedTree } from 'app/shared/components/selection-tree/selection-tree/models';
import { StoreSegmentationTreeComponent } from 'app/shared/components/selection-tree/store-segmentation/store-segmentation.component';
import { ErrorMessageService, HelperService, TUploadPhotoType } from 'app/shared/helpers';
import { Cluster } from 'app/shared/models/cluster.model';
import { ErrorHandler, IPaginatedResponse, TNullable, FormStatus } from 'app/shared/models/global.model';
import { District, Province, Urban } from 'app/shared/models/location.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { StoreGroup } from 'app/shared/models/store-group.model';
import { StoreType } from 'app/shared/models/store-type.model';
import { UserSupplier, SupplierStore } from 'app/shared/models/supplier.model';
import { VehicleAccessibility } from 'app/shared/models/vehicle-accessibility.model';
import { DropdownActions, FormActions, UiActions, WarehouseActions } from 'app/shared/store/actions';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { NgxPermissionsService } from 'ngx-permissions';
import * as numeral from 'numeral';
import { BehaviorSubject, fromEvent, Observable, of, Subject, forkJoin, throwError, combineLatest } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    take,
    takeUntil,
    tap,
    withLatestFrom,
    concatMap,
    flatMap,
    exhaustMap,
} from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { Store as Merchant, StoreSetting, ICheckOwnerPhoneResponse } from '../models';
import { StoreActions, StoreSettingActions } from '../store/actions';
import { fromMerchant } from '../store/reducers';
import { StoreSelectors, StoreSettingSelectors } from '../store/selectors';
import { MerchantApiService, WarehouseApiService } from '../services';
import {
    StoreSegmentationTypesApiService as StoreSegmentationApiService
} from 'app/shared/components/selection-tree/store-segmentation/services/store-segmentation-api.service';

import { PhotoUploadApiService, UploadPhotoApiPayload } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { Warehouse, WarehouseDropdown } from '../models/warehouse.model';

// import { Hierarchy } from 'app/shared/models/customer-hierarchy.model';
// import { StoreSegment } from 'app/shared/models/store-segment.model';
interface RecordedSelection<T> {
    lastSaved: T;
    current: T;
}

@Component({
    selector: 'app-merchant-form',
    templateUrl: './merchant-form.component.html',
    styleUrls: ['./merchant-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantFormComponent implements OnInit, AfterViewInit, OnDestroy {
    form: FormGroup;
    currentStoreId: string;
    
    tmpOwnerTaxPhoto: FormControl;  
    tmpIdentityPhoto: FormControl;
    tmpIdentityPhotoSelfie: FormControl;

    tmpStoreTaxPhoto: FormControl;
    tmpStorePhoto: FormControl;

    storeIdType: FormControl = new FormControl('manual');
    storeIdNextNumber: string;
    userId: string;
    pageType: string;
    numberOfEmployees: { amount: string }[];
    storeStatuses: { id: string; label: string }[];
    tempInvoiceGroupName: Array<string>;
    tempCreditLimitAmount: Array<boolean>;
    tempTermOfPayment: Array<boolean>;

    districtHighlight: string;
    urbanHighlight: string;

    // tslint:disable-next-line: no-inferrable-types
    isEditMode: boolean = false;
    isDistrictTyping: boolean;
    isUrbanTyping: boolean;

    isCheckingOwnerPhone$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    stores$: Observable<SupplierStore>;
    provinces$: Observable<Province[]>;
    cities$: Observable<Urban[]>;
    districts$: Observable<Array<District>>;
    urbans$: Observable<Array<Urban>>;
    // districts$: Observable<Urban[]>;
    // urbans$: Observable<Urban[]>;
    postcode$: Observable<string>;
    storeClusters$: Observable<Cluster[]>;
    storeGroups$: Observable<StoreGroup[]>;
    // storeSegments$: Observable<StoreSegment[]>;
    storeTypes$: BehaviorSubject<StoreType[]> = new BehaviorSubject<StoreType[]>([]);
    // hierarchies$: Observable<Hierarchy[]>;
    vehicleAccessibilities$: Observable<VehicleAccessibility[]>;
    creditLimitGroups$: Observable<any[]>;
    // d2Source$: DistrictDataSource;

    reset$: BehaviorSubject<string> = new BehaviorSubject<string>('reset');
    isLoading$: Observable<boolean>;
    isLoadingDistrict$: Observable<boolean>;
    storeSetting$: Observable<StoreSetting>;
    // Untuk keperluan handle dialog.
    dialogStoreType: ApplyDialogService<StoreSegmentationTreeComponent>;
    newPhoto: string;
    oldPhoto: string;
    dialogPreviewPhoto: ApplyDialogService;
    dialogUploadPhotoProgress: ApplyDialogService;

    private _unSubs$: Subject<void> = new Subject<void>();
    private _selectedDistrict: string;
    _selectedUrban: string;
    private _timer: Array<NodeJS.Timer> = [];

    selectedStoreType: Array<StoreSegmentationType> = [];
    selectedStoreGroup: Array<any> = [];
    selectedStoreChannel: Array<any> = [];
    selectedStoreCluster: Array<any> = [];

    selectedStoreType$: BehaviorSubject<RecordedSelection<string>> = new BehaviorSubject<
        RecordedSelection<string>
    >({ lastSaved: 'Choose Store Type', current: 'Choose Store Type' });
    selectedStoreGroup$: BehaviorSubject<RecordedSelection<string>> = new BehaviorSubject<
        RecordedSelection<string>
    >({ lastSaved: 'Choose Store Group', current: 'Choose Store Group' });
    selectedStoreChannel$: BehaviorSubject<RecordedSelection<string>> = new BehaviorSubject<
        RecordedSelection<string>
    >({ lastSaved: 'Choose Store Channel', current: 'Choose Store Channel' });
    selectedStoreCluster$: BehaviorSubject<RecordedSelection<string>> = new BehaviorSubject<
        RecordedSelection<string>
    >({ lastSaved: 'Choose Store Cluster', current: 'Choose Store Cluster' });

    // Untuk menyimpan progress.
    uploadOwnerTaxPhoto$: BehaviorSubject<string> = new BehaviorSubject<string>('none');
    uploadIdentityPhoto$: BehaviorSubject<string> = new BehaviorSubject<string>('none');
    uploadIdentityPhotoSelfie$: BehaviorSubject<string> = new BehaviorSubject<string>('none');
    uploadStoreTaxPhoto$: BehaviorSubject<string> = new BehaviorSubject<string>('none');
    uploadStorePhoto$: BehaviorSubject<string> = new BehaviorSubject<string>('none');

    availableWarehouses: Array<WarehouseDropdown> = [];
    // tslint:disable-next-line: no-inferrable-types
    isWarehouseLoading$: boolean = false;

    @ViewChild('autoDistrict', { static: false }) autoDistrict: MatAutocomplete;
    @ViewChild('triggerDistrict', { static: false, read: MatAutocompleteTrigger })
    triggerDistrict: MatAutocompleteTrigger;
    @ViewChild('triggerUrban', { static: false, read: MatAutocompleteTrigger })
    triggerUrban: MatAutocompleteTrigger;
    @ViewChild(MatAutocompleteTrigger, { static: false })
    autoCompleteTrigger: MatAutocompleteTrigger;

    @ViewChild('cdkProvince', { static: false }) cdkProvince: CdkVirtualScrollViewport;
    @ViewChild('cdkCity', { static: false }) cdkCity: CdkVirtualScrollViewport;
    @ViewChild('cdkDistrict', { static: false }) cdkDistrict: CdkVirtualScrollViewport;
    @ViewChild('cdkDistrict2', { static: false }) cdkDistrict2: CdkVirtualScrollViewport;
    @ViewChild('cdkUrban', { static: false }) cdkUrban: CdkVirtualScrollViewport;

    @ViewChild('selectStoreType', { static: false }) selectStoreType: TemplateRef<
        StoreSegmentationTreeComponent
    >;
    @ViewChild('selectStoreGroup', { static: false }) selectStoreGroup: TemplateRef<
        StoreSegmentationTreeComponent
    >;
    @ViewChild('selectStoreChannel', { static: false }) selectStoreChannel: TemplateRef<
        StoreSegmentationTreeComponent
    >;
    @ViewChild('selectStoreCluster', { static: false }) selectStoreCluster: TemplateRef<
        StoreSegmentationTreeComponent
    >;
    @ViewChild('previewPhoto', { static: false }) previewPhoto: TemplateRef<any>;
    @ViewChild('uploadPhotos', { static: false }) uploadPhotos: TemplateRef<any>;

    constructor(
        private cdRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private ngxPermissions: NgxPermissionsService,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromMerchant.FeatureState>,
        private applyDialogFactory$: ApplyDialogFactoryService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$helper: HelperService,
        private _$typeApi: StoreSegmentationTypesApiService,
        private _$merchantApi: MerchantApiService,
        private _$segmentation: StoreSegmentationApiService,
        private _$photo: PhotoUploadApiService,
        private matDialog: MatDialog,
        private warehouseService: WarehouseApiService
    ) {
        // Menyiapkan query untuk pencarian store entity.
        const params: IQueryParams = {
            paginate: false,
            limit: 10,
            skip: 0,
        };
        this.requestStoreType(params);

        this.storeTypes$
            .pipe(
                tap((value) => HelperService.debug('AVAILABLE STORE TYPES', value)),
                takeUntil(this._unSubs$)
            )
            .subscribe();

        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set footer action
        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor tambah toko',
                            active: true,
                        },
                        value: {
                            active: true,
                        },
                        active: false,
                    },
                    action: {
                        save: {
                            label: 'Save',
                            active: true,
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false,
                        },
                        cancel: {
                            label: 'Cancel',
                            active: true,
                        },
                        goBack: {
                            label: 'Back',
                            active: true,
                            url: '/pages/account/stores',
                        },
                    },
                },
            })
        );

        this.store.dispatch(UiActions.showFooterAction());

        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            // translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Account',
                            translate: 'BREADCRUMBS.ACCOUNT',
                        },
                        {
                            title: 'Add Store',
                            translate: 'BREADCRUMBS.ADD_STORE',
                            active: true,
                        },
                    ],
                })
            );

            this.pageType = 'new';
        } else {
            this.isEditMode = true;

            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            // translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Account',
                            translate: 'BREADCRUMBS.ACCOUNT',
                        },
                        {
                            title: 'Edit Store',
                            translate: 'BREADCRUMBS.EDIT_STORE',
                            active: true,
                        },
                    ],
                })
            );

            this.pageType = 'edit';
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.tempInvoiceGroupName = ['-'];
        this.tempCreditLimitAmount = [false];
        this.tempTermOfPayment = [false];

        if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            this.store.select(StoreSelectors.getSelectedSupplierStore).pipe(
                switchMap(supplierStore => {
                    if (supplierStore) {
                        return forkJoin({
                            type: this._$segmentation.resolve(supplierStore.outerStore['storeType']['typeId'], 'type'),
                            group: this._$segmentation.resolve(supplierStore.outerStore['storeGroup']['groupId'], 'group'),
                            channel: this._$segmentation.resolve(supplierStore.outerStore['storeChannel']['channelId'], 'channel'),
                            cluster: this._$segmentation.resolve(supplierStore.outerStore['storeCluster']['clusterId'], 'cluster'),
            
                        }).pipe(
                            map(({ type, group, channel, cluster }) => {
                                if (type.text) {
                                    this.selectedStoreType$.next({
                                        lastSaved: type.text,
                                        current: type.text
                                    });
                                }

                                if (group.text) {
                                    this.selectedStoreGroup$.next({
                                        lastSaved: group.text,
                                        current: group.text
                                    });
                                }

                                if (channel.text) {
                                    this.selectedStoreChannel$.next({
                                        lastSaved: channel.text,
                                        current: channel.text
                                    });
                                }

                                if (cluster.text) {
                                    this.selectedStoreCluster$.next({
                                        lastSaved: cluster.text,
                                        current: cluster.text
                                    });
                                }

                                return supplierStore;
                            })
                        );
                    }

                    return of(supplierStore);
                }),
                takeUntil(this._unSubs$)
            ).subscribe();

            this.store.dispatch(StoreActions.fetchSupplierStoreRequest({ payload: id }));
        }

        this.initForm();

        this.districts$ = this.store.select(DropdownSelectors.getAllDistrict);

        this.urbans$ = this.store.select(DropdownSelectors.getAllUrban);

        /* this.urbans$ = combineLatest([
            this.store.select(DropdownSelectors.getAllUrban),
            this.form.get('storeInfo.address.urban').valueChanges
        ]).pipe(map(([source, search]) => this._filterUrban(source, search))); */

        // this.d2Source$ = new DistrictDataSource(this.store);

        // Get selector dropdown province
        // this.provinces$ = this.store.select(DropdownSelectors.getProvinceDropdownState);
        // Fetch request province
        // this.store.dispatch(DropdownActions.fetchDropdownProvinceRequest());

        // Get selector dropdown store type
        // this.storeTypes$ = this.store.select(DropdownSelectors.getStoreTypeDropdownState);
        // Fetch request store stype
        // this.store.dispatch(DropdownActions.fetchDropdownStoreTypeRequest());

        // Get selector dropdown store group
        // this.storeGroups$ = this.store.select(DropdownSelectors.getStoreGroupDropdownState);
        // Fetch request store group
        // this.store.dispatch(DropdownActions.fetchDropdownStoreGroupRequest());

        // Get selector dropdown store cluster
        // this.storeClusters$ = this.store.select(DropdownSelectors.getStoreClusterDropdownState);
        // Fetch request store cluster
        // this.store.dispatch(DropdownActions.fetchDropdownStoreClusterRequest());

        // Get selector dropdown store segment
        // this.storeSegments$ = this.store.select(DropdownSelectors.getStoreSegmentDropdownState);
        // Fetch request store segment
        // this.store.dispatch(DropdownActions.fetchDropdownStoreSegmentRequest());

        // Get selector dropdown hierarcy
        // this.hierarchies$ = this.store.select(DropdownSelectors.getHierarchyDropdownState);
        // Fetch request hierarchy
        // this.store.dispatch(DropdownActions.fetchDropdownHierarchyRequest());

        // Get selector dropdown vehicle accessibility
        this.vehicleAccessibilities$ = this.store.select(
            DropdownSelectors.getVehicleAccessibilityDropdownState
        );
        // Fetch request vehicle accessibility
        this.store.dispatch(DropdownActions.fetchDropdownVehicleAccessibilityRequest());

        // Fetch request invoice group
        this.store.dispatch(DropdownActions.fetchDropdownInvoiceGroupRequest());

        // Get selector dropdown credit limit group
        this.creditLimitGroups$ = this.store.select(
            DropdownSelectors.getCreditLimitGroupDropdownState
        );
        // Fetch request credit limit group
        this.store.dispatch(DropdownActions.fetchDropdownCreditLimitGroupRequest());

        this.isLoadingDistrict$ = this.store.select(DropdownSelectors.getIsLoadingDistrict);

        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);

        // Get data number of employee (local)
        this._$merchantApi.getNumberOfEmployee().subscribe(response => {
            this.numberOfEmployees = response;
        });

        // Get a list of store statuses (local)
        this.storeStatuses = this._$helper.storeStatuses();

        this.store.dispatch(FormActions.resetFormStatus());

        // Handle search district autocomplete & try request to endpoint
        this.form
            .get('storeInfo.address.district')
            .valueChanges.pipe(
                filter((v) => {
                    if (v) {
                        this.districtHighlight = v;
                        return v.length >= 3;
                    }

                    return false;
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe((v) => {
                if (v) {
                    const data: IQueryParams = {
                        limit: 10,
                        skip: 0,
                    };

                    data['paginate'] = true;

                    data['search'] = [
                        {
                            fieldName: 'keyword',
                            keyword: v,
                        },
                    ];

                    this.districtHighlight = v;

                    this.store.dispatch(DropdownActions.searchDistrictRequest({ payload: data }));
                }
            });

        // Handle search urban autocomplete & refresh source data with filter
        this.form
            .get('storeInfo.address.urban')
            .valueChanges.pipe(takeUntil(this._unSubs$))
            .subscribe((v) => {
                this.urbanHighlight = v;

                this.urbans$ = this.store
                    .select(DropdownSelectors.getAllUrban)
                    .pipe(map((source) => this._filterUrban(source, v)));
            });

        // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
        this.form.statusChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe((status) => {
                if (status === 'VALID' && this.addressValid()) {
                    this.store.dispatch(FormActions.setFormStatusValid());
                }

                if (status === 'INVALID' || !this.addressValid()) {
                    this.store.dispatch(FormActions.setFormStatusInvalid());
                }
            });

        // Handle reset button action (footer)
        this.store
            .select(FormSelectors.getIsClickResetButton)
            .pipe(
                filter((isClick) => !!isClick),
                exhaustMap(() => {
                    const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(
                        DeleteConfirmationComponent,
                        {
                            data: {
                                title: 'Cancel changes',
                                message: `Are you sure want to reset the form? It will lose your changes.`,
                                id: 'reset',
                            },
                            disableClose: true,
                        }
                    );
    
                    return dialogRef.afterClosed();
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe((value) => {
                if (value === 'reset') {
                    const supplierId = this.form.get('supplierId').value;

                    if (!this.isEditMode) {
                        this.form.reset();
                    }
                    this.resetTemporaryPhotoForms();

                    this.form.get('supplierId').setValue(supplierId);
                    this.reset$.next('reset');
                    this.store.dispatch(FormActions.resetClickResetButton());
                }
            });

        // Handle save button action (footer)
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter((isClick) => !!isClick),
                withLatestFrom(this.store.select(StoreSelectors.getSelectedSupplierStore)),
                takeUntil(this._unSubs$)
            )
            .subscribe(([isClick, supplierStore]) => {
                if (isClick) {
                    if (this.pageType === 'edit') {
                        this.onSubmit(supplierStore.id);
                    } else {
                        this.onSubmit();
                    }
                }
            });

        this.store
            .select(StoreSettingSelectors.getAllStoreSetting)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((storeSettings) => {
                if (storeSettings.length === 0) {
                    return this.store.dispatch(
                        StoreSettingActions.fetchStoreSettingsRequest({
                            payload: {
                                paginate: true,
                                skip: 0,
                                limit: 1,
                            },
                        })
                    );
                }

                const storeSetting = storeSettings[0];
                this.storeIdNextNumber =
                    storeSetting.supplierPrefix + storeSetting.storeIterationNumber;

                if (!this.isEditMode) {
                    this.storeIdType.setValue('auto');
                }
            });

        this.storeIdType.valueChanges
            .pipe(debounceTime(100), distinctUntilChanged(), takeUntil(this._unSubs$))
            .subscribe((value) => {
                if (value === 'auto') {
                    this.form.get('storeInfo.storeId.id').setValue(this.storeIdNextNumber);
                }
            });
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        // Handle trigger autocomplete district force selected from options
        this.triggerDistrict.panelClosingActions.pipe(takeUntil(this._unSubs$)).subscribe((e) => {
            const value = this.form.get('storeInfo.address.district').value;

            if (!this._selectedDistrict || this._selectedDistrict !== JSON.stringify(value)) {
                // Set input district empty
                this.form.get('storeInfo.address.district').setValue('');

                // Reset input urban
                this.form.get('storeInfo.address.urban').reset();

                // Reset input postcode
                this.form.get('storeInfo.address.postcode').reset();

                // Reset state urban
                this.store.dispatch(DropdownActions.resetUrbansState());

                // Set selected district empty (helper check User is choose from option or not)
                this._selectedDistrict = '';
            }
        });

        // Handle trigger autocomplete urban force selected from options
        this.triggerUrban.panelClosingActions.pipe(takeUntil(this._unSubs$)).subscribe((e) => {
            const value = this.form.get('storeInfo.address.urban').value;

            if (!this._selectedUrban || this._selectedUrban !== JSON.stringify(value)) {
                // Set input urban empty
                this.form.get('storeInfo.address.urban').setValue('');

                // Reset input postcode
                this.form.get('storeInfo.address.postcode').reset();

                // Set selected urban empty (helper check User is choose from option or not)
                this._selectedUrban = '';
            }
        });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this._unSubs$.next();
        this._unSubs$.complete();

        this.reset$.next(null);
        this.reset$.complete();

        this.isCheckingOwnerPhone$.next(false);
        this.isCheckingOwnerPhone$.complete();

        this.uploadOwnerTaxPhoto$.next(null);
        this.uploadIdentityPhoto$.next(null);
        this.uploadIdentityPhotoSelfie$.next(null);
        this.uploadStoreTaxPhoto$.next(null);
        this.uploadStorePhoto$.next(null);

        this.uploadOwnerTaxPhoto$.complete();
        this.uploadIdentityPhoto$.complete();
        this.uploadIdentityPhotoSelfie$.complete();
        this.uploadStoreTaxPhoto$.complete();
        this.uploadStorePhoto$.complete();

        // Reset selected Supplier Store
        this.store.dispatch(StoreActions.deselectSupplierStore());

        // Hide footer action
        this.store.dispatch(UiActions.hideFooterAction());

        // Reset breadcrumb state
        this.store.dispatch(UiActions.resetBreadcrumb());

        // Reset form status state
        this.store.dispatch(FormActions.resetFormStatus());

        // Reset click reset button state
        this.store.dispatch(FormActions.resetClickResetButton());

        // Reset click save button state
        this.store.dispatch(FormActions.resetClickSaveButton());

        // Reset invoice group state
        this.store.dispatch(DropdownActions.resetInvoiceGroupState());

        // Reset district state
        this.store.dispatch(DropdownActions.resetDistrictsState());

        // Reset urban state
        this.store.dispatch(DropdownActions.resetUrbansState());

        // Reset Store Edit
        this.store.dispatch(StoreActions.resetStoreEdit());

        // Reset province state
        // this.store.dispatch(DropdownActions.resetProvinceState());

        this.tempInvoiceGroupName = ['-'];
        this.tempCreditLimitAmount = [false];
        this.tempTermOfPayment = [false];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get formCreditLimits(): FormArray {
        return this.form.get('storeInfo.payment.creditLimit') as FormArray;
    }

    get creditLimitControls(): AbstractControl[] {
        return (this.form.get('storeInfo.payment.creditLimit') as FormArray).controls;
    }

    openPreviewPhoto(newPhoto: string, oldPhoto: string, type: string): void {
        this.newPhoto = newPhoto;
        this.oldPhoto = oldPhoto;

        this.dialogPreviewPhoto = this.applyDialogFactory$.open(
            {
                title: `Preview Photo ${'(' + type + ')'}`,
                template: this.previewPhoto,
                isApplyEnabled: false,
                showApplyButton: false,
            },
            {
                disableClose: false,
                width: '80vw',
                minWidth: '80vw',
                maxWidth: '80vw',
            }
        );

        this.dialogPreviewPhoto.closed$.subscribe({
            next: (value: TNullable<string>) => {
                HelperService.debug('DIALOG PREVIEW PHOTO CLOSED', value);
            },
        });
    }

    checkOwnerPhone(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            return control.valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(500),
                take(1),
                switchMap(value => {
                    if (!value) {
                        this.disableStoreInformationForm();
                        this.resetStoreInformationForm();

                        return of({
                            required: true
                        });
                    }

                    this.isCheckingOwnerPhone$.next(true);
                    const supplierId = +(this.form.get('supplierId').value);

                    return this._$merchantApi.checkOwnerPhone(value, supplierId).pipe(
                        map(response => {
                            this.isCheckingOwnerPhone$.next(false);

                            if (response.storeId) {
                                this.disableStoreInformationForm();
                                this.resetStoreInformationForm();
                                this.loadStoreInformationForm(response);

                                // Tidak bisa menambahkan nomor telepon yang sudah terdaftar di supplier tersebut.
                                // 1 nomor telepon pemilik toko tidak boleh didaftarkan di supplier yang sama (untuk saat ini).
                                if (!response.availability) {
                                    return {
                                        notAvailable: {
                                            message: 'This phone number is already registered by this supplier.',
                                            refValues: [value]
                                        }
                                    };
                                }
                            } else {
                                this.enableStoreInformationForm();
                                this.resetStoreInformationForm();
                            }

                            return null;
                        }),
                        catchError(() => {
                            this.isCheckingOwnerPhone$.next(false);
                            return of({
                                internalError: {
                                    message: 'There\'s an internal error. Please try again later.'
                                }
                            });
                        })
                    );
                })
            );
        };
    }

    onSelectStoreType(): void {
        this.dialogStoreType = this.applyDialogFactory$.open(
            {
                title: 'Select Store Type',
                template: this.selectStoreType,
                isApplyEnabled: true,
            },
            {
                disableClose: true,
                width: '80vw',
                minWidth: '80vw',
                maxWidth: '80vw',
            }
        );

        this.dialogStoreType.closed$.subscribe({
            next: (value: TNullable<string>) => {
                HelperService.debug('DIALOG SELECTION STORE TYPE CLOSED', value);

                const selected =
                    this.selectedStoreType.length === 0
                        ? null
                        : this.selectedStoreType[this.selectedStoreType.length - 1].id;
                if (value === 'apply') {
                    this.form.get('storeInfo.storeClassification.storeType').setValue(selected);

                    this.selectedStoreType$.next({
                        lastSaved: this.selectedStoreType$.value.current,
                        current: this.selectedStoreType$.value.current,
                    });
                }

                this.cdRef.detectChanges();
            },
        });
    }

    onStoreTypeSelected($event: Array<StoreSegmentationType>): void {
        this.selectedStoreType = $event;
        HelperService.debug('onStoreTypeSelected', $event);
    }

    onStoreTypeSelectionChanged($event: SelectedTree): void {
        HelperService.debug('onStoreTypeSelectionChanged', $event);

        if (!$event.selected) {
            this.dialogStoreType.disableApply();
        } else if ($event.selected.hasChild) {
            this.dialogStoreType.disableApply();
        } else {
            this.dialogStoreType.enableApply();
        }

        this.selectedStoreType$.next({
            lastSaved: this.selectedStoreType$.value.lastSaved,
            current: $event.selectedString ? $event.selectedString : this.selectedStoreType$.value.lastSaved,
        });
    }

    onSelectStoreGroup(): void {
        this.dialogStoreType = this.applyDialogFactory$.open(
            {
                title: 'Select Store Group',
                template: this.selectStoreGroup,
                isApplyEnabled: true,
            },
            {
                disableClose: true,
                width: '80vw',
                minWidth: '80vw',
                maxWidth: '80vw',
            }
        );

        this.dialogStoreType.closed$.subscribe({
            next: (value: TNullable<string>) => {
                HelperService.debug('DIALOG SELECTION STORE GROUP CLOSED', value);

                const selected =
                    this.selectedStoreGroup.length === 0
                        ? null
                        : this.selectedStoreGroup[this.selectedStoreGroup.length - 1].id;
                if (value === 'apply') {
                    this.form.get('storeInfo.storeClassification.storeGroup').setValue(selected);

                    this.selectedStoreGroup$.next({
                        lastSaved: this.selectedStoreGroup$.value.current,
                        current: this.selectedStoreGroup$.value.current,
                    });
                }

                this.cdRef.detectChanges();
            },
        });
    }

    onStoreGroupSelected($event: Array<any>): void {
        this.selectedStoreGroup = $event;
        HelperService.debug('onStoreGroupSelected', $event);
    }

    onStoreGroupSelectionChanged($event: SelectedTree): void {
        HelperService.debug('onStoreGroupSelectionChanged', $event);

        if (!$event.selected) {
            this.dialogStoreType.disableApply();
        } else if ($event.selected.hasChild) {
            this.dialogStoreType.disableApply();
        } else {
            this.dialogStoreType.enableApply();
        }

        this.selectedStoreGroup$.next({
            lastSaved: this.selectedStoreGroup$.value.lastSaved,
            current: $event.selectedString ? $event.selectedString : this.selectedStoreGroup$.value.lastSaved
        });
    }

    onSelectStoreChannel(): void {
        this.dialogStoreType = this.applyDialogFactory$.open(
            {
                title: 'Select Store Channel',
                template: this.selectStoreChannel,
                isApplyEnabled: true,
            },
            {
                disableClose: true,
                width: '80vw',
                minWidth: '80vw',
                maxWidth: '80vw',
            }
        );

        this.dialogStoreType.closed$.subscribe({
            next: (value: TNullable<string>) => {
                HelperService.debug('DIALOG SELECTION STORE CHANNEL CLOSED', value);

                const selected =
                    this.selectedStoreChannel.length === 0
                        ? null
                        : this.selectedStoreChannel[this.selectedStoreChannel.length - 1].id;
                if (value === 'apply') {
                    this.form.get('storeInfo.storeClassification.storeChannel').setValue(selected);

                    this.selectedStoreChannel$.next({
                        lastSaved: this.selectedStoreChannel$.value.current,
                        current: this.selectedStoreChannel$.value.current,
                    });
                }

                this.cdRef.detectChanges();
            },
        });
    }

    onStoreChannelSelected($event: Array<any>): void {
        this.selectedStoreChannel = $event;
        HelperService.debug('onStoreChannelSelected', $event);
    }

    onStoreChannelSelectionChanged($event: SelectedTree): void {
        HelperService.debug('onStoreChannelSelectionChanged', $event);

        if (!$event.selected) {
            this.dialogStoreType.disableApply();
        } else if ($event.selected.hasChild) {
            this.dialogStoreType.disableApply();
        } else {
            this.dialogStoreType.enableApply();
        }

        this.selectedStoreChannel$.next({
            lastSaved: this.selectedStoreChannel$.value.lastSaved,
            current: $event.selectedString ? $event.selectedString : this.selectedStoreChannel$.value.lastSaved,
        });
    }

    onSelectStoreCluster(): void {
        this.dialogStoreType = this.applyDialogFactory$.open(
            {
                title: 'Select Store Cluster',
                template: this.selectStoreCluster,
                isApplyEnabled: true,
            },
            {
                disableClose: true,
                width: '80vw',
                minWidth: '80vw',
                maxWidth: '80vw',
            }
        );

        this.dialogStoreType.closed$.subscribe({
            next: (value: TNullable<string>) => {
                HelperService.debug('DIALOG SELECTION STORE CLUSTER CLOSED', value);

                const selected =
                    this.selectedStoreCluster.length === 0
                        ? null
                        : this.selectedStoreCluster[this.selectedStoreCluster.length - 1].id;
                if (value === 'apply') {
                    this.form.get('storeInfo.storeClassification.storeCluster').setValue(selected);

                    this.selectedStoreCluster$.next({
                        lastSaved: this.selectedStoreCluster$.value.current,
                        current: this.selectedStoreCluster$.value.current,
                    });
                }

                this.cdRef.detectChanges();
            },
        });
    }

    onStoreClusterSelected($event: Array<any>): void {
        this.selectedStoreCluster = $event;
        HelperService.debug('onStoreClusterSelected', $event);
    }

    onStoreClusterSelectionChanged($event: SelectedTree): void {
        HelperService.debug('onStoreClusterSelectionChanged', $event);

        if (!$event.selected) {
            this.dialogStoreType.disableApply();
        } else if ($event.selected.hasChild) {
            this.dialogStoreType.disableApply();
        } else {
            this.dialogStoreType.enableApply();
        }

        this.selectedStoreCluster$.next({
            lastSaved: this.selectedStoreCluster$.value.lastSaved,
            current: $event.selectedString ? $event.selectedString : this.selectedStoreCluster$.value.lastSaved,
        });
    }

    displayDistrictOption(item: District, isHtml = false): string {
        if (!isHtml) {
            return `${item.province.name}, ${item.city}, ${item.district}`;
        }

        return `<span class="subtitle">${item.province.name}, ${item.city}, ${item.district}</span>`;
    }

    displayUrbanOption(item: Urban, isHtml = false): string {
        return `${item.urban}`;
    }

    warehouseValidator(): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} | null => {
            const isWarehouseSelected: boolean = !!control.value;

            if (!isWarehouseSelected && this.availableWarehouses.length > 1) {
                return {
                    multipleWarehouses: {
                        message: 'This store is within the coverage area of multiple warehouses. Please choose ONE of the listed warehouses.',
                        value: control.value
                    }
                };
            }

            if (isWarehouseSelected) {
                return null;
            }
        };
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

    getErrorMessageArray(parent: string, field: string, idx: number): string {
        if (!parent && !field && typeof idx !== 'number') {
            return;
        }

        const parentArr = parent.split('.');

        if (parentArr.length > 1) {
            const { errors } = (this.form.get(parent) as FormArray).at(idx).get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        } else {
            const { errors } = this.form.get([parent, idx, field]);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
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

        if (field === 'storeInfo.legalInfo.identityPhoto') {
            return !!errors;
        }

        return errors && ((touched && dirty) || touched);
    }

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? false : value.length <= minLength;
    }

    // onBlur(field: string): void {
    //     switch (field) {
    //         case 'district':
    //             {
    //                 const value = this.form.get('storeInfo.address.district').value;

    //                 // if (
    //                 //     !this._selectedDistrict ||
    //                 //     this._selectedDistrict !== JSON.stringify(value)
    //                 // ) {
    //                 //     this.form.get('storeInfo.address.district').setValue('');
    //                 //     this._selectedDistrict = '';
    //                 // }

    //                 console.log('BLUR', value);
    //             }
    //             break;

    //         default:
    //             return;
    //     }
    // }

    onChangeAllowCredit(ev: MatSlideToggleChange, idx: number): void {
        if (typeof ev.checked !== 'boolean' || typeof idx !== 'number') {
            return;
        }

        if (ev.checked) {
            this.handleAllowCredit(idx);
        } else {
            this.handleNotAllowCredit(idx);
        }
    }

    onDisplayDistrict(item: District): string {
        if (!item) {
            return;
        }

        if (typeof item === 'string') {
            return item;
        }

        return HelperService.truncateText(
            `${item.province.name}, ${item.city}, ${item.district}`,
            40,
            'start'
        );
    }

    onDisplayUrban(item: Urban): string {
        if (!item) {
            return;
        }

        if (typeof item === 'string') {
            return item;
        }

        return item.urban;
    }

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            if (file) {
                switch (type) {
                    case 'owner-tax-photo':
                        {
                            const photoField = this.form.get('profileInfo.taxPhoto');

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                photoField.setValue(fileReader.result);
                                this.tmpOwnerTaxPhoto.setValue(file.name);

                                if (photoField.invalid) {
                                    photoField.markAsTouched();
                                }
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    case 'owner-identity-photo':
                        {
                            const photoField = this.form.get('profileInfo.identityPhoto');

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                photoField.setValue(fileReader.result);
                                this.tmpIdentityPhoto.setValue(file.name);

                                if (photoField.invalid) {
                                    photoField.markAsTouched();
                                }
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    case 'owner-identity-selfie-photo':
                        {
                            const photoField = this.form.get(
                                'profileInfo.identityPhotoSelfie'
                            );

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                photoField.setValue(fileReader.result);
                                this.tmpIdentityPhotoSelfie.setValue(file.name);

                                if (photoField.invalid) {
                                    photoField.markAsTouched();
                                }
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    case 'store-tax-photo':
                        {
                            const photoField = this.form.get(
                                'storeInfo.taxPhoto'
                            );

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                photoField.setValue(fileReader.result);
                                this.tmpStoreTaxPhoto.setValue(file.name);

                                if (photoField.invalid) {
                                    photoField.markAsTouched();
                                }
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    case 'store-photo':
                        {
                            const photoField = this.form.get(
                                'storeInfo.photo'
                            );

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                photoField.setValue(fileReader.result);
                                this.tmpStorePhoto.setValue(file.name);

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
        }

        return;
    }

    onKeydown(ev: KeyboardEvent, field: string): void {
        if (!field) {
            return;
        }

        clearTimeout(this._timer[field]);
    }

    onKeyup(ev: KeyboardEvent, field: string): void {
        switch (field) {
            case 'district':
                {
                    if (!(ev.target as any).value || (ev.target as any).value.length < 3) {
                        this.store.dispatch(DropdownActions.resetDistrictsState());
                        return;
                    }

                    this.isDistrictTyping = true;

                    clearTimeout(this._timer[field]);

                    this._timer[field] = setTimeout(() => {
                        this.isDistrictTyping = false;
                    }, 100);
                }
                break;

            case 'urban':
                {
                    if (!(ev.target as any).value) {
                        // this.store.dispatch(DropdownActions.resetDistrictsState());
                        return;
                    }

                    this.isUrbanTyping = true;

                    clearTimeout(this._timer[field]);

                    this._timer[field] = setTimeout(() => {
                        this.isUrbanTyping = false;

                        // Detect change manually
                        this.cdRef.markForCheck();
                    }, 100);
                }
                break;

            default:
                return;
        }
    }

    onOpenAutocomplete(): void {
      HelperService.debug('[MerchantFormComponent] onOpenedAutocomplete', {
        autoDistrict: this.autoDistrict,
        panel: this.autoDistrict.panel,
        triggerDistrict: this.triggerDistrict,
      });

      this.cdRef.detectChanges();

      fromEvent(this.autoDistrict.panel.nativeElement, 'scroll')
            .pipe(
                map(() => ({
                    scrollTop: this.autoDistrict.panel.nativeElement.scrollTop,
                    scrollHeight: this.autoDistrict.panel.nativeElement.scrollHeight,
                    elHeight: this.autoDistrict.panel.nativeElement.clientHeight,
                })),
                filter(
                    ({ scrollTop, scrollHeight, elHeight }) => scrollHeight === scrollTop + elHeight
                ),
                tap(({ scrollTop, scrollHeight, elHeight }) =>
                    HelperService.debug('[MerchantFromComponent tap] onOpenAutocomplete fromEvent', {
                        scrollTop,
                        scrollX,
                        scrollHeight,
                        elHeight,
                    })
                ),
                withLatestFrom(
                  this.store.select(DropdownSelectors.getTotalDistrictEntity),
                  this.store.select(DropdownSelectors.getTotalDistrict)
                ),
                takeUntil(this.triggerDistrict.panelClosingActions)
            )
            .subscribe({
                next: ([{ scrollTop, scrollHeight, elHeight }, skip, total]) => {
                    const atBottom = scrollHeight === scrollTop + elHeight;

                    HelperService.debug('[MerchantFromComponent next] onOpenAutocomplete fromEvent', {
                        scrollTop,
                        scrollX,
                        scrollHeight,
                        elHeight,
                        atBottom,
                        skip,
                        total
                    });

                    if (atBottom && skip && total && skip < total) {
                      const data: IQueryParams = {
                          limit: 10,
                          skip: skip,
                      };

                      data['paginate'] = true;

                      if (this.districtHighlight) {
                          data['search'] = [
                              {
                                  fieldName: 'keyword',
                                  keyword: this.districtHighlight,
                              },
                          ];

                          this.store.dispatch(
                              DropdownActions.fetchScrollDistrictRequest({
                                  payload: data,
                              })
                          );
                      }
                  }
                },
                complete: () =>
                    HelperService.debug(
                        '[MerchantFromComponent complete] onOpenAutocomplete fromEvent'
                    ),
            });

    }

    onOpenChangeProvince(ev: boolean): void {
        if (ev) {
            this.cdkProvince.scrollToIndex(0);
            this.cdkProvince.checkViewportSize();
        }
    }

    onOpenChangeCity(ev: boolean): void {
        if (ev) {
            this.cdkCity.scrollToIndex(0);
            this.cdkCity.checkViewportSize();
        }
    }

    onOpenChangeDistrict(ev: boolean): void {
        if (ev) {
            this.cdkDistrict.scrollToIndex(0);
            this.cdkDistrict.checkViewportSize();
        }
    }

    onOpenChangeUrban(ev: boolean): void {
        if (ev) {
            this.cdkUrban.scrollToIndex(0);
            this.cdkUrban.checkViewportSize();
        }
    }

    onResetCreditLimitGroup(idx: number): void {
        const allowCredit = this.formCreditLimits.at(idx).get('allowCreditLimit').value;

        if (typeof idx !== 'number' || typeof allowCredit !== 'boolean') {
            return;
        }

        if (allowCredit) {
            this.handleAllowCredit(idx);
        } else {
            this.handleNotAllowCredit(idx);
        }

        // this.tempCreditLimitAmount[idx] = true;
        // this.tempTermOfPayment[idx] = true;

        // this.formCreditLimits
        //     .at(idx)
        //     .get('termOfPayment')
        //     .reset();

        // this.formCreditLimits
        //     .at(idx)
        //     .get('creditLimitGroup')
        //     .reset();
    }

    onResetField(field: string): void {
        if (!field || typeof field !== 'string') {
            return;
        }

        this.form.get(field).reset();
    }

    onSelectAutocomplete(ev: MatAutocompleteSelectedEvent, field: string): void {
        switch (field) {
            case 'district':
                {
                    const value = (ev.option.value as District) || '';

                    if (!value) {
                        this.form.get('storeInfo.address.district').reset();
                        this.form.get('storeInfo.address.postcode').reset();
                    } else {
                        this.form.get('storeInfo.address.urban').reset();
                        if (value.urbans.length > 0) {
                            // this.form.get('storeInfo.address.urban').enable();

                            this.store.dispatch(
                                DropdownActions.setUrbanSource({ payload: value.urbans })
                            );
                        }
                    }

                    this._selectedDistrict = value ? JSON.stringify(value) : '';
                }
                break;

            case 'urban':
                {
                    const value = (ev.option.value as Urban) || '';

                    this.availableWarehouses = [];
                    this.form.get('storeInfo.address.warehouse').reset();

                    if (!value) {
                        this.form.get('storeInfo.address.postcode').reset();
                    } else {
                        this.form.get('storeInfo.address.postcode').setValue(value.zipCode);
                        this.requestWarehouse(+value.id);
                    }

                    this._selectedUrban = value ? JSON.stringify(value) : '';
                }
                break;

            default:
                return;
        }

        // console.log('AUTO ON SELECT', ev);
    }

    onSelectCreditLimitGroup(ev: MatSelectChange, idx: number): void {
        if (!ev.value || typeof idx !== 'number') {
            return;
        }

        this.store
            .select(DropdownSelectors.getCreditLimitGroupState, { id: ev.value })
            .pipe(takeUntil(this._unSubs$))
            .subscribe((resp) => {
                if (resp) {
                    // Handle credit limit amount
                    if (resp.defaultCreditLimit) {
                        this.formCreditLimits
                            .at(idx)
                            .get('creditLimit')
                            .patchValue(resp.defaultCreditLimit.replace('.', ','));
                    }

                    this.tempCreditLimitAmount[idx] = false;

                    this.formCreditLimits.at(idx).get('creditLimit').disable();

                    // Handle term of payment
                    if (resp.termOfPayment) {
                        this.formCreditLimits
                            .at(idx)
                            .get('termOfPayment')
                            .patchValue(resp.termOfPayment);
                    }

                    this.tempTermOfPayment[idx] = false;

                    this.formCreditLimits.at(idx).get('termOfPayment').disable();
                }
            });
    }

    /* onSelectProvince(ev: MatSelectChange): void {
        this.form.get('storeInfo.address.city').reset();
        this.form.get('storeInfo.address.district').reset();
        this.form.get('storeInfo.address.urban').reset();
        this.form.get('storeInfo.address.postcode').reset();

        if (!ev.value) {
            return;
        }

        this.cities$ = this.store
            .select(DropdownSelectors.getCityDropdownState, {
                provinceId: ev.value
            })
            .pipe(
                tap(hasCity => {
                    if (hasCity && hasCity.length > 0) {
                        this.form.get('storeInfo.address.city').enable();
                    }
                })
            );
    } */

    /* onSelectCity(ev: MatSelectChange): void {
        this.form.get('storeInfo.address.district').reset();
        this.form.get('storeInfo.address.urban').reset();
        this.form.get('storeInfo.address.postcode').reset();

        const provinceId = this.form.get('storeInfo.address.province').value;

        if (!ev.value || !provinceId) {
            return;
        }

        this.districts$ = this.store
            .select(DropdownSelectors.getDistrictDropdownState, {
                provinceId: provinceId,
                city: ev.value
            })
            .pipe(
                tap(hasDistrict => {
                    if (hasDistrict && hasDistrict.length > 0) {
                        this.form.get('storeInfo.address.district').enable();
                    }
                })
            );
    } */

    /* onSelectDistrict(ev: MatSelectChange): void {
        this.form.get('storeInfo.address.urban').reset();
        this.form.get('storeInfo.address.postcode').reset();

        const provinceId = this.form.get('storeInfo.address.province').value;
        const city = this.form.get('storeInfo.address.city').value;

        if (!ev.value || !provinceId || !city) {
            return;
        }

        this.urbans$ = this.store
            .select(DropdownSelectors.getUrbanDropdownState, {
                provinceId: provinceId,
                city: city,
                district: ev.value
            })
            .pipe(
                tap(hasUrban => {
                    if (hasUrban && hasUrban.length > 0) {
                        this.form.get('storeInfo.address.urban').enable();
                    }
                })
            );
    } */

    /* onSelectUrban(ev: MatSelectChange): void {
        this.form.get('storeInfo.address.postcode').reset();

        const provinceId = this.form.get('storeInfo.address.province').value;
        const city = this.form.get('storeInfo.address.city').value;
        const district = this.form.get('storeInfo.address.district').value;

        if (!ev.value || !provinceId || !city || !district) {
            return;
        }

        this.store
            .select(DropdownSelectors.getPostcodeDropdownState, {
                provinceId: provinceId,
                city: city,
                district: district,
                urbanId: ev.value
            })
            .pipe(takeUntil(this._unSubs$))
            .subscribe(postcode => {
                if (postcode) {
                    this.form.get('storeInfo.address.postcode').patchValue(postcode);
                }
            });
    } */

    // onScroll(ev: any, field: string): void {
    //     console.log('ON SCROLL', ev);

    //     switch (field) {
    //         case 'district':
    //             const end = this.cdkDistrict.getRenderedRange().end;
    //             const total = this.cdkDistrict.getDataLength();

    //             /* if (total > 0) {
    //                 const data: IQueryParams = {
    //                     limit: 50,
    //                     skip: this.cdkDistrict.getDataLength()
    //                 };

    //                 data['paginate'] = true;

    //                 this.store.dispatch(
    //                     DropdownActions.fetchScrollDistrictRequest({ payload: data })
    //                 );
    //             } */

    //             console.log('CEK', end, total, this.cdkDistrict.getViewportSize());
    //             break;
    //     }
    // }
    prepareRequestWarehouse(): void {
        if (this._selectedUrban) {
            const urban = JSON.parse(this._selectedUrban);

            if (urban.id) {
                this.requestWarehouse(urban.id, true);
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    private requestWarehouse(urbanId: number, resetValue: boolean = true): void {
        if (urbanId) {
            this.isWarehouseLoading$ = true;
            this.form.get('storeInfo.address.warehouse').disable();

            of(null)
                .pipe(
                    // tap(x => HelperService.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
                    // delay(1000),
                    debounceTime(1000),
                    withLatestFrom<any, UserSupplier>(
                        this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
                    ),
                    tap((x) => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
                    switchMap<
                        [null, UserSupplier],
                        Observable<Array<WarehouseDropdown>>
                    >(([_, userSupplier]) => {
                        // Jika user tidak ada data supplier.
                        if (!userSupplier) {
                            throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                        }
    
                        // Mengambil ID supplier-nya.
                        const { supplierId } = userSupplier;
    
                        // Melakukan request data warehouse.
                        return this.warehouseService
                            .find<Array<WarehouseDropdown>>(+supplierId, +urbanId)
                            .pipe(
                                tap((response) =>
                                    HelperService.debug('FIND WAREHOUSE', {
                                        supplierId,
                                        urbanId,
                                        response,
                                    })
                                )
                            );
                    }),
                    take(1),
                    catchError((err) => {
                        throw err;
                    })
                )
                .subscribe({
                    next: (response) => {
                        this.isWarehouseLoading$ = false;
                        HelperService.debug('WAREHOUSE RESPONSE', response);
                        this.availableWarehouses = response;

                        if (this.availableWarehouses.length === 1) {
                            this.form.get('storeInfo.address.warehouse').disable();
                            this.form.get('storeInfo.address.warehouse').setValue(this.availableWarehouses[0].id);
                        } else {
                            this.form.get('storeInfo.address.warehouse').enable();
                            if (resetValue) {
                                this.form.get('storeInfo.address.warehouse').setValue('');
                            }
                            this.form.get('storeInfo.address.warehouse').markAsTouched();

                            if (this.availableWarehouses.length === 0) {
                                this.form.get('storeInfo.address.warehouse').setErrors({
                                    noWarehouses: {
                                        message: `
                                            The store is not located within any warehouse coverage area.
                                            Please create a new warehouse by clicking the “Go To Warehouse” button.
                                            Once it’s done, hit the refresh button.
                                        `,
                                    }
                                });
                            }
                        }
                    },
                    error: (err) => {
                        this.isWarehouseLoading$ = false;
                        HelperService.debug('ERROR FIND WAREHOUSE', { error: err });
                        this._$helper.showErrorNotification(new ErrorHandler(err));
                    },
                    complete: () => {
                        this.isWarehouseLoading$ = false;
                        HelperService.debug('FIND WAREHOUSE COMPLETED');
                    },
                });
        }
    }
    
    private requestStoreType(params: IQueryParams): void {
        of(null)
            .pipe(
                // tap(x => HelperService.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
                // delay(1000),
                withLatestFrom<any, UserSupplier>(
                    this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
                ),
                tap((x) => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
                switchMap<
                    [null, UserSupplier],
                    Observable<IPaginatedResponse<StoreSegmentationType>>
                >(([_, userSupplier]) => {
                    // Jika user tidak ada data supplier.
                    if (!userSupplier) {
                        throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                    }

                    // Mengambil ID supplier-nya.
                    const { supplierId } = userSupplier;

                    // Membentuk query baru.
                    const newQuery: IQueryParams = { ...params };
                    // Memasukkan ID supplier ke dalam params baru.
                    newQuery['supplierId'] = supplierId;

                    // Melakukan request data warehouse.
                    return this._$typeApi
                        .find<IPaginatedResponse<StoreSegmentationType>>(newQuery)
                        .pipe(
                            tap((response) =>
                                HelperService.debug('FIND STORE TYPE', {
                                    params: newQuery,
                                    response,
                                })
                            )
                        );
                }),
                take(1),
                catchError((err) => {
                    throw err;
                })
            )
            .subscribe({
                next: (response) => {
                    HelperService.debug('STORE TYPE RESPONSE', response);

                    if (Array.isArray(response)) {
                        this.storeTypes$.next(response);
                    } else {
                        this.storeTypes$.next(response.data);
                    }
                },
                error: (err) => {
                    HelperService.debug('ERROR FIND STORE TYPE', { params, error: err });
                    this._$helper.showErrorNotification(new ErrorHandler(err));
                },
                complete: () => {
                    HelperService.debug('FIND STORE TYPE COMPLETED');
                },
            });
    }

    private createCreditLimitForm(): FormGroup {
        return this.formBuilder.group({
            allowCreditLimit: false,
            id: [''],
            creditLimitStoreId: [''],
            invoiceGroup: [{ value: '', disabled: true }],
            creditLimit: [
                { value: '', disabled: true },
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            creditLimitGroup: [{ value: '', disabled: true }],
            termOfPayment: [
                { value: '', disabled: true },
                [
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                ],
            ],
        });
    }

    private handleAllowCredit(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        this.tempCreditLimitAmount[idx] = true;
        this.tempTermOfPayment[idx] = true;

        this.formCreditLimits.at(idx).get('creditLimit').reset();

        this.formCreditLimits.at(idx).get('creditLimit').enable();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
            ]);

        this.formCreditLimits.at(idx).get('creditLimit').updateValueAndValidity();

        this.formCreditLimits.at(idx).get('termOfPayment').reset();

        this.formCreditLimits.at(idx).get('termOfPayment').enable();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.digit({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
            ]);

        this.formCreditLimits.at(idx).get('termOfPayment').updateValueAndValidity();

        this.formCreditLimits.at(idx).get('creditLimitGroup').reset();

        this.formCreditLimits.at(idx).get('creditLimitGroup').enable();
    }

    private handleNotAllowCredit(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        this.tempCreditLimitAmount[idx] = false;
        this.tempTermOfPayment[idx] = false;

        this.formCreditLimits.at(idx).get('creditLimit').reset();

        this.formCreditLimits.at(idx).get('creditLimit').disable();

        this.formCreditLimits.at(idx).get('creditLimit').clearValidators();

        this.formCreditLimits.at(idx).get('creditLimit').updateValueAndValidity();

        this.formCreditLimits.at(idx).get('termOfPayment').reset();

        this.formCreditLimits.at(idx).get('termOfPayment').disable();

        this.formCreditLimits.at(idx).get('termOfPayment').clearValidators();

        this.formCreditLimits.at(idx).get('termOfPayment').updateValueAndValidity();

        this.formCreditLimits.at(idx).get('creditLimitGroup').reset();

        this.formCreditLimits.at(idx).get('creditLimitGroup').disable();
    }

    private handleAllowCreditPatch(idx: number, item: any): void {
        if (typeof idx !== 'number') {
            return;
        }

        this.tempCreditLimitAmount[idx] = item.creditLimitGroupId ? false : true;
        this.tempTermOfPayment[idx] = item.creditLimitGroupId ? false : true;

        // Handle allowCreditLimit Field
        this.formCreditLimits.at(idx).get('allowCreditLimit').patchValue(true);

        if (this.formCreditLimits.at(idx).get('allowCreditLimit').invalid) {
            this.formCreditLimits.at(idx).get('allowCreditLimit').markAsTouched();
        }

        // Handle creditLimit Field
        this.formCreditLimits.at(idx).get('creditLimit').reset();

        this.formCreditLimits.at(idx).get('creditLimit').enable();

        if (item.creditLimitGroupId) {
            // this.formCreditLimits
            //     .at(idx)
            //     .get('creditLimit')
            //     .setValidators([
            //         RxwebValidators.numeric({
            //             acceptValue: NumericValueType.PositiveNumber,
            //             allowDecimal: true,
            //             message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
            //         }),
            //     ]);
        } else {
            this.formCreditLimits
                .at(idx)
                .get('creditLimit')
                .setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    // RxwebValidators.numeric({
                    //     acceptValue: NumericValueType.PositiveNumber,
                    //     allowDecimal: true,
                    //     message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    // }),
                ]);
        }

        setTimeout(() => {
            this.formCreditLimits
                .at(idx)
                .get('creditLimit')
                .patchValue(item.creditLimit.replace('.', ','));

            setTimeout(() => {
                if (this.formCreditLimits.at(idx).get('creditLimit').invalid) {
                    this.formCreditLimits.at(idx).get('creditLimit').markAsTouched();
                }

                setTimeout(() => {
                    this.formCreditLimits.at(idx).get('creditLimit').updateValueAndValidity();
                });
            });
        });

        // Handle termOfPayment Field
        this.formCreditLimits.at(idx).get('termOfPayment').reset();

        this.formCreditLimits.at(idx).get('termOfPayment').enable();

        if (item.creditLimitGroupId) {
            this.formCreditLimits
                .at(idx)
                .get('termOfPayment')
                .setValidators([
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                ]);
        } else {
            this.formCreditLimits
                .at(idx)
                .get('termOfPayment')
                .setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                ]);
        }

        this.formCreditLimits.at(idx).get('termOfPayment').patchValue(item.termOfPayment);

        if (this.formCreditLimits.at(idx).get('termOfPayment').invalid) {
            this.formCreditLimits.at(idx).get('termOfPayment').markAsTouched();
        }

        this.formCreditLimits.at(idx).get('termOfPayment').updateValueAndValidity();

        // Handle creditLimitGroup Field
        this.formCreditLimits.at(idx).get('creditLimitGroup').reset();

        this.formCreditLimits.at(idx).get('creditLimitGroup').enable();

        this.formCreditLimits.at(idx).get('creditLimitGroup').patchValue(item.creditLimitGroupId);
    }

    private handleNotAllowCreditPatch(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        this.tempCreditLimitAmount[idx] = false;
        this.tempTermOfPayment[idx] = false;

        this.formCreditLimits.at(idx).get('creditLimit').reset();

        this.formCreditLimits.at(idx).get('creditLimit').disable();

        this.formCreditLimits.at(idx).get('creditLimit').clearValidators();

        this.formCreditLimits.at(idx).get('creditLimit').updateValueAndValidity();

        this.formCreditLimits.at(idx).get('termOfPayment').reset();

        this.formCreditLimits.at(idx).get('termOfPayment').disable();

        this.formCreditLimits.at(idx).get('termOfPayment').clearValidators();

        this.formCreditLimits.at(idx).get('termOfPayment').updateValueAndValidity();

        this.formCreditLimits.at(idx).get('creditLimitGroup').reset();

        this.formCreditLimits.at(idx).get('creditLimitGroup').disable();
    }

    private _filterUrban(source: Array<Urban>, value: string): Array<Urban> {
        if (!value || !source || (source && source.length < 1)) {
            return source;
        }

        const filterValue = String(value).toLowerCase();

        return source.filter((r) => String(r.urban).toLowerCase().includes(filterValue));
    }

    private restoreInvoiceGroups(data: Array<InvoiceGroup>): void {
        if (data && data.length > 0) {
            for (const [idx, row] of data.entries()) {
                if (row.id) {
                    this.tempInvoiceGroupName[idx] = row.name || '-';

                    if (idx > 0) {
                        this.formCreditLimits.push(
                            this.formBuilder.group({
                                allowCreditLimit: false,
                                id: [''],
                                creditLimitStoreId: [''],
                                invoiceGroup: row.id,
                                creditLimitGroup: [
                                    {
                                        value: '',
                                        disabled: true,
                                    },
                                ],
                                creditLimit: [
                                    {
                                        value: '',
                                        disabled: true,
                                    },
                                ],
                                termOfPayment: [
                                    {
                                        value: '',
                                        disabled: true,
                                    },
                                ],
                            })
                        );
                    } else {
                        this.formCreditLimits.at(idx).get('allowCreditLimit').reset();

                        this.formCreditLimits
                            .at(idx)
                            .get('allowCreditLimit')
                            .patchValue(false);

                        this.formCreditLimits
                            .at(idx)
                            .get('invoiceGroup')
                            .patchValue(row.id);

                        this.formCreditLimits.at(idx).get('creditLimit').reset();

                        this.formCreditLimits.at(idx).get('termOfPayment').reset();

                        this.formCreditLimits.at(idx).get('creditLimitGroup').reset();
                    }
                }
            }
        }
    }

    private initForm(): void {
        this.tmpOwnerTaxPhoto = new FormControl({ value: '', disabled: true });
        this.tmpIdentityPhoto = new FormControl({ value: '', disabled: true });
        this.tmpIdentityPhotoSelfie = new FormControl({ value: '', disabled: true });
        this.tmpStoreTaxPhoto = new FormControl({ value: '', disabled: true });
        this.tmpStorePhoto = new FormControl({ value: '', disabled: true });

        // Inisialisasi form.
        this.form = this.formBuilder.group({
            storeId: ['', []],
            supplierId: ['', [
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            profileInfo: this.formBuilder.group({
                // Nomor Telepon Pemilik Toko
                phoneNumber: [
                    '',
                    {
                        validators: [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            // RxwebValidators.pattern({
                            //     expression: {
                            //         mobilePhone: /^08[0-9]{8,12}$/,
                            //     },
                            //     message: this._$errorMessage.getErrorMessageNonState(
                            //         'default',
                            //         'mobile_phone_pattern',
                            //         '08'
                            //     ),
                            // }),
                        ],
                        asyncValidators: [this.checkOwnerPhone()]
                    },
                ],
                // Nama Pemilik Toko
                name: [{ value: null, disabled: true }, [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'required'
                        )
                    }),
                ]],
                // Email Pemilik Toko
                email: [{ value: null, disabled: true }, [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'required'
                        )
                    }),
                ]],
                // Nomor Pokok Wajib Pajak (NPWP) Pemilik Toko
                taxId: [{ value: null, disabled: true }, [
                        // RxwebValidators.required({
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'required'
                        //     )
                        // }),
                        RxwebValidators.minLength({
                            value: 15,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                        RxwebValidators.maxLength({
                            value: 15,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                // Nomor KTP Pemilik Toko
                identityId: [{ value: null, disabled: true }, [
                        // RxwebValidators.required({
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'required'
                        //     )
                        // }),
                        RxwebValidators.digit({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                        RxwebValidators.minLength({
                            value: 16,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                        RxwebValidators.maxLength({
                            value: 16,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                // Foto NPWP Pemilik Toko
                taxPhoto: [{ value: null, disabled: true }, [
                        // RxwebValidators.required({
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'required'
                        //     )
                        // }),
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(5 * 1048576),
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(5 * 1048576).format('0.0 b', Math.floor) }
                            ),
                        }),
                    ],
                ],
                oldTaxPhoto: [null],
                // Foto KTP Pemilik Toko
                identityPhoto: [{ value: null, disabled: true }, [
                        // RxwebValidators.required({
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'required'
                        //     )
                        // }),
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(5 * 1048576),
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(5 * 1048576).format('0.0 b', Math.floor) }
                            ),
                        }),
                    ],
                ],
                oldIdentityPhoto: [null],
                // Foto KTP + Selfie Pemilik Toko
                identityPhotoSelfie: [{ value: null, disabled: true }, [
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(5 * 1048576),
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(5 * 1048576).format('0.0 b', Math.floor) }
                            ),
                        }),
                    ],
                ],
                oldIdentityPhotoSelfie: [null],
            }),
            storeInfo: this.formBuilder.group({
                approvalStatus: ['verified'],
                storeId: this.formBuilder.group({
                    id: [
                        '',
                        [
                            // RxwebValidators.required({
                            //     message: this._$errorMessage.getErrorMessageNonState(
                            //         'default',
                            //         'required'
                            //     ),
                            // }),
                        ],
                    ],
                    storeName: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                }),
                // Nomor Pokok Wajib Pajak (NPWP) Toko
                taxId: [
                    '',
                    [
                        // RxwebValidators.required({
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'required'
                        //     )
                        // }),
                        RxwebValidators.minLength({
                            value: 15,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                        RxwebValidators.maxLength({
                            value: 15,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                // Nomor Telepon Toko
                phoneNumber: [
                    '',
                    [
                        // RxwebValidators.required({
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'required'
                        //     )
                        // }),
                        // RxwebValidators.pattern({
                        //     expression: {
                        //         mobilePhone: /^08[0-9]{8,12}$/,
                        //     },
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'mobile_phone_pattern',
                        //         '08'
                        //     ),
                        // }),
                    ],
                ],
                // Foto NPWP Toko
                taxPhoto: [
                    null,
                    [
                        // RxwebValidators.required({
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'required'
                        //     )
                        // }),
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(5 * 1048576),
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(5 * 1048576).format('0.0 b', Math.floor) }
                            ),
                        }),
                    ],
                ],
                oldTaxPhoto: [null],
                // Foto NPWP Toko
                photo: [
                    null,
                    [
                        // RxwebValidators.required({
                        //     message: this._$errorMessage.getErrorMessageNonState(
                        //         'default',
                        //         'required'
                        //     )
                        // }),
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(5 * 1048576),
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(5 * 1048576).format('0.0 b', Math.floor) }
                            ),
                        }),
                    ],
                ],
                oldPhoto: [null],
                status: ['', [
                    // RxwebValidators.required({
                    //     message: this._$errorMessage.getErrorMessageNonState(
                    //         'default',
                    //         'required'
                    //     ),
                    // }),
                ]],
                address: this.formBuilder.group({
                    // province: [
                    //     '',
                    //     [
                    //         RxwebValidators.required({
                    //             message: this._$errorMessage.getErrorMessageNonState(
                    //                 'default',
                    //                 'required'
                    //             )
                    //         })
                    //     ]
                    // ],
                    // city: [
                    //     { value: '', disabled: true },
                    //     [
                    //         RxwebValidators.required({
                    //             message: this._$errorMessage.getErrorMessageNonState(
                    //                 'default',
                    //                 'required'
                    //             )
                    //         })
                    //     ]
                    // ],
                    district: [
                        { value: '', disabled: false },
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                    urban: [
                        { value: '', disabled: false },
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                    postcode: [
                        { value: '', disabled: true },
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                            RxwebValidators.digit({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                ),
                            }),
                            RxwebValidators.minLength({
                                value: 5,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                ),
                            }),
                            RxwebValidators.maxLength({
                                value: 5,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                ),
                            }),
                        ],
                    ],
                    address: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                    notes: ['', []],
                    warehouse: ['', [
                        RxwebValidators.required({
                            conditionalExpression: (x: Urban | string) => !!x && this.availableWarehouses.length === 0,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        this.warehouseValidator()
                    ]],
                    geolocation: this.formBuilder.group({
                        lng: [
                            '',
                            [
                                RxwebValidators.longitude({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    ),
                                }),
                            ],
                        ],
                        lat: [
                            '',
                            [
                                RxwebValidators.latitude({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    ),
                                }),
                            ],
                        ],
                    }),
                }),
                // legalInfo: this.formBuilder.group({
                //     name: [
                //         '',
                //         [
                //             RxwebValidators.required({
                //                 message: this._$errorMessage.getErrorMessageNonState(
                //                     'default',
                //                     'required'
                //                 ),
                //             }),
                //             // RxwebValidators.alpha({
                //             //     allowWhiteSpace: true,
                //             //     message: this._$errorMessage.getErrorMessageNonState(
                //             //         'default',
                //             //         'pattern'
                //             //     ),
                //             // }),
                //         ],
                //     ],
                //     identityId: [
                //         '',
                //         [
                //             // RxwebValidators.required({
                //             //     message: this._$errorMessage.getErrorMessageNonState(
                //             //         'default',
                //             //         'required'
                //             //     )
                //             // }),
                //             RxwebValidators.digit({
                //                 message: this._$errorMessage.getErrorMessageNonState(
                //                     'default',
                //                     'pattern'
                //                 ),
                //             }),
                //             RxwebValidators.minLength({
                //                 value: 16,
                //                 message: this._$errorMessage.getErrorMessageNonState(
                //                     'default',
                //                     'pattern'
                //                 ),
                //             }),
                //             RxwebValidators.maxLength({
                //                 value: 16,
                //                 message: this._$errorMessage.getErrorMessageNonState(
                //                     'default',
                //                     'pattern'
                //                 ),
                //             }),
                //         ],
                //     ],
                //     identityPhoto: [
                //         '',
                //         [
                //             // RxwebValidators.required({
                //             //     message: this._$errorMessage.getErrorMessageNonState(
                //             //         'default',
                //             //         'required'
                //             //     )
                //             // }),
                //             RxwebValidators.fileSize({
                //                 maxSize: Math.floor(5 * 1048576),
                //                 message: this._$errorMessage.getErrorMessageNonState(
                //                     'default',
                //                     'file_size_lte',
                //                     { size: numeral(5 * 1048576).format('0.0 b', Math.floor) }
                //                 ),
                //             }),
                //         ],
                //     ],
                //     identityPhotoSelfie: [
                //         '',
                //         [
                //             RxwebValidators.fileSize({
                //                 maxSize: Math.floor(5 * 1048576),
                //                 message: this._$errorMessage.getErrorMessageNonState(
                //                     'default',
                //                     'file_size_lte',
                //                     { size: numeral(5 * 1048576).format('0.0 b', Math.floor) }
                //                 ),
                //             }),
                //         ],
                //     ],
                //     npwpId: [
                //         '',
                //         [
                //             // RxwebValidators.required({
                //             //     message: this._$errorMessage.getErrorMessageNonState(
                //             //         'default',
                //             //         'required'
                //             //     )
                //             // }),
                //             RxwebValidators.minLength({
                //                 value: 15,
                //                 message: this._$errorMessage.getErrorMessageNonState(
                //                     'default',
                //                     'pattern'
                //                 ),
                //             }),
                //             RxwebValidators.maxLength({
                //                 value: 15,
                //                 message: this._$errorMessage.getErrorMessageNonState(
                //                     'default',
                //                     'pattern'
                //                 ),
                //             }),
                //         ],
                //     ],
                // }),
                physicalStoreInfo: this.formBuilder.group({
                    numberOfEmployee: [''],
                    vehicleAccessibility: [''],
                }),
                storeClassification: this.formBuilder.group({
                    storeType: [
                        '',
                        // [
                        //     RxwebValidators.required({
                        //         message: this._$errorMessage.getErrorMessageNonState(
                        //             'default',
                        //             'required'
                        //         )
                        //     })
                        // ]
                    ],
                    storeGroup: [
                        '',
                        // [
                        //     RxwebValidators.required({
                        //         message: this._$errorMessage.getErrorMessageNonState(
                        //             'default',
                        //             'required'
                        //         )
                        //     })
                        // ]
                    ],
                    storeChannel: [
                        '',
                        // [
                        //     RxwebValidators.required({
                        //         message: this._$errorMessage.getErrorMessageNonState(
                        //             'default',
                        //             'required'
                        //         )
                        //     })
                        // ]
                    ],
                    storeCluster: [
                        '',
                        // [
                        //     RxwebValidators.required({
                        //         message: this._$errorMessage.getErrorMessageNonState(
                        //             'default',
                        //             'required'
                        //         )
                        //     })
                        // ]
                    ],
                    // storeSegment: [
                    //     ''
                    //     // [
                    //     //     RxwebValidators.required({
                    //     //         message: this._$errorMessage.getErrorMessageNonState(
                    //     //             'default',
                    //     //             'required'
                    //     //         )
                    //     //     })
                    //     // ]
                    // ],
                    // hierarchy: ['']
                }),
                payment: this.formBuilder.group({
                    creditLimit: this.formBuilder.array([this.createCreditLimitForm()]),
                }),
            }),
        });

        combineLatest([
            this.reset$,
            this.store.select(DropdownSelectors.getInvoiceGroupDropdownState),
            this.store.select(StoreSelectors.getSelectedSupplierStore)
        ])
        .pipe(takeUntil(this._unSubs$))
        .subscribe(([_, invoiceGroups, data]) => {
            if (this.pageType === 'new') {
                if (invoiceGroups) {
                    this.restoreInvoiceGroups(invoiceGroups);
                }
                this.form.get('storeInfo.status').disable();
                this.form.get('storeInfo.status').patchValue('active');
            } else if (this.pageType === 'edit') {
                if (data && invoiceGroups) {
                    this.disableStoreInformationForm();
                    this.restoreInvoiceGroups(invoiceGroups);
                    this.restoreFormData(data);
                }
            }
        });

        this.createFormListener();

        this.store.select(AuthSelectors.getUserSupplier)
        .pipe(
            takeUntil(this._unSubs$)
        ).subscribe(({ supplierId }) => {
            this.form.get('supplierId').patchValue(supplierId);
        });
    }

    // private restoreInvoiceGroups(data: Array<InvoiceGroup>): void {
    //     if (data && data.length > 0) {
    //         for (const [idx, row] of data.entries()) {
    //             if (row.id) {
    //                 this.tempInvoiceGroupName[idx] = row.name || '-';

    //                 if (idx > 0) {
    //                     this.formCreditLimits.push(
    //                         this.formBuilder.group({
    //                             allowCreditLimit: false,
    //                             id: [''],
    //                             creditLimitStoreId: [''],
    //                             invoiceGroup: row.id,
    //                             creditLimitGroup: [
    //                                 {
    //                                     value: '',
    //                                     disabled: true,
    //                                 },
    //                             ],
    //                             creditLimit: [
    //                                 {
    //                                     value: '',
    //                                     disabled: true,
    //                                 },
    //                             ],
    //                             termOfPayment: [
    //                                 {
    //                                     value: '',
    //                                     disabled: true,
    //                                 },
    //                             ],
    //                         })
    //                     );
    //                 } else {
    //                     this.formCreditLimits.at(idx).get('allowCreditLimit').reset();

    //                     this.formCreditLimits
    //                         .at(idx)
    //                         .get('allowCreditLimit')
    //                         .patchValue(false);

    //                     this.formCreditLimits
    //                         .at(idx)
    //                         .get('invoiceGroup')
    //                         .patchValue(row.id);

    //                     this.formCreditLimits.at(idx).get('creditLimit').reset();

    //                     this.formCreditLimits.at(idx).get('termOfPayment').reset();

    //                     this.formCreditLimits.at(idx).get('creditLimitGroup').reset();
    //                 }
    //             }
    //         }
    //     }
    // }

    private restoreFormData(data: SupplierStore): void {
        this.currentStoreId = `Current Store ID: ${data['outerStore']['externalId']}`;

        this.form.get('supplierId').disable();

        this.form.get('profileInfo.phoneNumber').disable();

        this.form.get('storeInfo.status').disable();

        this.form.patchValue({
            // supplierId: data['supplierId'],
            storeId: data.store.id,
            // Informasi Pemilik Toko
            profileInfo: {
                // Informasi pemilik toko akan di-load setelah isi nomor telepon dan hanya read-only.
                phoneNumber: data.store.legalInfo.mobilePhoneNo,
                name: data.store.legalInfo.fullName,
                email: data.store.legalInfo.email,
                taxId: data.store.legalInfo.taxNo,
                identityId: data.store.legalInfo.idNo,
                taxPhoto: data.store.legalInfo.taxImageUrl,
                oldTaxPhoto: data.store.legalInfo.taxImageUrl,
                identityPhoto: data.store.legalInfo.idImageUrl,
                oldIdentityPhoto: data.store.legalInfo.idImageUrl,
                identityPhotoSelfie: data.store.legalInfo.selfieImageUrl,
                oldIdentityPhotoSelfie: data.store.legalInfo.selfieImageUrl,
            },
            // Informasi Toko
            storeInfo: {
                approvalStatus: data['outerStore']['approvalStatus'],
                storeId: {
                    // id: data['outerStore']['externalId'],
                    storeName: data['outerStore']['name'],
                },
                taxId: data['outerStore']['taxNo'],
                phoneNumber: data['outerStore']['phoneNo'],
                taxPhoto: data['outerStore']['taxImageUrl'],
                oldTaxPhoto: data['outerStore']['taxImageUrl'],
                photo: data['outerStore']['imageUrl'],
                oldPhoto: data['outerStore']['imageUrl'],
                status: data['outerStore']['status'],
                address: {
                    district: data['outerStore']['urban']['district'],
                    urban: data['outerStore']['urban']['urban'],
                    postcode: data['outerStore']['urban']['zipCode'],
                    address: data['outerStore']['address'],
                    notes: data['outerStore']['noteAddress'],
                    geolocation: {
                        lng: data['outerStore']['longitude'],
                        lat: data['outerStore']['latitude'],
                    },
                    warehouse: data['outerStore']['warehouseId']
                },
                physicalStoreInfo: {
                    numberOfEmployee: data['outerStore']['numberOfEmployee'],
                    vehicleAccessibility: data['outerStore']['vehicleAccessibilityId'],
                },
                storeClassification: {
                    storeType: data['outerStore']['storeType']['typeId'],
                    storeGroup: data['outerStore']['storeGroup']['groupId'],
                    storeChannel: data['outerStore']['storeChannel']['channelId'],
                    storeCluster: data['outerStore']['storeCluster']['clusterId'],
                },
                payment: {
                    creditLimit: [],
                }

            }
        });

        if (data['store']['creditLimitStores'] && data['store']['creditLimitStores'].length > 0) {
            const creditLimitStores = data['store']['creditLimitStores'] as Array<any>;
            const availableCreditLimitStores: Array<any> = this.formCreditLimits.getRawValue();

            for (const [idx, row] of creditLimitStores.entries()) {
                if (typeof row.allowCreditLimit === 'boolean') {
                    const foundIdx = availableCreditLimitStores.findIndex(cl => cl.invoiceGroup === row.invoiceGroupId);

                    if (foundIdx >= 0) {
                        this.tempInvoiceGroupName[foundIdx] = !row.invoiceGroup ? '-' : row.invoiceGroup.name;

                        const allowCreditLimit = !!row.allowCreditLimit;

                        this.formCreditLimits.get(String(foundIdx)).patchValue({
                            allowCreditLimit,
                            id: row.id,
                            creditLimitStoreId: row.id,
                            invoiceGroup: row.invoiceGroupId,
                            creditLimit: '',
                            creditLimitGroup: allowCreditLimit ? row.creditLimitGroupId : '',
                            termOfPayment: allowCreditLimit ? row.termOfPayment : '',
                        });

                        if (allowCreditLimit) {
                            this.formCreditLimits.get([String(foundIdx), 'termOfPayment']).setValidators([
                                RxwebValidators.digit({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'numeric'
                                    ),
                                }),
                            ]);

                            this.handleAllowCreditPatch(foundIdx, row);
                        } else {
                            this.formCreditLimits.get([String(foundIdx), 'creditLimit']).disable();
                            this.formCreditLimits.get([String(foundIdx), 'creditLimitGroup']).disable();
                            this.formCreditLimits.get([String(foundIdx), 'termOfPayment']).disable();

                            this.handleNotAllowCreditPatch(foundIdx);
                        }
                    }
                }
            }
        }

        this.requestWarehouse(+data['outerStore']['urbanId'] || null, false);
        this.form.markAllAsTouched();
        this.form.updateValueAndValidity();
    }

    private createFormListener(): void {
        (this.form.statusChanges as Observable<FormStatus>)
        .pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(status => HelperService.debug('PERIOD TARGET PROMO FORM STATUS CHANGED', status)),
            takeUntil(this._unSubs$)
        ).subscribe();

        (this.form.valueChanges)
        .pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(value => HelperService.debug('PERIOD TARGET PROMO FORM VALUE CHANGED', { form: this.form, value })),
            takeUntil(this._unSubs$)
        ).subscribe();
    }

    private resetTemporaryPhotoForms(): void {
        this.tmpOwnerTaxPhoto.reset();
        this.tmpIdentityPhoto.reset();
        this.tmpIdentityPhotoSelfie.reset();
        this.tmpStoreTaxPhoto.reset();
        this.tmpStorePhoto.reset();
    }

    private resetStoreInformationForm(): void {
        this.form.get('storeId').reset();
        this.form.get('profileInfo.name').reset();
        this.form.get('profileInfo.taxId').reset();
        this.form.get('profileInfo.identityId').reset();
        this.form.get('profileInfo.taxPhoto').reset();
        this.form.get('profileInfo.identityPhoto').reset();
        this.form.get('profileInfo.identityPhotoSelfie').reset();

        this.tmpOwnerTaxPhoto.reset();
        this.tmpIdentityPhoto.reset();
        this.tmpIdentityPhotoSelfie.reset();
    }

    private enableStoreInformationForm(): void {
        this.form.get('profileInfo.name').enable();
        this.form.get('profileInfo.taxId').enable();
        this.form.get('profileInfo.identityId').enable();
        this.form.get('profileInfo.taxPhoto').enable();
        this.form.get('profileInfo.identityPhoto').enable();
        this.form.get('profileInfo.identityPhotoSelfie').enable();
    }

    private disableStoreInformationForm(): void {
        this.form.get('profileInfo.name').disable();
        this.form.get('profileInfo.taxId').disable();
        this.form.get('profileInfo.identityId').disable();
        this.form.get('profileInfo.taxPhoto').disable();
        this.form.get('profileInfo.identityPhoto').disable();
        this.form.get('profileInfo.identityPhotoSelfie').disable();
    }

    private loadStoreInformationForm(value: ICheckOwnerPhoneResponse): void {
        this.form.get('storeId').patchValue(value.storeId);
        this.form.get('profileInfo.name').patchValue(value.user.userName);
        this.form.get('profileInfo.taxId').patchValue(value.user.taxNumber);
        this.form.get('profileInfo.identityId').patchValue(value.user.idNumber);
        // this.form.get('profileInfo.taxPhoto').patchValue(value.user);
        this.form.get('profileInfo.identityPhoto').patchValue(value.user.idNumberPicture);
        this.form.get('profileInfo.identityPhotoSelfie').patchValue(value.user.selfiePicture);

        this.form.updateValueAndValidity();
        this.cdRef.detectChanges();
    }

    private onSubmit(id?: string): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();

        if (body.supplierId) {
            const newCreditLimit =
                body.storeInfo.payment.creditLimit &&
                body.storeInfo.payment.creditLimit.length > 0
                    ? body.storeInfo.payment.creditLimit.map((row) => {
                        const CL = {
                            allowCreditLimit: row.allowCreditLimit,
                            invoiceGroupId: row.invoiceGroup,
                            creditLimitGroupId: row.creditLimitGroup,
                            creditLimit: row.creditLimit,
                            termOfPayment: row.termOfPayment,
                        };

                        if (this.pageType === 'edit') {
                            CL['id'] = row.creditLimitStoreId;
                        }

                        return CL;
                    }) : [];

            const urban = body.storeInfo.address.urban as Urban;

            const payload = {
                // Untuk override endpoint bahwa add store ini hit-nya ke /supplier-stores.
                supplierStore: true,
                storeId: body.storeId,
                name: body.storeInfo.storeId.storeName,
                externalId: body.storeInfo.storeId.id,
                taxNo: body.storeInfo.taxId,
                address: body.storeInfo.address.address,
                noteAddress: body.storeInfo.address.notes,
                longitude: body.storeInfo.address.geolocation.lng,
                latitude: body.storeInfo.address.geolocation.lat,
                phoneNo: body.storeInfo.phoneNumber,
                image: body.storeInfo.photo,
                numberOfEmployee: body.storeInfo.physicalStoreInfo.numberOfEmployee,
                status: body.storeInfo.status || 'active',
                vehicleAccessibilityId: body.storeInfo.physicalStoreInfo.vehicleAccessibility,
                approvalStatus: body.storeInfo.approvalStatus ? body.storeInfo.approvalStatus : 'guest',
                urbanId: urban.id,
                user: {
                    idNo: body.profileInfo.identityId || '',
                    fullName: body.profileInfo.name,
                    taxNo: body.profileInfo.taxId || '',
                    // idImage: body.profileInfo.identityPhoto,
                    // selfieImage: body.profileInfo.identityPhotoSelfie,
                    phone: body.profileInfo.phoneNumber,
                    status: 'active',
                    roles: [1],
                },
                warehouseId: this.availableWarehouses.length === 1 ? null : body.storeInfo.address.warehouse,
                type: {
                    typeId: body.storeInfo.storeClassification.storeType,
                },
                group: {
                    groupId: body.storeInfo.storeClassification.storeGroup,
                },
                channel: {
                    channelId: body.storeInfo.storeClassification.storeChannel,
                },
                cluster: {
                    clusterId: body.storeInfo.storeClassification.storeCluster,
                },
                supplier: {
                    supplierId: body.supplierId,
                },
                creditLimit: newCreditLimit,
            };

            // Hapus payload user jika nomor telepon sudah dimiliki user tertentu.
            // Ketika mode edit, payload user tidak usah dikirim.
            if (body.storeId || this.pageType === 'edit') {
                delete payload.user;
            }

            if (this.storeIdType.value === 'auto' || !payload.externalId) {
                delete payload.externalId;
            }

            if (!body.storeInfo.address.geolocation.lng) {
                delete payload.longitude;
            }

            if (!body.storeInfo.address.geolocation.lat) {
                delete payload.latitude;
            }

            if (!body.storeInfo.physicalStoreInfo.numberOfEmployee) {
                delete payload.numberOfEmployee;
            }

            if (!body.storeInfo.physicalStoreInfo.vehicleAccessibility) {
                delete payload.vehicleAccessibilityId;
            }

            // if (!body.storeInfo.storeClassification.storeType) {
            //     delete payload.storeTypeId;
            // }

            // if (!body.storeInfo.storeClassification.storeGroup) {
            //     delete payload.storeGroupId;
            // }

            if (!body.storeInfo.storeClassification.storeType) {
                delete payload.type;
            }

            if (!body.storeInfo.storeClassification.storeGroup) {
                delete payload.group;
            }

            if (!body.storeInfo.storeClassification.storeChannel) {
                delete payload.channel;
            }

            if (!body.storeInfo.storeClassification.storeCluster) {
                delete payload.cluster;
            }

            // if (!body.storeInfo.storeClassification.storeCluster) {
            //     delete payload.cluster;
            // }

            // if (!body.storeInfo.storeClassification.storeSegment) {
            //     delete payload.storeSegmentId;
            // }

            // if (!body.storeInfo.storeClassification.hierarchy) {
            //     delete payload.hierarchy;
            // }

            for (const [idx, row] of payload.creditLimit.entries()) {
                // Jika allow credit-nya true, tapi nilai credit limit-nya tidak valid.
                if (!row.creditLimit) {
                    payload.creditLimit[idx].creditLimit = 0;
                }

                // Term of payment akan diatur nilainya menjadi nol jika nilainya dianggap tidak valid.
                if (!row.termOfPayment) {
                    payload.creditLimit[idx].termOfPayment = 0;
                }

                if (!row.creditLimitGroupId) {
                    payload.creditLimit[idx].creditLimitGroupId = null;
                }
            }

            // Untuk dikirim ke service dan akan di-upload fotonya.
            const uploadPhotos: Array<UploadPhotoApiPayload> = [];

            if (body.profileInfo.taxPhoto !== body.profileInfo.oldTaxPhoto
                && !String(body.profileInfo.taxPhoto).startsWith('http')
            ) {
                this.uploadOwnerTaxPhoto$.next('pending');
                uploadPhotos.push({
                    image: body.profileInfo.taxPhoto,
                    type: 'userTax',
                    oldLink: body.profileInfo.oldTaxPhoto
                });
            }

            // Hanya upload foto jika user memasukkan foto baru.
            if (body.profileInfo.identityPhoto !== body.profileInfo.oldIdentityPhoto
                && !String(body.profileInfo.identityPhoto).startsWith('http')
            ) {
                this.uploadIdentityPhoto$.next('pending');
                uploadPhotos.push({
                    image: body.profileInfo.identityPhoto,
                    type: 'idCard',
                    oldLink: body.profileInfo.oldIdentityPhoto
                });
            }

            if (body.profileInfo.identityPhotoSelfie !== body.profileInfo.oldIdentityPhotoSelfie
                && !String(body.profileInfo.identityPhotoSelfie).startsWith('http')
            ) {
                this.uploadIdentityPhotoSelfie$.next('pending');
                uploadPhotos.push({
                    image: body.profileInfo.identityPhotoSelfie,
                    type: 'selfie',
                    oldLink: body.profileInfo.oldIdentityPhotoSelfie
                });
            }

            if (body.storeInfo.taxPhoto !== body.storeInfo.oldTaxPhoto
                && !String(body.storeInfo.taxPhoto).startsWith('http')
            ) {
                this.uploadStoreTaxPhoto$.next('pending');
                uploadPhotos.push({
                    image: body.storeInfo.taxPhoto,
                    type: 'storeTax',
                    oldLink: body.storeInfo.oldTaxPhoto
                });
            }

            if (body.storeInfo.photo !== body.storeInfo.oldPhoto
                && !String(body.storeInfo.photo).startsWith('http')
            ) {
                this.uploadStorePhoto$.next('pending');
                uploadPhotos.push({
                    image: body.storeInfo.photo,
                    type: 'storePhoto',
                    oldLink: body.storeInfo.oldPhoto
                });
            }

            if (uploadPhotos.length === 0) {
                if (!id) {
                    this.store.dispatch(StoreActions.createStoreRequest({ payload }));
                } else {
                    this.store.dispatch(StoreActions.updateStoreRequest({ payload: { body: payload, id } }));
                }
            } else {
                // Menyimpan jumlah foto yang ter-upload.
                // tslint:disable-next-line: no-inferrable-types
                // const uploadedPhotos: Array<{ type: TUploadPhotoType, url: string }> = [];

                this.showPhotoUploadProgress();

                of<UploadPhotoApiPayload>(...uploadPhotos).pipe(
                    concatMap((photoPayload: UploadPhotoApiPayload) => {
                        // Set upload state-nya.
                        this.setUploatState(photoPayload.type, 'uploading');

                        return this._$photo
                            .upload(photoPayload.image, photoPayload.type, photoPayload.oldLink)
                            .pipe(
                                tap(response => {
                                    this.setUploatState(photoPayload.type, 'success');

                                    switch (photoPayload.type) {
                                        case 'idCard': {
                                            payload.user['idImageUrl'] = response.url;
                                            break;
                                        }
                                        case 'selfie': {
                                            payload.user['selfieImageUrl'] = response.url;
                                            break;
                                        }
                                        case 'userTax': {
                                            payload.user['taxImageUrl'] = response.url;
                                            break;
                                        }
                                        case 'storePhoto': {
                                            payload['imageUrl'] = response.url;
                                            break;
                                        }
                                        case 'storeTax': {
                                            payload['taxImageUrl'] = response.url;
                                            break;
                                        }
                                    }

                                    // uploadedPhotos.push({
                                    //     type: photoPayload.type,
                                    //     url: response.url
                                    // });
                                }),
                                catchError(err => {
                                    // Ubah state type tersebut menjadi failed.
                                    this.setUploatState(photoPayload.type, 'failed');

                                    // Memunculkan notifikasi error.
                                    this._$helper.showErrorNotification({
                                        id: `ERR_UPLOAD_${String(photoPayload.type).toUpperCase()}_FAILED`,
                                        errors: err,
                                    });

                                    // Mengembalikan nilai error-nya.
                                    return throwError(err);
                                })
                            );
                    })
                ).subscribe({
                    next: value => {
                        HelperService.debug('[STORE FORM] UPLOAD PHOTO SEQUENTIAL SUCCESS', value);
                    },
                    error: err => {
                        HelperService.debug('[STORE FORM] UPLOAD PHOTO SEQUENTIAL ERROR', err);
                        // Reset tombol "Save" form-nya.
                        this.store.dispatch(FormActions.resetClickSaveButton());
                        // Menunjukkan tombol close dialog.
                        this.dialogUploadPhotoProgress.showCloseButton();
                        // Menutup otomatis dialog-nya.
                        setTimeout(() => {
                            if (this.dialogUploadPhotoProgress) {
                                this.dialogUploadPhotoProgress.close();
                            }
                        }, 10000);
                    },
                    complete: () => {
                        HelperService.debug('[STORE FORM] UPLOAD PHOTO SEQUENTIAL COMPLETE');

                        setTimeout(() => {
                            if (this.dialogUploadPhotoProgress) {
                                this.dialogUploadPhotoProgress.close();
                            }

                            if (!id) {
                                this.store.dispatch(StoreActions.createStoreRequest({ payload }));
                            } else {
                                this.store.dispatch(StoreActions.updateStoreRequest({ payload: { body: payload, id } }));
                            }
                        }, 3000);
                    }
                });
            }
        }
    }

    private showPhotoUploadProgress(): void {
        this.dialogUploadPhotoProgress = this.applyDialogFactory$.open(
            {
                title: 'Upload Photo(s)',
                template: this.uploadPhotos,
                isApplyEnabled: false,
                showApplyButton: false,
                showCloseButton: false
            },
            {
                disableClose: true,
                width: '40vw',
                height: '512px',
                minWidth: '40vw',
                maxWidth: '40vw',
            }
        );
    }

    private setUploatState(type: TUploadPhotoType, state: string): void {
        switch (type) {
            case 'idCard': {
                this.uploadIdentityPhoto$.next(state);
                break;
            }
            case 'selfie': {
                this.uploadIdentityPhotoSelfie$.next(state);
                break;
            }
            case 'userTax': {
                this.uploadOwnerTaxPhoto$.next(state);
                break;
            }
            case 'storePhoto': {
                this.uploadStorePhoto$.next(state);
                break;
            }
            case 'storeTax': {
                this.uploadStoreTaxPhoto$.next(state);
                break;
            }
        }
    }

    private addressValid(): boolean {
        return (
            this.form.get('storeInfo.address.district').valid &&
            this.form.get('storeInfo.address.urban').valid &&
            this.form.get('storeInfo.address.postcode').value &&
            this.form.get('storeInfo.address').valid
        );

        // return (
        //     // this.form.get('storeInfo.address.province').value &&
        //     // this.form.get('storeInfo.address.city').value &&
        //     // this.form.get('storeInfo.address.district').value &&
        //     // this.form.get('storeInfo.address.urban').value &&
        //     // this.form.get('storeInfo.address.postcode').value &&
        //     // this.form.get('storeInfo.address').valid
        // );
    }

    /* private populateCity(
        provinceId: string,
        currentCity?: string,
        currentDistrict?: string,
        currentUrban?: string,
        currentPostcode?: string
    ): void {
        this.cities$ = this.store
            .select(DropdownSelectors.getCityDropdownState, {
                provinceId: provinceId
            })
            .pipe(
                tap(hasCity => {
                    if (hasCity && hasCity.length > 0) {
                        this.form.get('storeInfo.address.city').enable();

                        if (currentCity) {
                            this.form.get('storeInfo.address.city').patchValue(currentCity);

                            this.populateDistrict(
                                provinceId,
                                currentCity,
                                currentDistrict,
                                currentUrban,
                                currentPostcode
                            );
                        }
                    }
                })
            );
    } */

    /* private populateDistrict(
        provinceId: string,
        city: string,
        currentDistrict?: string,
        currentUrban?: string,
        currentPostcode?: string
    ): void {
        this.districts$ = this.store
            .select(DropdownSelectors.getDistrictDropdownState, {
                provinceId: provinceId,
                city: city
            })
            .pipe(
                tap(hasDistrict => {
                    if (hasDistrict && hasDistrict.length > 0) {
                        this.form.get('storeInfo.address.district').enable();

                        if (currentDistrict) {
                            this.form.get('storeInfo.address.district').patchValue(currentDistrict);

                            this.populateUrban(
                                provinceId,
                                city,
                                currentDistrict,
                                currentUrban,
                                currentPostcode
                            );
                        }
                    }
                })
            );
    } */

    /* private populateUrban(
        provinceId: string,
        city: string,
        district: string,
        currentUrban?: string,
        currentPostcode?: string
    ): void {
        this.urbans$ = this.store
            .select(DropdownSelectors.getUrbanDropdownState, {
                provinceId: provinceId,
                city: city,
                district: district
            })
            .pipe(
                tap(hasUrban => {
                    if (hasUrban && hasUrban.length > 0) {
                        this.form.get('storeInfo.address.urban').enable();

                        if (currentUrban) {
                            this.form.get('storeInfo.address.urban').patchValue(currentUrban);

                            this.populatePostcode(
                                provinceId,
                                city,
                                district,
                                currentUrban,
                                currentPostcode
                            );
                        }
                    }
                })
            );
    } */

    /* private populatePostcode(
        provinceId: string,
        city: string,
        district: string,
        urbanId: string,
        currentPostcode?: string
    ): void {
        this.store
            .select(DropdownSelectors.getPostcodeDropdownState, {
                provinceId: provinceId,
                city: city,
                district: district,
                urbanId: urbanId
            })
            .pipe(takeUntil(this._unSubs$))
            .subscribe(postcode => {
                if (currentPostcode) {
                    this.form.get('storeInfo.address.postcode').patchValue(currentPostcode);
                } else if (postcode) {
                    this.form.get('storeInfo.address.postcode').patchValue(postcode);
                }
            });
    } */
}

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange, MatSlideToggleChange } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { CreditLimitGroup } from 'app/main/pages/finances/credit-limit-balance/models';
import { ErrorMessageService, HelperService, LogService } from 'app/shared/helpers';
import {
    Cluster,
    Hierarchy,
    Province,
    StoreGroup,
    StoreSegment,
    StoreType,
    Urban,
    VehicleAccessibility
} from 'app/shared/models';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { Store as Merchant } from '../models';
import { StoreActions } from '../store/actions';
import { fromMerchant } from '../store/reducers';
import { StoreSelectors } from '../store/selectors';

@Component({
    selector: 'app-merchant-form',
    templateUrl: './merchant-form.component.html',
    styleUrls: ['./merchant-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    tmpPhoto: FormControl;
    tmpIdentityPhoto: FormControl;
    tmpIdentityPhotoSelfie: FormControl;
    pageType: string;
    numberOfEmployees: { id: string; label: string }[];
    tempInvoiceGroupName: Array<string>;
    tempCreditLimitAmount: Array<boolean>;
    tempTermOfPayment: Array<boolean>;

    stores$: Observable<Merchant>;
    provinces$: Observable<Province[]>;
    cities$: Observable<Urban[]>;
    districts$: Observable<Urban[]>;
    urbans$: Observable<Urban[]>;
    postcode$: Observable<string>;
    storeClusters$: Observable<Cluster[]>;
    storeGroups$: Observable<StoreGroup[]>;
    storeSegments$: Observable<StoreSegment[]>;
    storeTypes$: Observable<StoreType[]>;
    hierarchies$: Observable<Hierarchy[]>;
    vehicleAccessibilities$: Observable<VehicleAccessibility[]>;
    creditLimitGroups$: Observable<CreditLimitGroup[]>;

    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    @ViewChild('cdkProvince', { static: false }) cdkProvince: CdkVirtualScrollViewport;
    @ViewChild('cdkCity', { static: false }) cdkCity: CdkVirtualScrollViewport;
    @ViewChild('cdkDistrict', { static: false }) cdkDistrict: CdkVirtualScrollViewport;
    @ViewChild('cdkUrban', { static: false }) cdkUrban: CdkVirtualScrollViewport;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$helper: HelperService,
        private _$log: LogService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set footer action
        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor tambah toko',
                            active: true
                        },
                        value: {
                            active: true
                        },
                        active: false
                    },
                    action: {
                        save: {
                            label: 'Simpan',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Batal',
                            active: true
                        },
                        goBack: {
                            label: 'Kembali',
                            active: true,
                            url: '/pages/account/stores'
                        }
                    }
                }
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
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Account',
                            translate: 'BREADCRUMBS.ACCOUNT'
                        },
                        {
                            title: 'Add Store',
                            translate: 'BREADCRUMBS.ADD_STORE',
                            active: true
                        }
                    ]
                })
            );

            this.pageType = 'new';
        } else {
            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Account',
                            translate: 'BREADCRUMBS.ACCOUNT'
                        },
                        {
                            title: 'Edit Store',
                            translate: 'BREADCRUMBS.EDIT_STORE',
                            active: true
                        }
                    ]
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

        this._unSubs$ = new Subject<void>();
        this.tempInvoiceGroupName = ['-'];
        this.tempCreditLimitAmount = [false];
        this.tempTermOfPayment = [false];

        if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            this.stores$ = this.store.select(StoreSelectors.getStoreEdit);
            this.store.dispatch(StoreActions.fetchStoreEditRequest({ payload: id }));
        }

        this.initForm();

        // Get selector dropdown province
        this.provinces$ = this.store.select(DropdownSelectors.getProvinceDropdownState);
        // Fetch request province
        this.store.dispatch(DropdownActions.fetchDropdownProvinceRequest());

        // Get selector dropdown store type
        this.storeTypes$ = this.store.select(DropdownSelectors.getStoreTypeDropdownState);
        // Fetch request store stype
        this.store.dispatch(DropdownActions.fetchDropdownStoreTypeRequest());

        // Get selector dropdown store group
        this.storeGroups$ = this.store.select(DropdownSelectors.getStoreGroupDropdownState);
        // Fetch request store group
        this.store.dispatch(DropdownActions.fetchDropdownStoreGroupRequest());

        // Get selector dropdown store cluster
        this.storeClusters$ = this.store.select(DropdownSelectors.getStoreClusterDropdownState);
        // Fetch request store cluster
        this.store.dispatch(DropdownActions.fetchDropdownStoreClusterRequest());

        // Get selector dropdown store segment
        this.storeSegments$ = this.store.select(DropdownSelectors.getStoreSegmentDropdownState);
        // Fetch request store segment
        this.store.dispatch(DropdownActions.fetchDropdownStoreSegmentRequest());

        // Get selector dropdown hierarcy
        this.hierarchies$ = this.store.select(DropdownSelectors.getHierarchyDropdownState);
        // Fetch request hierarchy
        this.store.dispatch(DropdownActions.fetchDropdownHierarchyRequest());

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

        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);

        // Get data number of employee (local)
        this.numberOfEmployees = this._$helper.numberOfEmployee();

        this.store.dispatch(FormActions.resetFormStatus());

        // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
        this.form.statusChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(status => {
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
                filter(isClick => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe(isClick => {
                if (isClick) {
                    this.form.reset();
                    this.tmpPhoto.reset();
                    this.store.dispatch(FormActions.resetClickResetButton());
                }
            });

        // Handle save button action (footer)
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe(isClick => {
                if (isClick) {
                    this.onSubmit();
                }
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

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

        this.tempInvoiceGroupName = ['-'];
        this.tempCreditLimitAmount = [false];
        this.tempTermOfPayment = [false];

        this._unSubs$.next();
        this._unSubs$.complete();
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

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            if (file) {
                switch (type) {
                    case 'photo':
                        {
                            const photoField = this.form.get('profileInfo.photos');

                            const fileReader = new FileReader();
                            fileReader.onload = () => {
                                photoField.patchValue(fileReader.result);
                                this.tmpPhoto.patchValue(file.name);
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    case 'identityPhoto':
                        {
                            const photoField = this.form.get('storeInfo.legalInfo.identityPhoto');

                            const fileReader = new FileReader();
                            fileReader.onload = () => {
                                photoField.patchValue(fileReader.result);
                                this.tmpIdentityPhoto.patchValue(file.name);
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    case 'identityPhotoSelfie':
                        {
                            const photoField = this.form.get(
                                'storeInfo.legalInfo.identityPhotoSelfie'
                            );

                            const fileReader = new FileReader();
                            fileReader.onload = () => {
                                photoField.patchValue(fileReader.result);
                                this.tmpIdentityPhotoSelfie.patchValue(file.name);
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

    onSelectCreditLimitGroup(ev: MatSelectChange, idx: number): void {
        if (!ev.value || typeof idx !== 'number') {
            return;
        }

        this.store
            .select(DropdownSelectors.getCreditLimitGroupState, { id: ev.value })
            .pipe(takeUntil(this._unSubs$))
            .subscribe(resp => {
                if (resp) {
                    // Handle credit limit amount
                    if (resp.defaultCreditLimit) {
                        this.formCreditLimits
                            .at(idx)
                            .get('creditLimit')
                            .patchValue(resp.defaultCreditLimit.replace('.', ','));
                    }

                    this.tempCreditLimitAmount[idx] = false;

                    this.formCreditLimits
                        .at(idx)
                        .get('creditLimit')
                        .disable();

                    // Handle term of payment
                    if (resp.termOfPayment) {
                        this.formCreditLimits
                            .at(idx)
                            .get('termOfPayment')
                            .patchValue(resp.termOfPayment);
                    }

                    this.tempTermOfPayment[idx] = false;

                    this.formCreditLimits
                        .at(idx)
                        .get('termOfPayment')
                        .disable();
                }
            });
    }

    onSelectProvince(ev: MatSelectChange): void {
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
    }

    onSelectCity(ev: MatSelectChange): void {
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
    }

    onSelectDistrict(ev: MatSelectChange): void {
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
    }

    onSelectUrban(ev: MatSelectChange): void {
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private createCreditLimitForm(): FormGroup {
        return this.formBuilder.group({
            allowCreditLimit: false,
            invoiceGroup: [{ value: '', disabled: true }],
            creditLimitGroup: [{ value: '', disabled: true }],
            creditLimit: [
                { value: '', disabled: true },
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            termOfPayment: [
                { value: '', disabled: true },
                [
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric')
                    })
                ]
            ]
        });
    }

    private handleAllowCredit(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        this.tempCreditLimitAmount[idx] = true;
        this.tempTermOfPayment[idx] = true;

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .enable();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                })
            ]);

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .updateValueAndValidity();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .enable();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                }),
                RxwebValidators.digit({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                })
            ]);

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .updateValueAndValidity();

        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .enable();
    }

    private handleNotAllowCredit(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        this.tempCreditLimitAmount[idx] = false;
        this.tempTermOfPayment[idx] = false;

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .disable();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .clearValidators();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .updateValueAndValidity();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .disable();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .clearValidators();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .updateValueAndValidity();

        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .disable();
    }

    private handleAllowCreditPatch(idx: number, item: any): void {
        if (typeof idx !== 'number') {
            return;
        }

        this.tempCreditLimitAmount[idx] = item.creditLimitGroupId ? false : true;
        this.tempTermOfPayment[idx] = item.creditLimitGroupId ? false : true;

        // Handle allowCreditLimit Field
        this.formCreditLimits
            .at(idx)
            .get('allowCreditLimit')
            .patchValue(true);

        if (this.formCreditLimits.at(idx).get('allowCreditLimit').invalid) {
            this.formCreditLimits
                .at(idx)
                .get('allowCreditLimit')
                .markAsTouched();
        }

        // Handle creditLimit Field
        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .enable();

        if (item.creditLimitGroupId) {
            this.formCreditLimits
                .at(idx)
                .get('creditLimit')
                .setValidators([
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]);
        } else {
            this.formCreditLimits
                .at(idx)
                .get('creditLimit')
                .setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]);
        }

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .patchValue(item.creditLimit.replace('.', ','));

        if (this.formCreditLimits.at(idx).get('creditLimit').invalid) {
            this.formCreditLimits
                .at(idx)
                .get('creditLimit')
                .markAsTouched();
        }

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .updateValueAndValidity();

        // Handle termOfPayment Field
        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .enable();

        if (item.creditLimitGroupId) {
            this.formCreditLimits
                .at(idx)
                .get('termOfPayment')
                .setValidators([
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric')
                    })
                ]);
        } else {
            this.formCreditLimits
                .at(idx)
                .get('termOfPayment')
                .setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric')
                    })
                ]);
        }

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .patchValue(item.termOfPayment);

        if (this.formCreditLimits.at(idx).get('termOfPayment').invalid) {
            this.formCreditLimits
                .at(idx)
                .get('termOfPayment')
                .markAsTouched();
        }

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .updateValueAndValidity();

        // Handle creditLimitGroup Field
        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .enable();

        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .patchValue(item.creditLimitGroupId);
    }

    private handleNotAllowCreditPatch(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        this.tempCreditLimitAmount[idx] = false;
        this.tempTermOfPayment[idx] = false;

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .disable();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .clearValidators();

        this.formCreditLimits
            .at(idx)
            .get('creditLimit')
            .updateValueAndValidity();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .disable();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .clearValidators();

        this.formCreditLimits
            .at(idx)
            .get('termOfPayment')
            .updateValueAndValidity();

        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .reset();

        this.formCreditLimits
            .at(idx)
            .get('creditLimitGroup')
            .disable();
    }

    private initForm(): void {
        this.tmpPhoto = new FormControl({ value: '', disabled: true });
        this.tmpIdentityPhoto = new FormControl({ value: '', disabled: true });
        this.tmpIdentityPhotoSelfie = new FormControl({ value: '', disabled: true });

        if (this.pageType === 'new') {
            this.form = this.formBuilder.group({
                profileInfo: this.formBuilder.group({
                    // username: [
                    //     '',
                    //     [
                    //         RxwebValidators.required({
                    //             message: this._$errorMessage.getErrorMessageNonState(
                    //                 'username',
                    //                 'required'
                    //             )
                    //         })
                    //     ]
                    // ],
                    phoneNumber: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.pattern({
                                expression: {
                                    mobilePhone: /^08[0-9]{8,12}$/
                                },
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'mobile_phone_pattern',
                                    '08'
                                )
                            })
                        ]
                    ],
                    photos: [
                        ''
                        // [
                        //     RxwebValidators.required({
                        //         message: this._$errorMessage.getErrorMessageNonState(
                        //             'default',
                        //             'required'
                        //         )
                        //     })
                        // ]
                    ],
                    npwpId: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.minLength({
                                value: 15,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            }),
                            RxwebValidators.maxLength({
                                value: 15,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            })
                        ]
                    ]
                }),
                storeInfo: this.formBuilder.group({
                    storeId: this.formBuilder.group({
                        id: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        storeName: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ]
                    }),
                    address: this.formBuilder.group({
                        province: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        city: [
                            { value: '', disabled: true },
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        district: [
                            { value: '', disabled: true },
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        urban: [
                            { value: '', disabled: true },
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        postcode: [
                            { value: '', disabled: true },
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                }),
                                RxwebValidators.digit({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                }),
                                RxwebValidators.minLength({
                                    value: 5,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                }),
                                RxwebValidators.maxLength({
                                    value: 5,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                })
                            ]
                        ],
                        notes: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ]
                        // geolocation: this.formBuilder.group({
                        //     lng: [''],
                        //     lat: ['']
                        // })
                    }),
                    legalInfo: this.formBuilder.group({
                        name: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                }),
                                RxwebValidators.alpha({
                                    allowWhiteSpace: true,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                })
                            ]
                        ],
                        identityId: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                }),
                                RxwebValidators.digit({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                }),
                                RxwebValidators.minLength({
                                    value: 16,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                }),
                                RxwebValidators.maxLength({
                                    value: 16,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                })
                            ]
                        ],
                        identityPhoto: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        identityPhotoSelfie: [''],
                        npwpId: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                }),
                                RxwebValidators.minLength({
                                    value: 15,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                }),
                                RxwebValidators.maxLength({
                                    value: 15,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                })
                            ]
                        ]
                    }),
                    physicalStoreInfo: this.formBuilder.group({
                        numberOfEmployee: [''],
                        vehicleAccessibility: ['']
                    }),
                    storeClassification: this.formBuilder.group({
                        storeType: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        storeGroup: [
                            ''
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
                            ''
                            // [
                            //     RxwebValidators.required({
                            //         message: this._$errorMessage.getErrorMessageNonState(
                            //             'default',
                            //             'required'
                            //         )
                            //     })
                            // ]
                        ],
                        storeSegment: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        hierarchy: ['']
                    }),
                    payment: this.formBuilder.group({
                        creditLimit: this.formBuilder.array([this.createCreditLimitForm()])
                    })
                })
            });

            this.store
                .select(DropdownSelectors.getInvoiceGroupDropdownState)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(data => {
                    if (data && data.length > 0) {
                        for (const [idx, row] of data.entries()) {
                            if (row.id) {
                                this.tempInvoiceGroupName[idx] = row.name || '-';

                                if (idx > 0) {
                                    this.formCreditLimits.push(
                                        this.formBuilder.group({
                                            allowCreditLimit: false,
                                            invoiceGroup: row.id,
                                            creditLimitGroup: [
                                                {
                                                    value: '',
                                                    disabled: true
                                                }
                                            ],
                                            creditLimit: [
                                                {
                                                    value: '',
                                                    disabled: true
                                                }
                                            ],
                                            termOfPayment: [
                                                {
                                                    value: '',
                                                    disabled: true
                                                }
                                            ]
                                        })
                                    );
                                } else {
                                    this.formCreditLimits
                                        .at(idx)
                                        .get('allowCreditLimit')
                                        .reset();

                                    this.formCreditLimits
                                        .at(idx)
                                        .get('allowCreditLimit')
                                        .patchValue(false);

                                    this.formCreditLimits
                                        .at(idx)
                                        .get('invoiceGroup')
                                        .patchValue(row.id);

                                    this.formCreditLimits
                                        .at(idx)
                                        .get('creditLimit')
                                        .reset();

                                    this.formCreditLimits
                                        .at(idx)
                                        .get('termOfPayment')
                                        .reset();

                                    this.formCreditLimits
                                        .at(idx)
                                        .get('creditLimitGroup')
                                        .reset();
                                }
                            }
                        }
                    }
                });
        } else if (this.pageType === 'edit') {
            this.form = this.formBuilder.group({
                profileInfo: this.formBuilder.group({
                    // username: [
                    //     '',
                    //     [
                    //         RxwebValidators.required({
                    //             message: this._$errorMessage.getErrorMessageNonState(
                    //                 'username',
                    //                 'required'
                    //             )
                    //         })
                    //     ]
                    // ],
                    phoneNumber: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.pattern({
                                expression: {
                                    mobilePhone: /^08[0-9]{8,12}$/
                                },
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'mobile_phone_pattern',
                                    '08'
                                )
                            })
                        ]
                    ],
                    photos: [
                        ''
                        // [
                        //     RxwebValidators.required({
                        //         message: this._$errorMessage.getErrorMessageNonState(
                        //             'default',
                        //             'required'
                        //         )
                        //     })
                        // ]
                    ],
                    npwpId: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.minLength({
                                value: 15,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            }),
                            RxwebValidators.maxLength({
                                value: 15,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            })
                        ]
                    ]
                }),
                storeInfo: this.formBuilder.group({
                    storeId: this.formBuilder.group({
                        id: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        storeName: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ]
                    }),
                    address: this.formBuilder.group({
                        province: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        city: [
                            { value: '', disabled: true },
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        district: [
                            { value: '', disabled: true },
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        urban: [
                            { value: '', disabled: true },
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        postcode: [
                            { value: '', disabled: true },
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                }),
                                RxwebValidators.digit({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                }),
                                RxwebValidators.minLength({
                                    value: 5,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                }),
                                RxwebValidators.maxLength({
                                    value: 5,
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'pattern'
                                    )
                                })
                            ]
                        ],
                        notes: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ]
                    }),
                    physicalStoreInfo: this.formBuilder.group({
                        numberOfEmployee: [''],
                        vehicleAccessibility: ['']
                    }),
                    storeClassification: this.formBuilder.group({
                        storeType: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        storeGroup: [
                            ''
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
                            ''
                            // [
                            //     RxwebValidators.required({
                            //         message: this._$errorMessage.getErrorMessageNonState(
                            //             'default',
                            //             'required'
                            //         )
                            //     })
                            // ]
                        ],
                        storeSegment: [
                            '',
                            [
                                RxwebValidators.required({
                                    message: this._$errorMessage.getErrorMessageNonState(
                                        'default',
                                        'required'
                                    )
                                })
                            ]
                        ],
                        hierarchy: ['']
                    }),
                    payment: this.formBuilder.group({
                        creditLimit: this.formBuilder.array([this.createCreditLimitForm()])
                    })
                })
            });

            this.store
                .select(StoreSelectors.getStoreEdit)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(data => {
                    if (data) {
                        if (data.phoneNo) {
                            this.form.get('profileInfo.phoneNumber').patchValue(data.phoneNo);

                            if (this.form.get('profileInfo.phoneNumber').invalid) {
                                this.form.get('profileInfo.phoneNumber').markAsTouched();
                            }
                        }

                        if (data.imageUrl) {
                            this.form.get('profileInfo.photos').clearValidators();
                            this.form.get('profileInfo.photos').updateValueAndValidity();
                        }

                        if (data.taxNo) {
                            this.form.get('profileInfo.npwpId').patchValue(data.taxNo);

                            if (this.form.get('profileInfo.npwpId').invalid) {
                                this.form.get('profileInfo.npwpId').markAsTouched();
                            }
                        }

                        if (data.externalId) {
                            this.form.get('storeInfo.storeId.id').patchValue(data.externalId);

                            if (this.form.get('storeInfo.storeId.id').invalid) {
                                this.form.get('storeInfo.storeId.id').markAsTouched();
                            }
                        }

                        if (data.name) {
                            this.form.get('storeInfo.storeId.storeName').patchValue(data.name);

                            if (this.form.get('storeInfo.storeId.storeName').invalid) {
                                this.form.get('storeInfo.storeId.storeName').markAsTouched();
                            }
                        }

                        if (data.urban) {
                            if (data.urban.province) {
                                const provinceId = data.urban.province.id;
                                const city = data.urban.city;
                                const district = data.urban.district;
                                const urbanId = data.urban.id;
                                const zipCode = data.urban.zipCode;

                                if (provinceId) {
                                    this.form
                                        .get('storeInfo.address.province')
                                        .patchValue(provinceId);

                                    this.store
                                        .select(DropdownSelectors.getProvinceDropdownState)
                                        .pipe(takeUntil(this._unSubs$))
                                        .subscribe(hasProvinces => {
                                            if (hasProvinces && hasProvinces.length > 0) {
                                                this.populateCity(
                                                    provinceId,
                                                    city,
                                                    district,
                                                    urbanId,
                                                    zipCode
                                                );
                                            }
                                        });
                                }
                            }
                        }

                        if (data.address) {
                            this.form.get('storeInfo.address.notes').patchValue(data.address);

                            if (this.form.get('storeInfo.address.notes').invalid) {
                                this.form.get('storeInfo.address.notes').markAsTouched();
                            }
                        }

                        // if (data.largeArea) {
                        //     this.form
                        //         .get('storeInfo.physicalStoreInfo.physicalStoreInfo')
                        //         .patchValue(data.largeArea);
                        // }

                        if (data.numberOfEmployee) {
                            this.form
                                .get('storeInfo.physicalStoreInfo.numberOfEmployee')
                                .patchValue(data.numberOfEmployee);
                        }

                        if (data.vehicleAccessibilityId) {
                            this.form
                                .get('storeInfo.physicalStoreInfo.vehicleAccessibility')
                                .patchValue(data.vehicleAccessibilityId);

                            if (
                                this.form.get('storeInfo.physicalStoreInfo.vehicleAccessibility')
                                    .invalid
                            ) {
                                this.form
                                    .get('storeInfo.physicalStoreInfo.vehicleAccessibility')
                                    .markAsTouched();
                            }
                        }

                        if (data.storeType && data.storeType.id) {
                            this.form
                                .get('storeInfo.storeClassification.storeType')
                                .patchValue(data.storeType.id);

                            if (this.form.get('storeInfo.storeClassification.storeType').invalid) {
                                this.form
                                    .get('storeInfo.storeClassification.storeType')
                                    .markAsTouched();
                            }
                        }

                        if (data.storeGroup && data.storeGroup.id) {
                            this.form
                                .get('storeInfo.storeClassification.storeGroup')
                                .patchValue(data.storeGroup.id);

                            if (this.form.get('storeInfo.storeClassification.storeGroup').invalid) {
                                this.form
                                    .get('storeInfo.storeClassification.storeGroup')
                                    .markAsTouched();
                            }
                        }

                        if (data.storeClusters && data.storeClusters.length > 0) {
                            this.form
                                .get('storeInfo.storeClassification.storeCluster')
                                .patchValue(data.storeClusters[0].cluster.id);

                            if (
                                this.form.get('storeInfo.storeClassification.storeCluster').invalid
                            ) {
                                this.form
                                    .get('storeInfo.storeClassification.storeCluster')
                                    .markAsTouched();
                            }
                        }

                        if (data.storeSegment && data.storeSegment.id) {
                            this.form
                                .get('storeInfo.storeClassification.storeSegment')
                                .patchValue(data.storeSegment.id);

                            if (
                                this.form.get('storeInfo.storeClassification.storeSegment').invalid
                            ) {
                                this.form
                                    .get('storeInfo.storeClassification.storeSegment')
                                    .markAsTouched();
                            }
                        }

                        if (data.hierarchy && data.hierarchy.id) {
                            this.form
                                .get('storeInfo.storeClassification.hierarchy')
                                .patchValue(data.hierarchy.id);

                            if (this.form.get('storeInfo.storeClassification.hierarchy').invalid) {
                                this.form
                                    .get('storeInfo.storeClassification.hierarchy')
                                    .markAsTouched();
                            }
                        }

                        if (data.creditLimitStores && data.creditLimitStores.length > 0) {
                            const creditLimitStores = data.creditLimitStores;

                            for (const [idx, row] of creditLimitStores.entries()) {
                                if (typeof row.allowCreditLimit === 'boolean') {
                                    this.tempInvoiceGroupName[idx] = row.invoiceGroup.name || '-';

                                    if (idx > 0) {
                                        if (row.allowCreditLimit) {
                                            this.formCreditLimits.push(
                                                this.formBuilder.group({
                                                    allowCreditLimit: true,
                                                    creditLimitStoreId: row.id,
                                                    invoiceGroup: row.invoiceGroupId,
                                                    creditLimitGroup: row.creditLimitGroupId,
                                                    creditLimit: [
                                                        row.creditLimit.replace('.', ','),
                                                        [
                                                            RxwebValidators.numeric({
                                                                acceptValue:
                                                                    NumericValueType.PositiveNumber,
                                                                allowDecimal: true,
                                                                message: this._$errorMessage.getErrorMessageNonState(
                                                                    'default',
                                                                    'pattern'
                                                                )
                                                            })
                                                        ]
                                                    ],
                                                    termOfPayment: [
                                                        row.termOfPayment,
                                                        [
                                                            RxwebValidators.digit({
                                                                message: this._$errorMessage.getErrorMessageNonState(
                                                                    'default',
                                                                    'numeric'
                                                                )
                                                            })
                                                        ]
                                                    ]
                                                })
                                            );

                                            this.handleAllowCreditPatch(idx, row);
                                        } else {
                                            this.formCreditLimits.push(
                                                this.formBuilder.group({
                                                    allowCreditLimit: false,
                                                    creditLimitStoreId: row.id,
                                                    invoiceGroup: row.invoiceGroupId,
                                                    creditLimitGroup: [
                                                        {
                                                            value: '',
                                                            disabled: true
                                                        }
                                                    ],
                                                    creditLimit: [
                                                        {
                                                            value: '',
                                                            disabled: true
                                                        }
                                                    ],
                                                    termOfPayment: [
                                                        {
                                                            value: '',
                                                            disabled: true
                                                        }
                                                    ]
                                                })
                                            );

                                            this.handleNotAllowCreditPatch(idx);
                                        }
                                    } else {
                                        (this.formCreditLimits.at(idx) as FormGroup).addControl(
                                            'creditLimitStoreId',
                                            this.formBuilder.control(row.id)
                                        );

                                        this.formCreditLimits
                                            .at(idx)
                                            .get('invoiceGroup')
                                            .patchValue(row.invoiceGroupId);

                                        if (row.allowCreditLimit) {
                                            this.handleAllowCreditPatch(idx, row);
                                        } else {
                                            this.handleNotAllowCreditPatch(idx);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
        }
    }

    private onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();

        if (this.pageType === 'new') {
            this.store
                .select(AuthSelectors.getUserSupplier)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(({ supplierId }) => {
                    if (supplierId) {
                        // const createUser = new FormUser(
                        //     body.storeInfo.legalInfo.name,
                        //     body.storeInfo.legalInfo.npwpId,
                        //     body.storeInfo.legalInfo.identityPhoto,
                        //     body.storeInfo.legalInfo.identityPhotoSelfie,
                        //     body.profileInfo.phoneNumber,
                        //     'active',
                        //     ['1']
                        // );
                        // const createCluser = new FormCluster(
                        //     body.storeInfo.storeClassification.storeCluster
                        // );
                        // const createBrand = new FormBrand(user.data.userBrands[0].brandId);
                        // const payload = new FormStore(
                        //     body.storeInfo.storeId.id,
                        //     body.storeInfo.storeId.storeName,
                        //     body.profileInfo.photos,
                        //     body.profileInfo.npwpId,
                        //     body.storeInfo.address.notes,
                        //     body.profileInfo.phoneNumber,
                        //     'active',
                        //     body.storeInfo.storeClassification.storeType,
                        //     body.storeInfo.storeClassification.storeGroup,
                        //     body.storeInfo.storeClassification.storeSegment,
                        //     body.storeInfo.address.urban,
                        //     createUser,
                        //     createCluser,
                        //     createBrand,
                        //     body.storeInfo.physicalStoreInfo.physicalStoreInfo,
                        //     body.storeInfo.physicalStoreInfo.numberOfEmployee,
                        //     body.storeInfo.physicalStoreInfo.vehicleAccessibility
                        // );

                        // console.log('SUBMIT CREATE 1', body);
                        // console.log('SUBMIT CREATE 2', payload);

                        const newCreditLimit =
                            body.storeInfo.payment.creditLimit &&
                            body.storeInfo.payment.creditLimit.length > 0
                                ? body.storeInfo.payment.creditLimit.map(row => {
                                      return {
                                          allowCreditLimit: row.allowCreditLimit,
                                          invoiceGroupId: row.invoiceGroup,
                                          creditLimitGroupId: row.creditLimitGroup,
                                          creditLimit: row.creditLimit,
                                          termOfPayment: row.termOfPayment
                                      };
                                  })
                                : [];

                        const payload = {
                            externalId: body.storeInfo.storeId.id,
                            name: body.storeInfo.storeId.storeName,
                            image: body.profileInfo.photos,
                            taxNo: body.profileInfo.npwpId,
                            address: body.storeInfo.address.notes,
                            phoneNo: body.profileInfo.phoneNumber,
                            numberOfEmployee: body.storeInfo.physicalStoreInfo.numberOfEmployee,
                            status: 'active',
                            storeTypeId: body.storeInfo.storeClassification.storeType,
                            storeGroupId: body.storeInfo.storeClassification.storeGroup,
                            storeSegmentId: body.storeInfo.storeClassification.storeSegment,
                            vehicleAccessibilityId:
                                body.storeInfo.physicalStoreInfo.vehicleAccessibility,
                            urbanId: body.storeInfo.address.urban,
                            user: {
                                idNo: body.storeInfo.legalInfo.identityId,
                                fullName: body.storeInfo.legalInfo.name,
                                taxNo: body.storeInfo.legalInfo.npwpId,
                                idImage: body.storeInfo.legalInfo.identityPhoto,
                                selfieImage: body.storeInfo.legalInfo.identityPhotoSelfie,
                                phone: body.profileInfo.phoneNumber,
                                status: 'active',
                                roles: [1]
                            },
                            cluster: {
                                clusterId: body.storeInfo.storeClassification.storeCluster
                            },
                            hierarchy: {
                                hierarchyId: body.storeInfo.storeClassification.hierarchy
                            },
                            supplier: {
                                supplierId: supplierId
                            },
                            creditLimit: newCreditLimit
                        };

                        if (!body.storeInfo.physicalStoreInfo.numberOfEmployee) {
                            delete payload.numberOfEmployee;
                        }

                        if (!body.storeInfo.physicalStoreInfo.vehicleAccessibility) {
                            delete payload.vehicleAccessibilityId;
                        }

                        if (!body.storeInfo.storeClassification.storeGroup) {
                            delete payload.storeGroupId;
                        }

                        if (!body.storeInfo.storeClassification.storeCluster) {
                            delete payload.cluster;
                        }

                        if (!body.storeInfo.storeClassification.hierarchy) {
                            delete payload.hierarchy;
                        }

                        if (payload.creditLimit && payload.creditLimit.length > 0) {
                            for (const [idx, row] of payload.creditLimit.entries()) {
                                const allowCredit = payload.creditLimit[idx].allowCreditLimit;

                                if (
                                    (typeof allowCredit === 'boolean' && !allowCredit) ||
                                    typeof allowCredit !== 'boolean'
                                ) {
                                    // delete payload.creditLimit[idx].creditLimitGroupId;
                                    // delete payload.creditLimit[idx].creditLimit;
                                    // delete payload.creditLimit[idx].termOfPayment;

                                    payload.creditLimit[idx].creditLimitGroupId = null;
                                    payload.creditLimit[idx].creditLimit = 0;
                                    payload.creditLimit[idx].termOfPayment = 0;
                                }
                            }
                        }

                        this.store.dispatch(StoreActions.createStoreRequest({ payload }));
                    }
                });
        }

        if (this.pageType === 'edit') {
            /* this.store
                .select(BrandStoreSelectors.getEditBrandStore)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(data => {
                    if (data) {

                    } else {

                    }
                }); */

            const { id } = this.route.snapshot.params;

            // const createCluser = new FormCluster(body.storeInfo.storeClassification.storeCluster);

            // const payload = new FormStoreEdit(
            //     body.storeInfo.storeId.id,
            //     body.storeInfo.storeId.storeName,
            //     body.profileInfo.photos,
            //     body.profileInfo.npwpId,
            //     body.storeInfo.address.notes,
            //     body.profileInfo.phoneNumber,
            //     body.storeInfo.storeClassification.storeType,
            //     body.storeInfo.storeClassification.storeGroup,
            //     body.storeInfo.storeClassification.storeSegment,
            //     body.storeInfo.address.urban,
            //     createCluser,
            //     body.storeInfo.physicalStoreInfo.physicalStoreInfo,
            //     body.storeInfo.physicalStoreInfo.numberOfEmployee,
            //     body.storeInfo.physicalStoreInfo.vehicleAccessibility
            // );

            // console.log('SUBMIT UPDATE 1', body);
            // console.log('SUBMIT UPDATE 2', payload);

            const newCreditLimit =
                body.storeInfo.payment.creditLimit && body.storeInfo.payment.creditLimit.length > 0
                    ? body.storeInfo.payment.creditLimit.map(row => {
                          return {
                              allowCreditLimit: row.allowCreditLimit,
                              id: row.creditLimitStoreId,
                              invoiceGroupId: row.invoiceGroup,
                              creditLimitGroupId: row.creditLimitGroup,
                              creditLimit: row.creditLimit,
                              termOfPayment: row.termOfPayment
                          };
                      })
                    : [];

            const payload = {
                externalId: body.storeInfo.storeId.id,
                name: body.storeInfo.storeId.storeName,
                image: body.profileInfo.photos,
                taxNo: body.profileInfo.npwpId,
                address: body.storeInfo.address.notes,
                phoneNo: body.profileInfo.phoneNumber,
                numberOfEmployee: body.storeInfo.physicalStoreInfo.numberOfEmployee,
                storeTypeId: body.storeInfo.storeClassification.storeType,
                storeGroupId: body.storeInfo.storeClassification.storeGroup,
                storeSegmentId: body.storeInfo.storeClassification.storeSegment,
                vehicleAccessibilityId: body.storeInfo.physicalStoreInfo.vehicleAccessibility,
                urbanId: body.storeInfo.address.urban,
                cluster: {
                    clusterId: body.storeInfo.storeClassification.storeCluster
                },
                hierarchy: {
                    hierarchyId: body.storeInfo.storeClassification.hierarchy
                },
                creditLimit: newCreditLimit
            };

            if (!body.storeInfo.physicalStoreInfo.numberOfEmployee) {
                delete payload.numberOfEmployee;
            }

            if (!body.storeInfo.physicalStoreInfo.vehicleAccessibility) {
                delete payload.vehicleAccessibilityId;
            }

            if (!body.storeInfo.storeClassification.storeGroup) {
                delete payload.storeGroupId;
            }

            if (!body.storeInfo.storeClassification.storeCluster) {
                delete payload.cluster;
            }

            if (!body.storeInfo.storeClassification.hierarchy) {
                delete payload.hierarchy;
            }

            if (payload.creditLimit && payload.creditLimit.length > 0) {
                for (const [idx, row] of payload.creditLimit.entries()) {
                    const allowCredit = payload.creditLimit[idx].allowCreditLimit;

                    if (
                        (typeof allowCredit === 'boolean' && !allowCredit) ||
                        typeof allowCredit !== 'boolean'
                    ) {
                        // delete payload.creditLimit[idx].creditLimitGroupId;
                        // delete payload.creditLimit[idx].creditLimit;
                        // delete payload.creditLimit[idx].termOfPayment;

                        payload.creditLimit[idx].creditLimitGroupId = null;
                        payload.creditLimit[idx].creditLimit = 0;
                        payload.creditLimit[idx].termOfPayment = 0;
                    }
                }
            }

            this.store.dispatch(
                StoreActions.updateStoreRequest({ payload: { id, body: payload } })
            );
        }
    }

    private addressValid(): boolean {
        return (
            this.form.get('storeInfo.address.province').value &&
            this.form.get('storeInfo.address.city').value &&
            this.form.get('storeInfo.address.district').value &&
            this.form.get('storeInfo.address.urban').value &&
            this.form.get('storeInfo.address.postcode').value &&
            this.form.get('storeInfo.address').valid
        );
    }

    private populateCity(
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
    }

    private populateDistrict(
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
    }

    private populateUrban(
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
    }

    private populatePostcode(
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
    }
}

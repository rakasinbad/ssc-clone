import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { ErrorMessageService, HelperService, LogService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { SupplierInventoryActions } from '../store/actions';
import { fromSupplierInventory } from '../store/reducers';
import { SupplierInventorySelectors } from '../store/selectors';
import { MatSelectChange } from '@angular/material';
import { RxwebValidators, NumericValueType } from '@rxweb/reactive-form-validators';

@Component({
    selector: 'app-supplier-inventory-form',
    templateUrl: './supplier-inventory-form.component.html',
    styleUrls: ['./supplier-inventory-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplierInventoryFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    pageType: string;
    stockTypes: { id: boolean; label: string }[];

    catalog$: Observable<any>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromSupplierInventory.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$helper: HelperService,
        private _$log: LogService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.pageType = 'new';
        } else {
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Inventory',
                            translate: 'BREADCRUMBS.INVENTORY'
                        },
                        {
                            title: 'Supplier Inventory',
                            translate: 'BREADCRUMBS.SUPPLIER_INVENTORY',
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

        if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;
            this.catalog$ = this.store.select(
                SupplierInventorySelectors.getSelectedSupplierInventory
            );
            this.store.dispatch(
                SupplierInventoryActions.fetchSupplierInventoryRequest({ payload: id })
            );
        }

        this.initForm();

        this.isLoading$ = this.store.select(SupplierInventorySelectors.getIsLoading);

        this.stockTypes = this._$helper.stockType();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(SupplierInventoryActions.resetSupplierInventories());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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

    onSelectType(ev: MatSelectChange): void {
        if (typeof ev.value !== 'boolean') {
            return;
        }

        this.handleStockRule(ev.value);
    }

    onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const { id } = this.route.snapshot.params;

        const body = this.form.value;
        // const {
        //     fullName: fullNameField,
        //     roles: rolesField,
        //     phoneNumber: phoneNumberField,
        //     email: emailField
        // } = this.form.controls;

        if (this.pageType === 'edit') {
            if (body.name) {
                delete body.name;
            }

            if (body.unlimitedStock) {
                body.stock = 0;
            }

            this._$log.generateGroup(
                'SUBMIT EDIT',
                {
                    body: {
                        type: 'log',
                        value: body
                    }
                },
                'groupCollapsed'
            );

            this.store.dispatch(
                SupplierInventoryActions.updateSupplierInventoryRequest({
                    payload: { id, body }
                })
            );
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initForm(): void {
        this.form = this.formBuilder.group({
            // id: [{ value: '', disabled: true }],
            name: [{ value: '', disabled: true }],
            unlimitedStock: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            stock: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: false,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            displayStock: ['']
        });

        if (this.pageType === 'edit') {
            this.initUpdateForm();
        }
    }

    private initUpdateForm(): void {
        this.store
            .select(SupplierInventorySelectors.getSelectedSupplierInventory)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
            .subscribe(catalog => {
                if (catalog) {
                    this._$log.generateGroup(
                        'SELECTED SUPPLIER INVENTORY',
                        {
                            response: {
                                type: 'log',
                                value: catalog
                            }
                        },
                        'groupCollapsed'
                    );

                    if (catalog.name) {
                        this.form.get('name').patchValue(catalog.name);
                        this.form.get('name').markAsTouched();
                    }

                    if (typeof catalog.unlimitedStock === 'boolean') {
                        this.form.get('unlimitedStock').patchValue(catalog.unlimitedStock);
                        this.form.get('unlimitedStock').markAsTouched();

                        if (catalog.unlimitedStock === true) {
                            this.handleStockRule(catalog.unlimitedStock);
                        } else {
                            if (typeof catalog.stock === 'number') {
                                this.form.get('stock').patchValue(catalog.stock);
                                this.form.get('stock').markAsTouched();
                            }
                        }
                    }

                    if (typeof catalog.displayStock === 'boolean') {
                        this.form.get('displayStock').patchValue(catalog.displayStock);
                        this.form.get('displayStock').markAsTouched();
                    }
                }
            });
    }

    private handleStockRule(isLimited: boolean): void {
        if (isLimited === true) {
            this.form.get('stock').patchValue(0);
            this.form.get('stock').disable();
        } else {
            this.form.get('stock').enable();
        }
    }
}

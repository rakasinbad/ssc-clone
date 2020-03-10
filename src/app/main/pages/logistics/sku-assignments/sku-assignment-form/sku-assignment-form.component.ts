import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ChangeDetectorRef,
    AfterViewInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { FormActions, UiActions } from 'app/shared/store/actions';

import { fromSkuAssignments } from '../store/reducers';
import * as fromWarehouses from 'app/main/pages/logistics/warehouses/store/reducers';
import { Warehouse } from '../../warehouses/models';
import { NoticeService, ErrorMessageService } from 'app/shared/helpers';
import { Observable, Subject } from 'rxjs';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { map, takeUntil, filter, exhaustMap, tap, debounceTime } from 'rxjs/operators';
import { WarehouseSelectors } from 'app/shared/store/selectors/sources';
import { WarehouseActions } from 'app/shared/store/actions';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelect, MatDialog } from '@angular/material';
import { Catalogue } from 'app/main/pages/catalogues/models';
import { fromCatalogue } from 'app/main/pages/catalogues/store/reducers';
import { CatalogueActions } from 'app/main/pages/catalogues/store/actions';
import { IQueryParams } from 'app/shared/models/query.model';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { CatalogueSelectors } from 'app/main/pages/catalogues/store/selectors';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { MultipleSelectionService } from 'app/shared/components/multiple-selection/services/multiple-selection.service';
import { environment } from 'environments/environment';
import { FormSelectors } from 'app/shared/store/selectors';
import { SkuAssignmentsActions } from '../store/actions';
import { SkuAssignmentsSelectors } from '../store/selectors';
import { FeatureState as SkuAssignmentCoreFeatureState } from '../store/reducers';

@Component({
    selector: 'app-sku-assignment-form',
    templateUrl: './sku-assignment-form.component.html',
    styleUrls: ['./sku-assignment-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkuAssignmentFormComponent implements OnInit, AfterViewInit, OnDestroy {
    pageType: string;

    subs$: Subject<string> = new Subject<string>();
    loadMore$: Subject<string> = new Subject<string>();
    // Untuk keperluan mat dialog ref.
    dialogRef$: Subject<string> = new Subject<string>();
    // Untuk menyimpan mode edit.
    // tslint:disable-next-line: no-inferrable-types
    isEditMode: boolean = false;
    // Untuk menyimpan warehouse yang terpilih.
    selectedWarehouse: Warehouse;

    isLoading$: Observable<boolean>;
    warehouseList$: Observable<Array<Warehouse>>;

    availableCatalogues$: Observable<Array<Catalogue>>;
    totalCatalogues$: Observable<number>;
    isCatalogueLoading$: Observable<boolean>;

    form: FormGroup;

    initialSelectedOptions: Array<Selection> = [];
    availableOptions: Array<Selection> = [];
    // tslint:disable-next-line: no-inferrable-types
    isAvailableOptionsLoading: boolean = true;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Warehouse'
        },
        {
            title: 'SKU Assignment',
            keepCase: true,
        }
    ];

    @ViewChild('warehouse', { static: false }) warehouse: MatSelect;
    warehouseSub: Subject<string> = new Subject<string>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private cdRef: ChangeDetectorRef,
        private matDialog: MatDialog,
        private multiple$: MultipleSelectionService,
        private notice$: NoticeService,
        private catalogueStore: NgRxStore<fromCatalogue.FeatureState>,
        private SkuAssignmentsStore: NgRxStore<SkuAssignmentCoreFeatureState>,
        private warehousesStore: NgRxStore<fromWarehouses.FeatureState>,
        private _notice: NoticeService,
        private errorMessageSvc: ErrorMessageService
    ) {
        if (this.route.snapshot.url.filter(url => url.path === 'edit').length > 0) {
            this._breadCrumbs.push({
                title: 'Edit SKU Assignment',
                // translate: 'BREADCRUMBS.EDIT_PRODUCT',
                keepCase: true,
                active: true
            });

            this.isEditMode = true;
        } else {
            this._breadCrumbs.push({
                title: 'Add New SKU Assignment',
                // translate: 'BREADCRUMBS.ADD_PRODUCT',
                keepCase: true,
                active: true
            });

            this.isEditMode = false;
        }

        this.SkuAssignmentsStore.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor Konten Produk',
                            active: true
                        },
                        value: {
                            active: false
                        },
                        active: false
                    },
                    action: {
                        goBack: {
                            label: 'Back',
                            active: true,
                            url: '/pages/logistics/sku-assignments'
                        },
                        save: {
                            label: 'Save',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Batal',
                            active: false
                        }
                    }
                }
            })
        );

        this.isLoading$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsSelectors.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        this.warehouseList$ = this.warehousesStore.select(WarehouseSelectors.selectAll).pipe(
            map(warehouses => {
                if (warehouses.length === 0) {
                    this.warehousesStore.dispatch(
                        WarehouseActions.fetchWarehouseRequest({
                            payload: {
                                paginate: true
                            }
                        })
                    );
                }

                return warehouses;
            }),
            takeUntil(this.subs$)
        );
// 
        this.totalCatalogues$ = this.catalogueStore.select(
            CatalogueSelectors.getTotalCatalogue
        ).pipe(
            takeUntil(this.subs$)
        );

        this.isCatalogueLoading$ = this.catalogueStore.select(
            CatalogueSelectors.getIsLoading
        ).pipe(
            takeUntil(this.subs$)
        );

        // Melakukan observe terhadap dialogRef$ untuk menangani dialog ref.
        this.dialogRef$.pipe(
            exhaustMap(subjectValue => {
                // tslint:disable-next-line: no-inferrable-types
                let dialogTitle: string = '';
                // tslint:disable-next-line: no-inferrable-types
                let dialogMessage: string = '';

                if (subjectValue === 'clear-all') {
                    dialogTitle = 'Clear Selected Options';
                    dialogMessage = 'It will clear all your selected options. Are you sure?';
                }

                const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                    data: {
                        title: dialogTitle,
                        message: dialogMessage,
                        id: subjectValue
                    }, disableClose: true
                });
        
                return dialogRef.afterClosed().pipe(
                    tap(value => {
                        if (value === 'clear-all') {
                            this.form.patchValue({
                                selectedUrbans: [],
                                removedUrbans: []
                            });

                            this.multiple$.clearAllSelectedOptions();

                            this.notice$.open('Your selected options has been cleared.', 'success', {
                                horizontalPosition: 'right',
                                verticalPosition: 'bottom',
                                duration: 5000
                            });

                            this.cdRef.markForCheck();
                        }
                    })
                );
            }),
            takeUntil(this.subs$)
        ).subscribe();

        this.catalogueStore.select(
            CatalogueSelectors.getAllCatalogues
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(catalogues => {
            this.availableOptions = catalogues.map<Selection>(d => ({ id: d.id, group: 'sku', label: d.name }));
        });

        this.loadMore$.pipe(
            filter(message => {
                if (message === 'load-more-available') {
                    return true;
                }

                return false;
            }),
            takeUntil(this.subs$)
        ).subscribe(([message]) => {
            if (message === 'load-more-available') {
                // Menyiapkan query untuk pencarian district.
                const newQuery: IQueryParams = {
                    paginate: true,
                    limit: 30,
                    skip: this.availableOptions.length
                };

                // Mengirim state untuk melakukan request urban.
                this.catalogueStore.dispatch(
                    CatalogueActions.fetchCataloguesRequest({
                        payload: newQuery
                    })
                );

                this.cdRef.markForCheck();
            }
        });

        this.SkuAssignmentsStore.dispatch(UiActions.showFooterAction());

        // Mengatur ulang status form.
        this.SkuAssignmentsStore.dispatch(FormActions.resetFormStatus());
    }

    checkFormValidation(form: FormGroup, stores: Array<Warehouse>): void {
        // if (form.invalid || stores.length === 0) {
        //     this.warehousesStore.dispatch(FormActions.setFormStatusInvalid());
        // } else if (form.valid && stores.length > 0) {
        //     this.warehousesStore.dispatch(FormActions.setFormStatusValid());
        // }
    }

    private initCatalogueSelection(): void {
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 30,
            skip: 0
        };
        
        this.catalogueStore.dispatch(
            CatalogueActions.resetCatalogues()
        );

        this.catalogueStore.dispatch(
            CatalogueActions.fetchCataloguesRequest({
                payload: newQuery
            })
        );
    }

    private debug(label: string, data: any = {}): void {
        if (!environment.production) {
            // tslint:disable-next-line:no-console
            console.groupCollapsed(label, data);
            // tslint:disable-next-line:no-console
            console.trace(label, data);
            // tslint:disable-next-line:no-console
            console.groupEnd();
        }
    }

    private submitSkuAssignment(): void {
        // Mendapatkan nilai dari form.
        const formValue = this.form.getRawValue();
        // Mendapatkan urban yang terpilih.
        const catalogues = (formValue.catalogues as Array<Selection>) || [];
        // Mendapatkan urban yang terpilih.
        const deletedCatalogue = (formValue.deletedCatalogue as Array<Selection>) || [];

        this.warehousesStore.dispatch(SkuAssignmentsActions.addSkuAssignmentsRequest({
            payload: {
                warehouseId: +formValue.warehouse,
                catalogueId: catalogues.map(u => +u.id),
                deletedCatalogue: deletedCatalogue.map(d => +d.id)
            }
        }));
    }

    // private clearAvailableOptions(): void {
    //     this.availableOptions = [];
    //     this.cdRef.markForCheck();
    // }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
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

    onAvailableOptionLoadMore(): void {
        this.loadMore$.next('load-more-available');
    }

    onSelectedOptionLoadMore(): void {
        this.loadMore$.next('load-more-selected');
    }

    onSearch($event: string): void {
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 30,
            skip: 0
        };

        if ($event) {
            newQuery['search'] = [
                {
                    fieldName: 'name',
                    keyword: $event
                },
                {
                    fieldName: 'sku',
                    keyword: $event
                },
                {
                    fieldName: 'external_id',
                    keyword: $event
                }
            ];
        }
        
        this.catalogueStore.dispatch(
            CatalogueActions.resetCatalogues()
        );

        this.catalogueStore.dispatch(
            CatalogueActions.fetchCataloguesRequest({
                payload: newQuery
            })
        );
    }

    onClearAll(): void {
        this.dialogRef$.next('clear-all');
    }

    onSelectionChanged($event: { added: Array<Selection>; removed: Array<Selection> }): void {
        this.debug('onSelectionChanged', $event);

        this.form.patchValue({
            catalogues: $event.added.length === 0 ? '' : $event.added,
            deletedCatalogue: $event.removed.length === 0 ? '' : $event.removed,
        });
    }

    onSelectedWarehouse(warehouse: Warehouse): void {
        this.selectedWarehouse = (warehouse as Warehouse);
    }

    ngOnInit(): void {
        // Set breadcrumbs
        this.SkuAssignmentsStore.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );

        // Inisialisasi form.
        this.form = this.fb.group({
            warehouse: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            catalogues: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            deletedCatalogue: [
                ''
            ]
        });

        this.form.valueChanges.pipe(
            debounceTime(100),
            takeUntil(this.subs$)
        ).subscribe(() => {
            if (this.form.valid) {
                this.warehousesStore.dispatch(FormActions.setFormStatusValid());
            } else {
                this.warehousesStore.dispatch(FormActions.setFormStatusInvalid());
            }
        });

        this.warehousesStore.select(
            FormSelectors.getIsClickSaveButton
        ).pipe(
            filter(isClick => !!isClick),
            takeUntil(this.subs$)
        ).subscribe(() => {
            this.submitSkuAssignment();
        });

        this.initCatalogueSelection();
    }

    ngAfterViewInit(): void {
        // this.warehousesStore.select(
        //     WarehouseCoverageSelectors.getSelectedId
        // ).pipe(
        //     withLatestFrom(this.availableWarehouses$),
        //     take(1)
        // ).subscribe(([warehouseId, warehouses]: [string, Array<Warehouse>]) => {
        //     if (warehouseId || warehouses) {
        //         this.isEditMode = true;
        //         this.selectedWarehouse = (warehouses.find(wh => wh.id === warehouseId) as WarehouseFromCoverages);
        //         this.form.patchValue({
        //             warehouse: warehouseId
        //         });

        //         const query: IQueryParams = {
        //             paginate: false
        //         };
        //         query['warehouseId'] = warehouseId;

        //         this.warehousesStore.dispatch(
        //             WarehouseUrbanActions.fetchWarehouseUrbansRequest({
        //                 payload: query
        //             })
        //         );
        //     } else {
        //         this.isEditMode = false;
        //     }
        // });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.loadMore$.next();
        this.loadMore$.complete();

        this.dialogRef$.next();
        this.dialogRef$.complete();

        this.SkuAssignmentsStore.dispatch(UiActions.hideFooterAction());
        this.SkuAssignmentsStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.SkuAssignmentsStore.dispatch(UiActions.hideCustomToolbar());
        this.SkuAssignmentsStore.dispatch(FormActions.resetFormStatus());
        this.SkuAssignmentsStore.dispatch(FormActions.resetClickSaveButton());
        this.SkuAssignmentsStore.dispatch(FormActions.resetCancelButtonAction());
    }
}

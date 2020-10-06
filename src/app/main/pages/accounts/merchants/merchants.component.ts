import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    MatCheckbox,
    MatCheckboxChange,
    MatDialog,
    MatPaginator,
    MatSort,
    PageEvent,
} from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { CardHeaderActionConfig } from 'app/shared/components/card-header/models/card-header.model';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { ExportSelector } from 'app/shared/components/exports/store/selectors';
import { IButtonImportConfig } from 'app/shared/components/import-advanced/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ButtonDesignType } from 'app/shared/models/button.model';
import { LifecyclePlatform, TApprovalStatus, TNullable } from 'app/shared/models/global.model';
import { HashTable2 } from 'app/shared/models/hashtable2.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { User } from 'app/shared/models/user.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { ResendStoreDialogComponent } from './components';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { StoreActions } from './store/actions';
import { fromMerchant } from './store/reducers';
import { StoreSelectors } from './store/selectors';

@Component({
    selector: 'app-merchants',
    templateUrl: './merchants.component.html',
    styleUrls: ['./merchants.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class MerchantsComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = 10;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menyimpan form reject
    rejectForm: FormGroup;
    // Untuk penanda apakah sedang melakukan aksi masif (mass approve/reject)
    isMassAction: boolean;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Store List',
        },
        batchAction: {
            actions: [
                // {
                //     id: 'verify',
                //     label: 'Verify',
                // },
                // {
                //     id: 'reject',
                //     label: 'Reject',
                // },
                // {
                //     id: 'resend',
                //     label: 'Re-send',
                // },
                // {
                //     id: 'reset-selection',
                //     label: 'Reset Selection'
                // }
            ],
            onActionSelected: (action) => {
                if (action.id === 'verify') {
                    if (this.selected.length === 1) {
                        this.onUpdateApprovalStatus(this.selected.toArray()[0], 'verified');
                    } else if (this.selected.length > 1) {
                        this.onVerifyStores();
                    }
                } else if (action.id === 'resend') {
                    if (this.selected.length === 1) {
                        this.onResendStore(this.selected.toArray()[0]);
                    } else if (this.selected.length > 1) {
                        this.onResendStores();
                    }
                } else if (action.id === 'reject') {
                    if (this.selected.length === 1) {
                        this.onRejectStore(this.selected.toArray()[0]);
                    } else if (this.selected.length > 1) {
                        this.onRejectStores();
                    }
                } else if (action.id === 'reset-selection') {
                    this.selected.clear();
                    this._updateBatchActions();
                    this._updateHeadCheckbox();
                } else if (action.id === 'view-selection') {
                    this.viewSelection();
                }
            },
            show: false,
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
                setTimeout(() => this._onRefreshTable(true), 100);
            },
        },
        add: {
            permissions: ['ACCOUNT.STORE.CREATE'],
            onClick: () => {
                this.router.navigate(['/pages/account/stores/new']);
            },
        },
        export: {
            permissions: ['ACCOUNT.STORE.EXPORT'],
            useAdvanced: true,
            pageType: 'stores',
        },
        import: {
            permissions: ['ACCOUNT.STORE.IMPORT'],
            useAdvanced: true,
            pageType: 'stores',
        },
    };

    // Untuk menyimpan ID SupplierStore yang terpilih.
    // Ini digunakan untuk melakukan select dari awal untuk SelectionModel
    // karena object yang dibentuk sekarang tidak akan sama dengan object yang akan dibuat nanti
    // (alamat memory-nya berbeda).
    selectedSupplierStore: SupplierStore;
    selectedIds: Array<number> = [];
    selection: SelectionModel<SupplierStore>;
    search: FormControl = new FormControl('');
    formConfig = {
        status: {
            label: 'Store List Status',
            placeholder: 'Choose Store List Status',
            sources: this._$helper.storeStatus(),
            rules: {
                required: true,
            },
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
                setTimeout(() => this._onRefreshTable(true), 100);
            },
        },
        add: {
            permissions: ['ACCOUNT.STORE.CREATE'],
            onClick: () => {
                this.router.navigate(['/pages/account/stores/new']);
            },
        },
        export: {
            permissions: ['ACCOUNT.STORE.EXPORT'],
            useAdvanced: true,
            pageType: 'stores',
        },
        import: {
            permissions: ['ACCOUNT.STORE.IMPORT'],
            useAdvanced: true,
            pageType: 'stores',
        },
    };

    // search: FormControl = new FormControl('');
    total: number;
    displayedColumns = [
        'checkbox',
        'store-code',
        'name',
        'city',
        'address',
        // 'store-phone-no',
        'owner-phone-no',
        'owner-name',
        // 'store-segment',
        // 'store-type',
        // 'sr-name',
        'joining-date',
        'status',
        'supplier-status',
        'actions',
    ];
    resendStoreColumns: Array<string> = [
        'name',
        'owner-name',
        'city',
        'owner-phone-no',
        'status',
        'supplier-status',
    ];
    importBtnConfig: IButtonImportConfig = {
        id: 'import-journey-plan',
        cssClass: 'sinbad',
        color: 'accent',
        dialogConf: {
            title: 'Import',
            cssToolbar: 'fuse-white-bg',
        },
        title: 'IMPORT ADV',
        type: ButtonDesignType.MAT_STROKED_BUTTON,
    };

    // Untuk keperluan checkbox.
    selected: HashTable2<SupplierStore> = new HashTable2([], 'id');

    // tslint:disable-next-line: no-inferrable-types
    storeStatus: string = '';
    totalStores$: BehaviorSubject<string> = new BehaviorSubject<string>('-');
    totalVerified$: BehaviorSubject<string> = new BehaviorSubject<string>('-');
    totalGuest$: BehaviorSubject<string> = new BehaviorSubject<string>('-');
    totalRejected$: BehaviorSubject<string> = new BehaviorSubject<string>('-');
    totalPending$: BehaviorSubject<string> = new BehaviorSubject<string>('-');
    totalUpdating$: BehaviorSubject<string> = new BehaviorSubject<string>('-');

    dataSource: any[] = [];
    dataSource$: Observable<any[]>;
    selectedRowIndex$: Observable<string>;
    // tslint:disable-next-line: no-inferrable-types
    totalDataSource: number = 0;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('reject', { static: false }) reject: TemplateRef<any>;
    @ViewChild('resendStore', { static: false }) resendStore: TemplateRef<any>;
    @ViewChild('approveStores', { static: false }) approveStores: TemplateRef<any>;
    @ViewChild('viewSelected', { static: false }) viewSelected: TemplateRef<any>;
    @ViewChild('headCheckbox', { static: false, read: MatCheckbox }) headCheckbox: MatCheckbox;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    dialogRejectForm: ApplyDialogService;
    dialogStoreType: ApplyDialogService;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private router: Router,
        private ngxPermissions: NgxPermissionsService,
        private ngxRoles: NgxRolesService,
        private store: Store<fromMerchant.FeatureState>,
        public translate: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private cdRef: ChangeDetectorRef,
        private applyDialogFactory$: ApplyDialogFactoryService,
        private fb: FormBuilder,
        private matDialog: MatDialog
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Store',
                        translate: 'BREADCRUMBS.ACCOUNT',
                    },
                    {
                        title: 'Store List',
                        translate: 'BREADCRUMBS.STORE',
                        active: true,
                    },
                ],
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get searchStore(): string {
        return localStorage.getItem('filter.store') || '';
    }

    goStoreInfoPage(storeId: string, supplierStore: SupplierStore): void {
        if (!storeId) {
            return;
        }

        // this.store.dispatch(StoreActions.selectSupplierStore({ payload: supplierStore }));
        this.store.dispatch(StoreActions.goPage({ payload: 'info' }));
        this.router.navigate(['/pages/account/stores', storeId, 'detail']);
    }

    safeValue(item: string): string {
        return item ? item : '-';
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onRejectStore(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        // this.selection.clear();

        canChangeStatusStore.then((hasAccess) => {
            if (hasAccess) {
                this.isMassAction = false;

                this.dialogRejectForm = this.applyDialogFactory$.open(
                    {
                        title: `Reject (${item.store.name})`,
                        template: this.reject,
                        isApplyEnabled: true,
                    },
                    {
                        disableClose: true,
                        width: '50vw',
                        minWidth: '50vw',
                        maxWidth: '50vw',
                        height: '420px',
                        panelClass: 'dialog-container-no-padding',
                    }
                );

                this.dialogRejectForm.closed$.subscribe({
                    next: (value: TNullable<string>) => {
                        HelperService.debug('DIALOG REJECT STORE CLOSED', value);

                        if (value === 'apply') {
                            // Mendapatkan value form-nya.
                            const formValue = this.rejectForm.getRawValue();
                            // Menyiapkan payload-nya.
                            const payload = {
                                approvalStatus: 'rejected',
                                rejection: {
                                    reasons: formValue.reason,
                                    rejectedFields: {
                                        fullName: formValue.fullName,
                                        name: formValue.name,
                                        mobilePhoneNo: formValue.mobilePhoneNo,
                                        phoneNo: formValue.phoneNo,
                                        taxNo: formValue.taxNo,
                                        idNo: formValue.idNo,
                                        imageUrl: formValue.imageUrl,
                                        idImageUrl: formValue.idImageUrl,
                                        selfieImageUrl: formValue.selfieImageUrl,
                                        taxImageUrl: formValue.taxImageUrl,
                                    },
                                },
                            };

                            this.store.dispatch(
                                StoreActions.updateStoreRequest({
                                    payload: {
                                        id: item.id,
                                        isSupplierStore: true,
                                        body: payload,
                                    },
                                })
                            );
                        }
                    },
                });
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onRejectStores(): void {
        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        canChangeStatusStore.then((hasAccess) => {
            if (hasAccess) {
                this.isMassAction = true;

                this.dialogStoreType = this.applyDialogFactory$.open(
                    {
                        title: `Mass Reject (${this.selected.length} ${
                            this.selected.length === 1 ? 'store' : 'stores'
                        })`,
                        template: this.reject,
                        isApplyEnabled: true,
                    },
                    {
                        disableClose: true,
                        width: '60vw',
                        minWidth: '60vw',
                        maxWidth: '60vw',
                        panelClass: 'dialog-container-no-padding',
                    }
                );

                this.dialogStoreType.closed$.subscribe({
                    next: (value: TNullable<string>) => {
                        HelperService.debug('DIALOG MASS REJECT STORE CLOSED', value);

                        if (value === 'apply') {
                            // Mendapatkan value form-nya.
                            const formValue = this.rejectForm.getRawValue();
                            // Menyiapkan payload-nya.
                            const payload = {
                                approvalStatus: 'rejected',
                                supplierStores: this.selected
                                    .toArray()
                                    .map((selected) => ({ id: selected.id })),
                                rejection: {
                                    reasons: formValue.reason,
                                    rejectedFields: {
                                        fullName: formValue.fullName,
                                        name: formValue.name,
                                        mobilePhoneNo: formValue.mobilePhoneNo,
                                        phoneNo: formValue.phoneNo,
                                        taxNo: formValue.taxNo,
                                        idNo: formValue.idNo,
                                        imageUrl: formValue.imageUrl,
                                        idImageUrl: formValue.idImageUrl,
                                        selfieImageUrl: formValue.selfieImageUrl,
                                        taxImageUrl: formValue.taxImageUrl,
                                    },
                                },
                            };

                            this.store.dispatch(
                                StoreActions.updateStoreRequest({
                                    payload: {
                                        id: null,
                                        isSupplierStore: true,
                                        body: payload,
                                    },
                                })
                            );
                        }

                        this.cdRef.detectChanges();
                    },
                });
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onResendStore(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        // this.selection.clear();

        canChangeStatusStore.then((hasAccess) => {
            if (hasAccess) {
                // this.selection.select(item);
                this.isMassAction = false;
                this.selectedSupplierStore = item;

                const dialogRef = this.matDialog.open(ResendStoreDialogComponent, {
                    autoFocus: false,
                    data: {
                        message: `Are you sure want to re-send the store? Resend will update your <br/>
                        data and make the store to be a new store`,
                    },
                    disableClose: true,
                    panelClass: 'resend-store-dialog',
                    minHeight: '180px',
                    minWidth: '460px',
                });

                dialogRef.afterClosed().subscribe((result) => {
                    if (result === 'confirm') {
                        this.store.dispatch(
                            StoreActions.resendStoresRequest({
                                payload: [item],
                            })
                        );
                    }
                });
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    viewSelection(): void {
        if (this.selected.length === 0) {
            return;
        }

        this.applyDialogFactory$.open(
            {
                title: `View Selection (${this.selected.length} store(s))`,
                template: this.viewSelected,
                isApplyEnabled: false,
                showApplyButton: false,
                contentClass: ['h-532', 'pt-16', 'px-0', 'm-0', 'mat-typography'],
            },
            {
                disableClose: true,
                minWidth: '70vw',
                maxWidth: '90vw',
                width: '90vw',
                height: '600px',
                panelClass: 'dialog-container-no-padding',
            }
        );
    }

    onUpdateApprovalStatus(item: SupplierStore, approvalStatus: TApprovalStatus): void {
        if (!item || !item.id) {
            return;
        }

        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        canChangeStatusStore.then((hasAccess) => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(
                    StoreActions.confirmUpdateApprovalStatusStore({
                        payload: { approvalStatus, supplierStore: item },
                    })
                );
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onVerifyStores(): void {
        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        canChangeStatusStore.then((hasAccess) => {
            if (hasAccess) {
                this.dialogStoreType = this.applyDialogFactory$.open(
                    {
                        title: 'Mass Verify',
                        template: this.approveStores,
                        isApplyEnabled: true,
                    },
                    {
                        disableClose: true,
                        width: '60vw',
                        minWidth: '60vw',
                        maxWidth: '60vw',
                        panelClass: 'dialog-container-no-padding',
                    }
                );

                this.dialogStoreType.closed$.subscribe({
                    next: (value: TNullable<string>) => {
                        HelperService.debug('DIALOG MASS APPROVE STORE CLOSED', value);

                        if (value === 'apply') {
                            // Menyiapkan payload-nya.
                            const payload = {
                                approvalStatus: 'verified',
                                supplierStores: this.selected
                                    .toArray()
                                    .map((selected) => ({ supplierStoreId: selected.id })),
                            };

                            this.store.dispatch(
                                StoreActions.updateStoreRequest({
                                    payload: {
                                        id: null,
                                        isSupplierStore: true,
                                        body: payload,
                                    },
                                })
                            );
                        }

                        this.cdRef.detectChanges();
                    },
                });
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onResendStores(): void {
        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        canChangeStatusStore.then((hasAccess) => {
            if (hasAccess) {
                this.isMassAction = true;

                this.dialogStoreType = this.applyDialogFactory$.open(
                    {
                        title: 'Resend',
                        template: this.resendStore,
                        isApplyEnabled: true,
                    },
                    {
                        autoFocus: false,
                        disableClose: true,
                        width: '60vw',
                        minWidth: '60vw',
                        maxWidth: '60vw',
                        panelClass: 'dialog-container-no-padding',
                    }
                );

                this.dialogStoreType.closed$.subscribe({
                    next: (value: TNullable<string>) => {
                        HelperService.debug('DIALOG RE-SEND STORES CLOSED', value);

                        if (value === 'apply') {
                            this.store.dispatch(
                                StoreActions.resendStoresRequest({
                                    payload: this.selected.toArray(),
                                })
                            );
                        }
                    },
                });
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onChangeStatus(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        canChangeStatusStore.then((hasAccess) => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(StoreActions.confirmChangeStatusStore({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onDelete(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        const canDeleteStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.DELETE');

        canDeleteStore.then((hasAccess) => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(StoreActions.confirmDeleteStore({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onExport(ev: { action: string; payload: any }): void {
        if (!ev) {
            return;
        }

        const { action, payload } = ev;

        if (action === 'export') {
            const body = {
                status: payload.status,
                dateGte:
                    moment.isMoment(payload.start) && payload.start
                        ? (payload.start as moment.Moment).format('YYYY-MM-DD')
                        : payload.start
                        ? moment(payload.start).format('YYYY-MM-DD')
                        : null,
                dateLte:
                    moment.isMoment(payload.end) && payload.end
                        ? (payload.end as moment.Moment).format('YYYY-MM-DD')
                        : payload.end
                        ? moment(payload.end).format('YYYY-MM-DD')
                        : null,
            };

            this.store.dispatch(StoreActions.exportRequest({ payload: body }));
        }
    }

    onRemoveSearchStore(): void {
        localStorage.removeItem('filter.store');
        this.search.reset();
    }

    onTrackBy(index: number, item: SupplierStore): string {
        return !item ? null : item.id;
    }

    generateSalesRep(salesRep: Array<User>): string {
        if (!salesRep || !Array.isArray(salesRep) || salesRep.length === 0) {
            return '-';
        }

        return salesRep.map((sR) => sR.fullName).join(',<br/>');
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 1:
                this.storeStatus = 'verified';
                this._onRefreshTable(true);
                break;
            case 2:
                this.storeStatus = 'guest';
                this._onRefreshTable(true);
                break;
            case 3:
                this.storeStatus = 'rejected';
                this._onRefreshTable(true);
                break;
            case 4:
                this.storeStatus = 'pending';
                this._onRefreshTable(true);
                break;
            case 5:
                this.storeStatus = 'updating';
                this._onRefreshTable(true);
                break;
            default:
                this.storeStatus = '';
                this._onRefreshTable(true);
                break;
        }
    }

    selectSupplierStore(event: MatCheckboxChange, item: SupplierStore): void {
        HelperService.debug('[BEFORE] SUPPLIER STORE SELECTED', { event, item });

        if (this.selectedIds.length === 0) {
            this.selectedIds.push(+item.id);
            this.selection.select(item);
        } else {
            const idx = this.selectedIds.findIndex((id) => id === +item.id);

            if (event.checked) {
                this.selectedIds.push(+item.id);
                this.selection.select(item);
            } else {
                if (idx >= 0) {
                    this.selectedIds.splice(idx, 1);
                    this.selection.deselect(item);
                }
            }
        }

        HelperService.debug('[AFTER] SUPPLIER STORE SELECTED', {
            item,
            selectedIds: this.selectedIds,
            selection: this.selection,
        });
    }

    handleCheckbox(event): void {
        HelperService.debug('SELECT ALL CLICKED', event);
    }

    // isAllSelected(): boolean {
    //     const numSelected = this.selection.selected.length;
    //     const numRows = this.paginator.length;

    //     HelperService.debug('IS ALL SELECTED', { selection: this.selection, numSelected, numRows });

    //     return numSelected === numRows;
    // }

    onAllRowsSelected(): void {
        HelperService.debug('[BEFORE] onAllRowsSelected', {
            selected: this.selected,
            dataSource: this.dataSource,
            totalDataSource: this.totalDataSource,
        });

        if (this.headCheckbox.checked || this.headCheckbox.indeterminate) {
            this.selected.upsert(this.dataSource);
        } else {
            this.selected.remove(this.dataSource.map((store) => store.id));
        }

        HelperService.debug('[AFTER] onAllRowsSelected', {
            selected: this.selected,
            dataSource: this.dataSource,
            totalDataSource: this.totalDataSource,
        });
        this._updateHeadCheckbox();
        this._updateBatchActions();
    }

    onRowSelected(ev: MatCheckboxChange, row: SupplierStore): void {
        HelperService.debug('onRowSelected', { ev, row });

        if (ev.checked) {
            this.selected.upsert(row);
        } else {
            this.selected.remove(row.id);
        }

        this._updateHeadCheckbox();
        this._updateBatchActions();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    // Handle to indeterminate state of the checkbox (head checkbox) depends on total selection row
    private _tickHeadCheckbox(checked: boolean, indeterminate: boolean): void {
        if (this.headCheckbox) {
            this.headCheckbox.checked = checked;
            this.headCheckbox.indeterminate = indeterminate;
        }
    }

    // Handle to update checkbox (head checkbox) on column table
    private _updateHeadCheckbox(): void {
        if (this.headCheckbox) {
            const selectedIds = this.selected.toArray().map((s) => s.id);
            const dataSourceIds = this.dataSource.map((source) => source.id);
            const totalSelectedOnPage = dataSourceIds.filter((id) => selectedIds.includes(id))
                .length;

            if (this.selected.length === 0) {
                this._tickHeadCheckbox(false, false);
            } else if (this.selected.length === this.dataSource.length) {
                if (totalSelectedOnPage === 0) {
                    this._tickHeadCheckbox(false, false);
                } else {
                    this._tickHeadCheckbox(true, false);
                }
            } else if (this.selected.length !== this.dataSource.length) {
                if (totalSelectedOnPage === 0) {
                    this._tickHeadCheckbox(false, false);
                } else if (totalSelectedOnPage === this.dataSource.length) {
                    this._tickHeadCheckbox(true, false);
                } else {
                    this._tickHeadCheckbox(false, true);
                }
            }
        }
    }

    // Handle to update batch actions depends on selection row
    private _updateBatchActions(): void {
        let hasRejected: boolean = false;
        let hasPending: boolean = false;
        let hasGuest: boolean = false;
        let hasUpdating: boolean = false;
        let hasVerified: boolean = false;
        // Untuk menyimpan action yang akan dimunculkan di card header.
        let newActions: Array<CardHeaderActionConfig> = [];

        for (const selected of this.selected.toArray()) {
            switch (selected.outerStore['approvalStatus']) {
                case 'rejected': {
                    hasRejected = true;
                    break;
                }
                case 'pending': {
                    hasPending = true;
                    break;
                }
                case 'guest': {
                    hasGuest = true;
                    break;
                }
                case 'updating': {
                    hasUpdating = true;
                    break;
                }
                case 'verified': {
                    hasVerified = true;
                    break;
                }
            }
        }

        this.cardHeaderConfig = {
            ...this.cardHeaderConfig,
            batchAction: {
                ...this.cardHeaderConfig.batchAction,
                actions: [],
                show: false,
            },
        };

        // Re-send dihilangkan karena fitur re-send dibuka untuk semua status
        /* if (!hasPending && !hasVerified && !hasGuest && !hasUpdating && hasRejected) {
            newActions = [
                ...newActions,
                {
                    id: 'resend',
                    label: 'Re-send',
                },
            ];
        } */

        // Verify
        if (!hasVerified && !hasRejected && (hasGuest || hasUpdating || hasPending)) {
            newActions = [
                ...newActions,
                {
                    id: 'verify',
                    label: 'Verify',
                },
                {
                    id: 'reject',
                    label: 'Reject',
                },
            ];
        }

        // Show reset selection
        if (this.selected.length > 0) {
            newActions = [
                {
                    id: 'resend',
                    label: 'Re-send',
                },
                ...newActions,
                {
                    id: 'reset-selection',
                    label: 'Reset Selection',
                },
                {
                    id: 'view-selection',
                    label: 'View Selection',
                },
            ];
        }

        this.cardHeaderConfig = {
            ...this.cardHeaderConfig,
            batchAction: {
                ...this.cardHeaderConfig.batchAction,
                actions: newActions,
                show: hasVerified || hasRejected || hasGuest || hasUpdating || hasPending,
            },
        };
    }

    // Handle to display column table by supplier status
    private _updateDisplayedColumns(hasUpdateAccess: boolean): void {
        if (hasUpdateAccess) {
            if (this.storeStatus) {
                this.displayedColumns = ['checkbox'];
            } else {
                this.displayedColumns = [];
            }

            this.displayedColumns.push(
                'store-code',
                'name',
                'city',
                'address',
                // 'store-phone-no',
                'owner-phone-no',
                'owner-name',
                // 'store-segment',
                // 'store-type',
                // 'sr-name',
                'joining-date',
                'status',
                'supplier-status',
                'actions'
            );
        } else {
            this.displayedColumns = [
                // 'checkbox',
                'store-code',
                'name',
                'city',
                'address',
                // 'store-phone-no',
                'owner-phone-no',
                'owner-name',
                // 'store-segment',
                // 'store-type',
                // 'sr-name',
                'joining-date',
                'status',
                'supplier-status',
            ];
        }
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this._initTable();
                    });

                this.ngxPermissions
                    .hasPermission(['ACCOUNT.STORE.UPDATE', 'ACCOUNT.STORE.DELETE'])
                    .then((hasAccess) => {
                        this._updateDisplayedColumns(hasAccess);
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                this._unSubs$.next();
                this._unSubs$.complete();

                this.totalStores$.next('');
                this.totalVerified$.next('');
                this.totalGuest$.next('');
                this.totalRejected$.next('');
                this.totalPending$.next('');
                this.totalUpdating$.next('');

                this.totalStores$.complete();
                this.totalVerified$.complete();
                this.totalGuest$.complete();
                this.totalRejected$.complete();
                this.totalPending$.complete();
                this.totalUpdating$.complete();

                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state stores
                this.store.dispatch(StoreActions.resetStore());
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'updated_at',
                    start: 'desc',
                    disableClear: true,
                });

                localStorage.removeItem('filter.store');

                this.store.dispatch(StoreActions.deselectSupplierStore());

                // Menyiapkan form reject.
                this.rejectForm = this.fb.group({
                    fullName: [false],
                    name: [false],
                    mobilePhoneNo: [false],
                    phoneNo: [false],
                    taxNo: [false],
                    idNo: [false],
                    imageUrl: [false],
                    idImageUrl: [false],
                    selfieImageUrl: [false],
                    taxImageUrl: [false],
                    reason: ['', []],
                });

                this.rejectForm.valueChanges
                    .pipe(
                        tap((value) => HelperService.debug('REJECT FORM VALUE CHANGES', value)),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe();

                this.selection = new SelectionModel<SupplierStore>(true, []);

                this.dataSource$ = this.store.select(StoreSelectors.getAllStore).pipe(
                    tap((value) => HelperService.debug('GET ALL SUPPLIER STORES', value)),
                    tap((value) => {
                        const selected: any[] = [];

                        value.forEach((val) => {
                            if (this.selectedIds.includes(+val.id)) {
                                selected.push(val);
                            }
                        });

                        this.dataSource = value;
                        this._updateHeadCheckbox();
                    })
                );

                this.totalDataSource$ = this.store.select(StoreSelectors.getTotalStore).pipe(
                    tap((value) => {
                        this.totalDataSource = value;
                    })
                );

                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);

                this.isLoading$ = combineLatest([
                    this.store.select(StoreSelectors.getIsLoading),
                    this.store.select(ExportSelector.getRequestingState),
                ]).pipe(map((state) => state.includes(true)));

                // Horizontal filter
                this.store
                    .select(StoreSelectors.getApprovalStatuses)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe((data) => {
                        if (!data) {
                            this.store.dispatch(StoreActions.fetchCalculateSupplierStoresRequest());
                        } else {
                            this.totalStores$.next(data.totalStores);
                            this.totalVerified$.next(data.totalVerified);
                            this.totalGuest$.next(data.totalGuest);
                            this.totalRejected$.next(data.totalRejected);
                            this.totalPending$.next(data.totalPending);
                            this.totalUpdating$.next(data.totalUpdating);
                        }
                    });

                this._initTable();

                this.search.valueChanges
                    .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
                    .subscribe((v) => {
                        if (v) {
                            localStorage.setItem('filter.store', v);
                        }

                        this._onRefreshTable(true);
                    });

                this.store
                    .select(StoreSelectors.getIsRefresh)
                    .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe((isRefresh) => {
                        if (isRefresh) {
                            this.store.dispatch(
                                StoreActions.setRefreshStatus({ refreshStatus: false })
                            );
                            this.store.dispatch(StoreActions.fetchCalculateSupplierStoresRequest());
                            this.selected.clear();
                            this._updateBatchActions();
                            this._onRefreshTable();
                        }
                    });
                break;
        }
    }

    private _onRefreshTable(resetPage: boolean = false): void {
        if (resetPage) {
            this.paginator.pageIndex = 0;
        }

        this.ngxPermissions
            .hasPermission(['ACCOUNT.STORE.UPDATE', 'ACCOUNT.STORE.DELETE'])
            .then((hasAccess) => {
                this._updateDisplayedColumns(hasAccess);
            });

        this._initTable();
    }

    private _initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        if (this.search.value) {
            const query = this.search.value;

            data['search'] = [
                {
                    fieldName: 'keyword',
                    keyword: query,
                },
            ];
        }

        if (this.storeStatus) {
            data['approvalStatus'] = this.storeStatus;
        }

        this.store.dispatch(
            StoreActions.fetchStoresRequest({
                payload: data,
            })
        );
    }
}

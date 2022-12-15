import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, OnDestroy, EventEmitter, Output, ViewChild, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { PageEvent, MatPaginator, MatSelectChange, MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { Observable, Subject, BehaviorSubject, of, combineLatest, } from 'rxjs';
import { tap, withLatestFrom, takeUntil, take, catchError, switchMap, map, } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { StoreSegmentationType } from 'app/shared/components/selection-tree/store-segmentation/models';
import { StoreSegmentationTypesApiService as EntitiesApiService } from 'app/shared/components/selection-tree/store-segmentation/services';
import { IQueryParams } from 'app/shared/models/query.model';
import { IPaginatedResponse, ErrorHandler, FormStatus, } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { environment } from 'environments/environment';
import { CatalogueMssSettings, MssTypesResponseProps, MssTypesResponseData, UpsertMssSettings, } from '../../models';
import { CatalogueMssSettingsDataSource, CatalogueMssSettingsSegmentationDataSource } from '../../datasources';
import { CatalogueMssSettingsFacadeService, CatalogueMssSettingsApiService } from '../../services';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { DeleteCatalogueSegmentationsComponent } from 'app/shared/modals';

type IFormMode = 'add' | 'view' | 'edit';

interface IScreenConfig {
    segmentation: 'cluster' | 'type';
    title: 'Store Cluster' | 'Store Type';
    info: 'store cluster' | 'store type';
    dropdownPlaceholder: 'Choose Cluster' | 'Choose Type';
    searchPlaceholder: 'Find Store Cluster' | 'Find Store Type';
    tableHeader: 'Cluster Name' | 'Type Name';
    deleteTitle: 'Delete Cluster' | 'Delete Type';
    errorAlreadyExist: 'Store Cluster Already Exist' | 'Store Type Already Exist';
}

interface ScreenConfig {
    "mss-02": IScreenConfig;
    "mss-03": IScreenConfig
}
interface IListMssSettings {
    id: string;
    referenceName: string;
    referenceId: number;
    mssTypeId: string;
    mssTypeName: string;
}
  
const clusterScreenConfig: IScreenConfig = {
    segmentation: 'cluster',
    title: 'Store Cluster',
    info: 'store cluster',
    dropdownPlaceholder: 'Choose Cluster',
    searchPlaceholder: 'Find Store Cluster',
    tableHeader: 'Cluster Name',
    deleteTitle: 'Delete Cluster',
    errorAlreadyExist: 'Store Cluster Already Exist',
}

const typeScreenConfig: IScreenConfig = {
    segmentation: 'type',
    title: 'Store Type',
    info: 'store type',
    dropdownPlaceholder: 'Choose Type',
    searchPlaceholder: 'Find Store Type',
    tableHeader: 'Type Name',
    deleteTitle: 'Delete Type',
    errorAlreadyExist: 'Store Type Already Exist',
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
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    subs$: Subject<void> = new Subject<void>();
    trigger$: BehaviorSubject<string> = new BehaviorSubject('');
    updateForm$: BehaviorSubject<IFormMode> = new BehaviorSubject<IFormMode>(null);

    // state for table needs
    /** primary table mss settings list */
    dataSource: CatalogueMssSettingsDataSource;
    isLoading: boolean = false;
    totalItem: number = 0;
    displayedColumns: string[] = [
        `cluster-name`,
        `mss-type`,
        'action'
    ]
    /** store cluster/type segmentation list */
    segmentationColumns: string[] = [
        `name`,
    ]
    segmentationsDatasource: CatalogueMssSettingsSegmentationDataSource;
    isLoadingSegmentations: boolean = false;
    totalSegmentations: number = 0;

    formModeValue: IFormMode = 'add';

    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };

    showMssInfo: BehaviorSubject<boolean> = new BehaviorSubject(false);

    baseScreenConfig: ScreenConfig = {
        "mss-02": typeScreenConfig,
        "mss-03": clusterScreenConfig
    };

    screenConfig: IScreenConfig = clusterScreenConfig;

    segmentationDropdownData: StoreSegmentationType[] = [];
    isLoadingSegmentationData: boolean = false;

    mssTypeData: MssTypesResponseProps[] = [];

    // dropdown 
    selectedSegmentation: StoreSegmentationType = null;
    selectedType: MssTypesResponseProps = null;
    payloadUpsert: UpsertMssSettings;

    /** mss list state */
    dataSourceMssListIsLoading: boolean = false;
    dataSourceMssList: IListMssSettings[] = [];
    dataSourceMssListMeta: any = {
        total: 0,
        limit: 5,
        skip: 0,
    };
    displayedColumnsMssList: string[] = [`cluster-name`, `mss-type`];

    @Input() initSelection: number;

    @Output()
    formModeChange: EventEmitter<IFormMode> = new EventEmitter();

    @Output()
    changePage: EventEmitter<void> = new EventEmitter();

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output()
    formValueChange: EventEmitter<UpsertMssSettings> = new EventEmitter<UpsertMssSettings>();

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
        private entityApi$: EntitiesApiService,
        private route: ActivatedRoute,
        private notice$: NoticeService,
        private catalogueMssSettingsFacadeService: CatalogueMssSettingsFacadeService,
        private catalogueMssSettingsApiService: CatalogueMssSettingsApiService,
        private changeDetectorRef: ChangeDetectorRef,
        private matDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.checkMssSettings();
        this.onFetchAPI();
        this.changeDetectorRef.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (
                (!changes['formMode'].isFirstChange() && changes['formMode'].currentValue === 'edit') ||
                changes['formMode'].currentValue === 'view'
            ) {
                this.trigger$.next('');
                this.updateForm$.next(changes['formMode'].currentValue);
                if (changes['formMode'].currentValue === 'view') {
                    this.selectedSegmentation = null;
                    this.selectedType = null;
                } 
            }
            
            this.updateFormView();
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.showMssInfo.next(null);
        this.showMssInfo.complete();

        this.updateForm$.next(null);
        this.updateForm$.complete();
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
        this.updateForm$.next(null);
        this.changePage.emit();

        this.onRequest();
    }

    private onRequest(): void {
        let limit = this.defaultPageSize;
        let skip = 0;
        if (this.paginator) {
            limit = this.paginator.pageSize ? this.paginator.pageSize : this.defaultPageSize;
            skip = limit * this.paginator.pageIndex;
        }
        const params: IQueryParams = {
            paginate: true,
            limit,
            skip,
        };
        
    }

    _patchForm(): void {
        combineLatest([this.trigger$])
            .pipe(
                takeUntil(this.subs$)
            )
            .subscribe(() => {
                
            });
    }

     private updateFormView(): void {
        this.catalogueContent = {
            'mt-16': true,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode()
        };

        
        if (this.isViewMode()) {
            /** initial get mss settings list */
            this.getMssLits({skip: this.dataSourceMssListMeta.skip, limit: this.dataSourceMssListMeta.limit});
            /** get mss settings data */
            if (!this.dataSource) this.dataSource = new CatalogueMssSettingsDataSource(this.catalogueMssSettingsFacadeService);

            this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            .subscribe(({ supplierId }) => {
                this.dataSource.getWithQuery({
                    paginate: false,
                    search: [
                        {
                            fieldName: 'supplierId',
                            keyword: supplierId
                        },
                        {
                            fieldName: 'catalogueId',
                            keyword: this.route.snapshot.params.id
                        }
                    ]
                });
                
                /** setup payload upsert */
                this.payloadUpsert = new UpsertMssSettings({
                    supplierId: parseInt(supplierId),
                    catalogueId: this.route.snapshot.params.id,
                    data: []
                }); 
                this.formValueChange.emit(this.payloadUpsert);
            });

            this.displayedColumns = [
                `cluster-name`,
                `mss-type`,
            ] 
        }

        if (this.isEditMode()) {
            this.showMssInfo.subscribe(show => this.formStatusChange.emit(show ? 'VALID' : 'DISABLED'));
            this.displayedColumns = [
                `cluster-name`,
                `mss-type`,
                'action'
            ]
        }
    }

    checkMssSettings(): void {
        /** check mss settings, is it set by admin panel or not */
        this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            .pipe(
                take(1)
            )
            .subscribe(({ supplierId }) => {
                return this.catalogueMssSettingsFacadeService.getMssBase(supplierId,{}) 
            });

        combineLatest([this.catalogueMssSettingsFacadeService.mssBaseSupplier$])
            .pipe(
                map(([data]) => {
                    return {
                        mssBaseSupplier: data && data['data'],
                    }
                })
            )
            .subscribe(({ mssBaseSupplier }) => {
                if (mssBaseSupplier) {
                    if (mssBaseSupplier.mssBases.code !== 'mss-01') {
                        /** mss set by admin panel */
                        this.showMssInfo.next(true);
                        this.screenConfig = this.baseScreenConfig[mssBaseSupplier.mssBases.code]

                        this._patchForm();
                        this.getSegmentationData({ paginate: false });
                    }
                }
            })
    }

    onChangePageMssList(ev: PageEvent): void {
        let newPage = {limit: ev.pageSize, skip: ev.pageIndex * this.dataSourceMssListMeta.limit};
        HelperService.debug('onChangePageMssList', {ev, newPage, meta: this.dataSourceMssListMeta});
        this.getMssLits(newPage);
    }

    getMssLits({skip, limit}): void {
        this.dataSourceMssListIsLoading = true;
        of(null)
            .pipe(
                withLatestFrom<any, UserSupplier>(
                    this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
                ),
                tap((x) => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
                switchMap<
                    [null, UserSupplier],
                    Observable<IPaginatedResponse<StoreSegmentationType>>
                >(([_, userSupplier]) => {
                    if (!userSupplier) {
                        throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                    }

                    const { supplierId } = userSupplier;
                    return this.catalogueMssSettingsApiService
                        .getWithQueryCustom<any>({
                            catalogueId: this.route.snapshot.params.id,
                            supplierId: Number(supplierId),
                            skip,
                            limit,
                            paginate: true,
                        })
                        .pipe(tap((response) => HelperService.debug('GET MSS LIST', { response })));
                }),
                take(1),
                catchError((err) => {
                    throw err;
                })
            )
            .subscribe({
                next: (response: any) => {
                    if (response){
                        this.dataSourceMssList = response.data ? response.data : [];
                        this.dataSourceMssListMeta = {
                            total: response.total ? response.total : 0,
                            limit: response.limit ? response.limit : this.dataSourceMssListMeta.limit,
                            skip: response.skip ? response.skip : 0,
                        }
                    }
                    this.dataSourceMssListIsLoading = false;
                    this.changeDetectorRef.detectChanges();
                    this.changeDetectorRef.markForCheck();
                },
                error: (err) => {
                    HelperService.debug('ERROR GET MSS LIST', { error: err });
                    if (err.error) {
                        if (err.error.code !== 406 && err.error.message !== "Mss base is not active yet") {
                            this.helper$.showErrorNotification(new ErrorHandler(err));
                        }
                    }
                    this.dataSourceMssListIsLoading = false;
                    this.changeDetectorRef.detectChanges();
                    this.changeDetectorRef.markForCheck();
                },
                complete: () => {
                    this.dataSourceMssListIsLoading = false;
                    HelperService.debug('GET MSS LIST COMPLETED');
                    this.changeDetectorRef.detectChanges();
                    this.changeDetectorRef.markForCheck();
                },
            });
    }

    onFetchAPI(): void {
        this.segmentationsDatasource = new CatalogueMssSettingsSegmentationDataSource(this.catalogueMssSettingsFacadeService);
        
        combineLatest([this.dataSource.isLoading, this.dataSource.total, this.segmentationsDatasource.isLoading, this.segmentationsDatasource.total])
            .pipe(
                map(([isLoading, totalItem, isLoadingSegmentations, totalSegmentations]) => ({ isLoading, totalItem, isLoadingSegmentations, totalSegmentations })),
                takeUntil(this.subs$)
            )
            .subscribe(
                ({ isLoading, totalItem, isLoadingSegmentations, totalSegmentations }) => {
                    this.isLoading = isLoading;
                    this.totalItem = totalItem;
                    this.isLoadingSegmentations = isLoadingSegmentations;
                    this.totalSegmentations = totalSegmentations;
                    this.changeDetectorRef.markForCheck();
                }
            );

        this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            .subscribe(({ supplierId }) => {
                this.segmentationsDatasource.getWithQuery({ 
                    paginate: false,
                    search: [
                        {
                            fieldName: 'supplierId',
                            keyword: supplierId
                        },
                        {
                            fieldName: 'catalogueId',
                            keyword: this.route.snapshot.params.id
                        }
                    ]
                });
            });
        
        this.getMssTypes();
    }

    private getMssTypes(): void {
        of(null).pipe(
            switchMap<any, Observable<MssTypesResponseData>>(() => {
                return this.catalogueMssSettingsApiService
                    .getMssTypes<MssTypesResponseData>()
                    .pipe(
                        tap(response => HelperService.debug('FIND MSS TYPES', { response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                this.mssTypeData = response.data;
            },
            error: (err) => {
                HelperService.debug('ERROR MSS TYPES', { error: err });
                if (err.error) {
                    if (err.error.code !== 406 && err.error.message !== "Mss base is not active yet") {
                        this.helper$.showErrorNotification(new ErrorHandler(err));
                    }
                }
            },
            complete: () => {
                HelperService.debug('FIND MSS TYPES COMPLETED');
            }
        });
    }

    private getSegmentationData(params: IQueryParams): void {
        of(null).pipe(
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<StoreSegmentationType>>>(([_, userSupplier]) => {
                if (!userSupplier) {
                    throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                }

                const { supplierId } = userSupplier;
                const newQuery: IQueryParams = { ... params };
                newQuery['supplierId'] = supplierId;
                newQuery['segmentation'] = this.screenConfig.segmentation;
                
                this.isLoadingSegmentationData = true;

                return this.entityApi$
                    .find<IPaginatedResponse<StoreSegmentationType>>(newQuery)
                    .pipe(
                        tap(response => HelperService.debug('FIND SEGMENTATION', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        )
        .subscribe({
            next: (response) => {
                this.segmentationDropdownData = response as unknown as Array<StoreSegmentationType>;
                this.isLoadingSegmentationData = false;
                this.changeDetectorRef.markForCheck();
            },
            error: (err) => {
                HelperService.debug('ERROR FIND SEGMENTATION', { params, error: err });
                if (err.error) {
                    if (err.error.code !== 406 && err.error.message !== "Mss base is not active yet") {
                        this.helper$.showErrorNotification(new ErrorHandler(err));
                    }
                }
                this.isLoadingSegmentationData = false;
                this.changeDetectorRef.markForCheck();
            },
            complete: () => {
                HelperService.debug('FIND SEGMENTATION COMPLETED');
                this.isLoadingSegmentationData = false;
                this.changeDetectorRef.markForCheck();
            }
        });
    }

    onSearchSegmentation(keyword: string): void {
        this.getSegmentationData({ 
            paginate: false, 
            search: [
                { fieldName: 'name', keyword }
            ] 
        })
    }

    onSelectSegmentation(evt: MatSelectChange): void {
        this.selectedSegmentation = evt.value;
        this.changeDetectorRef.markForCheck();
    }

    onSelectType(evt: MatSelectChange): void {
        this.selectedType = evt.value;
        this.changeDetectorRef.markForCheck();
    }

    onSelectTypeTable(evt: MatSelectChange, data: CatalogueMssSettings): void {
        const index = this.payloadUpsert.data.findIndex(item => item.referenceId === data.referenceId);
        
        if (index >= 0) {
            /** if data exist in payload */
            this.payloadUpsert.data[index].mssTypeId = evt.value;
        } else {
            /** add new data to payload */
            this.payloadUpsert.data = [
                ...this.payloadUpsert.data,
                {
                    id: data.id ? data.id : null,
                    referenceId: data.referenceId,
                    mssTypeId: evt.value,
                    /** if there is id, means data get from db/backend else that is new data */
                    action: data.id ? 'update' : 'insert'
                }
            ];
        };

        /** update data in table */
        this.dataSource.connect()
            .pipe(
                take(1)
            )
            .subscribe(currentData => {
                const newData = [
                    new CatalogueMssSettings({
                        ...data,
                        mssTypeId: evt.value,
                        action: data.id ? 'update' : 'insert'
                    }),
                    ...currentData,
                ];
                this.catalogueMssSettingsFacadeService.upsertMssSettingsData(newData);
            });

        this.formValueChange.emit(this.payloadUpsert);
        this.changeDetectorRef.markForCheck();
    }

    onAddToList(): void {
        this.dataSource.connect()
            .pipe(
                take(1)
            )
            .subscribe(currentData => {
                if (currentData.find(item => item.referenceId === this.selectedSegmentation.id))  {
                    /** data already exist in table, should not allowd to add more */
                    this.notice$.open(this.screenConfig.errorAlreadyExist, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                } else {
                    /** prepare payload upsert to be send to backend */
                    this.payloadUpsert.data = [
                        ...this.payloadUpsert.data,
                        {
                            id: null,
                            referenceId: this.selectedSegmentation.id,
                            mssTypeId: this.selectedType.id,
                            action: 'insert'
                        }
                    ];
                    this.formValueChange.emit(this.payloadUpsert);

                    /** update data in table */
                    const data = [
                        new CatalogueMssSettings({
                            id: null,
                            referenceId: this.selectedSegmentation.id,
                            referenceName: this.selectedSegmentation.name,
                            mssTypeName: this.selectedType.name,
                            mssTypeId: this.selectedType.id,
                            action: 'insert'
                        }),
                        ...currentData,
                    ];
                    this.catalogueMssSettingsFacadeService.upsertMssSettingsData(data);
                }
                
                /** clear dropdown */
                this.selectedSegmentation = null;
                this.selectedType = null;
                this.changeDetectorRef.markForCheck();
            });
    }

    onDelete(id: string) {
        const dialogRef = this.matDialog.open(DeleteCatalogueSegmentationsComponent, {
            data: {
                title: this.screenConfig.deleteTitle,
                message: `This action can impacting the MSS settings for this product.Are you sure<br /> to continue delete this ${this.screenConfig.segmentation} from the list?`,
                id
            },
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(referenceId => {
            if (referenceId) {
                /** update data in table */
                this.dataSource.connect()
                .pipe(
                    take(1)
                )
                .subscribe(currentData => {
                    // /** prepare payload upsert to be send to backend *
                    const index = this.payloadUpsert.data.findIndex(item => item.referenceId === referenceId);

                    if (index >= 0) {
                        /** if data exist in payload */
                        if (this.payloadUpsert.data[index].id) {
                            /** if data have id means data get from db/backend */
                            this.payloadUpsert.data[index].action = 'delete';
                        } else {
                            /** if data dont have id, means new data currently added no nee to send payload to backend */
                            this.payloadUpsert.data =  this.payloadUpsert.data.filter(item => item.id !== id);
                        }

                    } else {
                        // /** prepare payload upsert to be send to backend *
                        const currentIndex = currentData.findIndex(item => item.referenceId === referenceId);

                        /** add new data to payload */
                        this.payloadUpsert.data = [
                            ...this.payloadUpsert.data,
                            {
                                id: currentData[currentIndex].id,
                                referenceId: currentData[currentIndex].referenceId,
                                mssTypeId: currentData[currentIndex].mssTypeId,
                                action: 'delete'
                            }
                        ];
                    }
                    this.formValueChange.emit(this.payloadUpsert);

                    /** edit data inside table */
                    const data = currentData.filter(item => item.referenceId !== referenceId);
                    this.catalogueMssSettingsFacadeService.upsertMssSettingsData(data);
                });
            }
        });
    }
}
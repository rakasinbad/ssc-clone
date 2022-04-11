import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, OnDestroy, EventEmitter, Output, ViewChild, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { PageEvent, MatPaginator, MatSelectChange } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { Observable, Subject, BehaviorSubject, of, combineLatest, } from 'rxjs';
import { tap, withLatestFrom, takeUntil, take, catchError, switchMap, map, debounceTime, distinctUntilChanged, } from 'rxjs/operators';
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

type IFormMode = 'add' | 'view' | 'edit';

interface IScreenConfig {
    segmentation: 'cluster' | 'type';
    title: 'Store Cluster' | 'Store Type';
    info: 'store cluster' | 'store type';
    dropdownPlaceholder: 'Choose Cluster' | 'Choose Type';
    searchPlaceholder: 'Find Store Cluster' | 'Find Store Type';
}

const clusterScreenConfig = {
    segmentation: 'cluster',
    title: 'Store Cluster',
    info: 'store cluster',
    dropdownPlaceholder: 'Choose Cluster',
    searchPlaceholder: 'Find Store Cluster'
}

const typeScreenConfig = {
    segmentation: 'type',
    title: 'Store Type',
    info: 'store type',
    dropdownPlaceholder: 'Choose Type',
    searchPlaceholder: 'Find Store Type'
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
    
    form: FormGroup;

    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };

    showMssInfo: BehaviorSubject<boolean> = new BehaviorSubject(false);

    editTableMode: boolean = false;

    screenConfig: IScreenConfig = clusterScreenConfig as IScreenConfig;

    segmentationDropdownData: StoreSegmentationType[] = [];
    isLoadingSegmentationData: boolean = false;

    mssTypeData: MssTypesResponseProps[] = [];

    // dropdown 
    selectedSegmentation: StoreSegmentationType = null;
    selectedType: MssTypesResponseProps = null;
    payloadUpsert: UpsertMssSettings;
    idCounter: number = 0;

    @Input() initSelection: number;

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
        private catalogueMssSettingsFacadeService: CatalogueMssSettingsFacadeService,
        private catalogueMssSettingsApiService: CatalogueMssSettingsApiService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            radioButton: [],
            columnRadioButton: ['']
        });

        this.onFetchAPI();
        this._patchForm();
        this.subscribeForm();
        this.checkMssSettings();
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
                    this.editTableMode = false;
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

     private updateFormView(): void {
        this.catalogueContent = {
            'mt-16': true,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode()
        };

        
        if (this.isViewMode()) {
            this.displayedColumns = [
                `cluster-name`,
                `mss-type`,
            ] 
        }

        if (this.isEditMode()) {
            this.displayedColumns = [
                `cluster-name`,
                `mss-type`,
                'action'
            ]
        }
    }

    checkMssSettings(): void {
        /** check mss settings, is it set by admin panel or not */
        this.showMssInfo.next(true);
        this.showMssInfo
        .subscribe(show => {
            if (show) {
                this.onRequest();
            }
        })
    }

    onEditTableMode(): void {
        this.editTableMode = true;
    }

    onFetchAPI(): void {
        this.dataSource = new CatalogueMssSettingsDataSource(this.catalogueMssSettingsFacadeService);
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

        /** get mss settings data */
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

                /** setup payload upsert */
                this.payloadUpsert = {
                    supplierId: parseInt(supplierId),
                    catalogueId: this.route.snapshot.params.id,
                    data: []
                }
            });
        this.getMssTypes();
        this.getSegmentationData({ paginate: false });
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
                HelperService.debug('ERROR MSS TYPES', { error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
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
                console.log('response segmentattin => ', response)
                this.segmentationDropdownData = response as unknown as Array<StoreSegmentationType>;
                this.isLoadingSegmentationData = false;
                this.changeDetectorRef.markForCheck();
            },
            error: (err) => {
                HelperService.debug('ERROR FIND SEGMENTATION', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
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

    onAddToList(): void {
        /** prepare payload upsert to be send to backend */
        this.payloadUpsert.data = [
            ...this.payloadUpsert.data,
            {
                id: this.idCounter.toString(),
                referenceId: this.selectedSegmentation.id,
                mssTypeId: this.selectedType.id,
                action: 'insert'
            }
        ];
        /** update data in table */
        this.dataSource.connect()
            .pipe(
                take(1)
            )
            .subscribe(currentData => {
                const data = [
                    ...currentData,
                    new CatalogueMssSettings({
                        id: this.idCounter.toString(),
                        referenceId: this.selectedSegmentation.id,
                        referenceName: this.selectedSegmentation.name,
                        mssTypeName: this.selectedType.name,
                        mssTypeId: this.selectedType.id,
                        action: 'insert'
                    })
                ];
                this.catalogueMssSettingsFacadeService.upsertMssSettingsData(data);
                this.idCounter++;
            });
        /** clear dropdown */
        this.selectedSegmentation = null;
        this.selectedType = null;
        this.changeDetectorRef.markForCheck();
    }
}

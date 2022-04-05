import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, OnDestroy, EventEmitter, Output, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { PageEvent, MatPaginator } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { Observable, Subject, BehaviorSubject, of, combineLatest, } from 'rxjs';
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
import { CatalogueMssSettingsDataSource } from '../../datasources/catalogue-mss-settings.datasource';

type IFormMode = 'add' | 'view' | 'edit';

interface IScreenConfig {
    mssTypeBy: 'store-cluster' | 'store-type';
    title: 'Store Cluster' | 'Store Type';
    info: 'store cluster' | 'store-type';
    dropdownPlaceholder: 'Choose Cluster' | 'Choose Type',
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

    screenConfig: IScreenConfig = {
        mssTypeBy: 'store-cluster',
        title: 'Store Cluster',
        info: 'store cluster',
        dropdownPlaceholder: 'Choose Cluster',
    }

    segmentationDropdownData = [];

    mssTypeData = [
        {
            id: 1,
            name: 'MSS Core'
        },
         {
            id: 2,
            name: 'MSS'
        }
        ,
         {
            id: 3,
            name: 'Non-MSS'
        }
    ]

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
        this.form = this.fb.group({
            radioButton: [],
            columnRadioButton: ['']
        });
    }

    ngOnInit(): void {
        this.dataSource = new CatalogueMssSettingsDataSource(
            this.store,
            this.entityApi$,
            this.helper$
        );
        this._patchForm();
        this.subscribeForm();
        this.checkMssSettings();
        
        this.dataSource.connect()
            .subscribe(data => {
                HelperService.debug('AVAILABLE ENTITIES FROM CATALOGUE MSS SETTINGS', data)
                this.segmentationDropdownData = data
            });

        combineLatest([this.dataSource.isLoading, this.dataSource.total])
        .pipe(
            map(([isLoading, totalItem]) => ({ isLoading, totalItem })),
            takeUntil(this.subs$)
        )
        .subscribe(
            ({ isLoading, totalItem }) => {
                this.isLoading = isLoading;
                this.totalItem = totalItem;
            }
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (
                (!changes['formMode'].isFirstChange() && changes['formMode'].currentValue === 'edit') ||
                changes['formMode'].currentValue === 'view'
            ) {
                this.trigger$.next('');
                this.updateForm$.next(changes['formMode'].currentValue);
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
        this.dataSource.getTableData(params);
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
}

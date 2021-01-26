import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SecurityContext,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTabChangeEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ExtendPromoComponent } from 'app/shared/components/dropdowns/extend-promo/extend-promo.component';
import { NoticeService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { FlexiCombo } from '../../models';
import { FlexiComboActions } from '../../store/actions';
import * as fromFlexiCombos from '../../store/reducers';
import { FlexiComboSelectors } from '../../store/selectors';

@Component({
    selector: 'app-flexi-combo-list',
    templateUrl: './flexi-combo-list.component.html',
    styleUrls: ['./flexi-combo-list.component.scss'],
    // host: {
    //     class: 'content-card mx-16 sinbad-black-10-border'
    // },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboListComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab = 'all';

    displayedColumns = [
        // 'checkbox',
        'promo-seller-id',
        'promo-name',
        'promo-type',
        'promo-allocation',
        'allocation-value',
        'base',
        'start-date',
        'end-date',
        'status',
        'actions',
    ];

    // search: FormControl = new FormControl('');
    selection: SelectionModel<FlexiCombo>;
    eTriggerBase = TriggerBase;

    dataSource$: Observable<FlexiCombo[]>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @Input() keyword: string;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    today: Date = new Date()

    private type = 0;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private domSanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private matDialog: MatDialog,
        private ngxPermissionsService: NgxPermissionsService,
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$notice: NoticeService
    ) {}

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

    ngOnChanges(changes: SimpleChanges): void {
        // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        // Add '${implements OnChanges}' to the class.

        for (const propName in changes) {
            if (changes.hasOwnProperty(propName)) {
                switch (propName) {
                    case 'keyword':
                        if (!changes['keyword'].isFirstChange()) {
                            this._initTable();
                        }
                        return;
                }
            }
        }
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onChangeStatus(item: FlexiCombo): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(FlexiComboActions.confirmChangeStatus({ payload: item }));

        // const canUpdate = this.ngxPermissionsService.hasPermission('SRM.SR.UPDATE');

        // canUpdate.then((hasAccess) => {
        //     if (hasAccess) {
        //         this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        //         this.store.dispatch(FlexiComboActions.confirmChangeStatus({ payload: item }));
        //     } else {
        //         this._$notice.open('Sorry, permission denied!', 'error', {
        //             verticalPosition: 'bottom',
        //             horizontalPosition: 'right',
        //         });
        //     }
        // });
    }

    onExtend(row?: FlexiCombo): void {

        const dialogRef = this.matDialog.open(ExtendPromoComponent, {
            data: {
                id: row.id,
                start_date: row.startDate,
                end_date: row.endDate,
                status: row.status
            },
            panelClass: 'extend-promo-dialog',
            disableClose: true
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntil(this._unSubs$))
            // .subscribe(fromDialog => {
            //     const { newStartDate, newEndDate } = fromDialog
            //     this.store.dispatch(FlexiComboActions.extendPromoRequest({
            //         payload: {
            //             body: {
            //                 startDate: newStartDate,
            //                 endDate: newEndDate
            //             },
            //             id: row.id
            //         }
            //     }))
            // })
    }

    isDisabled(status: string, date: string): boolean {
        const rowEndDate: Date = new Date(date)
        
        if (status === "inactive" && rowEndDate < this.today) {
            return false
        }

        return true
    }

    onDelete(item: FlexiCombo): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(FlexiComboActions.confirmDeleteFlexiCombo({ payload: item }));

        // const canDelete = this.ngxPermissionsService.hasPermission('SRM.SR.UPDATE');

        // canDelete.then((hasAccess) => {
        //     if (hasAccess) {
        //         this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        //         this.store.dispatch(FlexiComboActions.confirmDeleteFlexiCombo({ payload: item }));
        //     } else {
        //         this._$notice.open('Sorry, permission denied!', 'error', {
        //             verticalPosition: 'bottom',
        //             horizontalPosition: 'right',
        //         });
        //     }
        // });
    }

    onSelectedTab(ev: MatTabChangeEvent): void {
        this.type = ev.index;

        this._onRefreshTable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        // this.table.nativeElement.scrollIntoView(true);
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable();
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state flexiCombos
                this.store.dispatch(FlexiComboActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.selection = new SelectionModel<any>(true, []);

                this.dataSource$ = this.store.select(FlexiComboSelectors.selectAll);
                this.totalDataSource$ = this.store.select(FlexiComboSelectors.getTotalItem);
                this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);

                this._initTable();
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.keyword);

            if (query) {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query,
                    },
                ];
            }

            if (typeof this.type === 'number' && this.type !== 0) {
                let status = null;

                if (this.type === 1) {
                    status = 'active';
                } else if (this.type === 2) {
                    status = 'inactive';
                }

                if (data['search'] && data['search'].length > 0) {
                    data['search'].push({
                        fieldName: 'status',
                        keyword: status,
                    });
                } else {
                    data['search'] = [
                        {
                            fieldName: 'status',
                            keyword: status,
                        },
                    ];
                }
            }

            this.store.dispatch(
                FlexiComboActions.fetchFlexiCombosRequest({
                    payload: data,
                })
            );
        }
    }

    private _onRefreshTable(): void {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this._initTable();
    }
}

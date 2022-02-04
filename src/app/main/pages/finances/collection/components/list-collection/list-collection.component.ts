import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    Input,
    SimpleChanges,
    OnChanges,
    ChangeDetectorRef,
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject, merge } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { IQueryParams } from 'app/shared/models/query.model';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil, flatMap, filter } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Store as NgRxStore } from '@ngrx/store';
import { CollectionActions } from '../../store/actions';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FeatureState as CollectionCoreState } from '../../store/reducers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { HelperService } from 'app/shared/helpers';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { CollectionStatus } from '../../models';
import { CollectionSelectors } from '../../store/selectors';
import * as StatusPaymentLabel from '../../constants';

@Component({
    selector: 'app-list-collection',
    templateUrl: './list-collection.component.html',
    styleUrls: ['./list-collection.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ListCollectionComponent implements OnInit, OnChanges, AfterViewInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;
    @Input()
    form: FormGroup;

    @Input() viewByType: string = 'cStatus';
    @Input() searchBy: string = 'supplierName';
    @Input() searchValue: string = '';
    @Input() approvalStatus: number = 0;

    search: FormControl = new FormControl();
    selection: SelectionModel<CollectionStatus>;
    dataSource$: Observable<Array<CollectionStatus>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void> = new Subject<void>();

    public totalLength: number = 10;
    public size: number = 5;
    public totalDataSource: number;
    public totalDataSourceBilling: number;
    public labelNoRecord = 'No data available';

    displayedColumnsCollection = [
        'finance-collection-code',
        'finance-store-name',
        'finance-collection-amount',
        'finance-collection-date',
        'finance-collection-due-date',
        'finance-sales-rep',
        'finance-reason',
        'finance-collection-method',
        'finance-collection-status',
        'action'
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private matDialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private ngxPermissionsService: NgxPermissionsService,
        private CollectionStore: NgRxStore<CollectionCoreState>
    ) {}

    ngOnInit() {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this._initTable();
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<CollectionStatus>(true, []);
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

        if (changes['searchValue']) {
            if (!changes['searchValue'].isFirstChange()) {
                this.search.setValue(changes['searchValue'].currentValue);
                setTimeout(() => this._initTable());
            }
        }

        if (changes['approvalStatus']) {
            if (!changes['approvalStatus'].isFirstChange()) {
                this.approvalStatus = changes['approvalStatus'].currentValue;
                setTimeout(() => this._initTable());
            }
        }

        if (changes['searchBy']) {
            if (!changes['searchBy'].isFirstChange()) {
                this.searchBy = changes['searchBy'].currentValue;
                setTimeout(() => this._initTable());
            }
        }

        if (changes['viewByType']) {
            if (!changes['viewByType'].isFirstChange()) {
                this.viewByType = changes['viewByType'].currentValue;
                setTimeout(() => this._initTable());
            }
        }

        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        }

        this.table.nativeElement.scrollTop = 0;
    }

    openDetailPage(row: any): void {
        this.router.navigate(['/pages/finances/collection/collection/' + row.id]);
        let itemPromoHierarchy = {
            searchBy: this.searchBy,
            approvalStatus: this.approvalStatus,
            keyword: this.searchValue,
        };
        localStorage.setItem('item', JSON.stringify(itemPromoHierarchy));
        localStorage.setItem('isFromDetail', 'true');
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        HelperService.debug('IS ALL SELECTED', { numSelected, numRows });

        return numSelected === numRows;
    }

    openDetailCollectionStatus(data) {
        // localStorage.setItem('detail collection', data);
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
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable();
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state Collection Action
                this.CollectionStore.dispatch(CollectionActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:

                this.paginator.pageSize = this.defaultPageSize;

                this.selection = new SelectionModel<any>(true, []);

                this.dataSource$ = this.CollectionStore.select(CollectionSelectors.selectAll);
                this.totalDataSource$ = this.CollectionStore.select(
                    CollectionSelectors.getTotalItem
                );
                this.isLoading$ = this.CollectionStore.select(CollectionSelectors.getLoadingState);

                this._initTable();
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageIndex + 1,
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            data['paginate'] = true;
            data['keyword'] = this.searchValue;
            if (data['keyword'] !== '') {
                data['skip'] = 0;
                this.labelNoRecord = 'No search found';
            }

            data['type'] = this.viewByType;
            data['searchBy'] = this.searchBy;

            switch (this.approvalStatus) {
                case 0:
                    data['approvalStatus'] = 'all';
                    break;
                case 1:
                    data['approvalStatus'] = 'pending';
                    break;
                case 2:
                    data['approvalStatus'] = 'approved';
                    break;
                case 3:
                    data['approvalStatus'] = 'rejected';
                    break;
                default:
                    break;
            }

            this.CollectionStore.dispatch(
                CollectionActions.fetchCollectionStatusRequest({
                    payload: data,
                })
            );
        }
    }

    getOrderCode(value): string {
        if (value && value.length > 0) {
            const lengthValue = value.length;
            let orderCodes;
            if (lengthValue > 1) {
                orderCodes = value[0] + ' (+' + (lengthValue - 1) + ' more)';
                // tslint:disable-next-line: triple-equals
            } else if (lengthValue == 1) {
                orderCodes = value[0];
            }

            return orderCodes.length > 0 ? orderCodes : '-';
        }

        return '-';
    }

    getOrderRef(value): string {
        if (value && value.length > 0) {
            const lengthValue = value.length;
            let orderRefs;
            if (lengthValue > 1) {
                orderRefs = value[0] + ' (+' + (lengthValue - 1) + ' more)';
                // tslint:disable-next-line: triple-equals
            } else if (lengthValue == 1) {
                orderRefs = value[0];
            }

            return orderRefs.length > 0 ? orderRefs : '-';
        }

        return '-';
    }

    numberFormat(num) {
        if (num) {
            return num
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
    }

    numberFormatFromString(num) {
        let value = parseInt(num);
        if (num) {
            return value
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
    }

    statusLabel(status) {
        switch (status) {
            case StatusPaymentLabel.VALUE_APPROVED_LABEL:
                return StatusPaymentLabel.STATUS_APPROVED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PENDING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
                break;
            case StatusPaymentLabel.VALUE_OVERDUE_LABEL:
                return StatusPaymentLabel.STATUS_OVERDUE_LABEL;
                break;
            case StatusPaymentLabel.VALUE_REJECTED_LABEL:
                return StatusPaymentLabel.STATUS_REJECTED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_WAITING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PAYMENT_FAILED_LABEL:
                return StatusPaymentLabel.STATUS_PAYMENT_FAILED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_WAITING_PAYMENT_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_PAYMENT_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PAID_LABEL:
                return StatusPaymentLabel.STATUS_PAID_LABEL;
                break;
            default:
                return '-';
                break;
        }
    }
}

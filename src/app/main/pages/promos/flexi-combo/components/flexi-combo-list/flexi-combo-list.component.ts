import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class FlexiComboListComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    displayedColumns = [
        'checkbox',
        'promo-seller-id',
        'promo-name',
        'base',
        'start-date',
        'end-date',
        'status',
        'actions',
    ];

    search: FormControl = new FormControl('');
    selection: SelectionModel<FlexiCombo>;
    eTriggerBase = TriggerBase;

    dataSource$: Observable<FlexiCombo[]>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private domSanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private ngxPermissionsService: NgxPermissionsService,
        private store: Store<fromFlexiCombos.FeatureState>
    ) {}

    onChangePage($event: PageEvent): void {}

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

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

            if (query) {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query,
                    },
                ];
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

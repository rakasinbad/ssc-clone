import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
    AfterViewInit,
    SecurityContext,
    OnDestroy,
    Input,
    SimpleChanges,
    OnChanges,
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil, flatMap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { IQueryParams } from 'app/shared/models/query.model';
import { SkpModel } from '../../models';
import { HelperService } from 'app/shared/helpers';
import { DomSanitizer } from '@angular/platform-browser';

import { FeatureState as SkpCoreState } from '../../store/reducers';
import { SkpActions } from '../../store/actions';
import { SkpSelectors } from '../../store/selectors';

@Component({
    selector: 'app-skp-list',
    templateUrl: './skp-list.component.html',
    styleUrls: ['./skp-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class SkpListComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @Input() selectedStatus: string = '';
    @Input() searchValue: string = '';

    search: FormControl = new FormControl();

    displayedColumns = ['skp-name', 'description', 'start-date', 'end-date', 'status', 'actions'];

    selection: SelectionModel<SkpModel>;

    dataSource$: Observable<Array<SkpModel>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    @Input() keyword: string;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;
    public dataSource = [];
    private subs$: Subject<void> = new Subject<void>();
    dataDummy = [
        {id: '1', name: 'SKP Danone', 
        description: 'Example SKP Danone',  
        startDate: '2020-11-30T06:46:00.000Z', 
        endDate: '2020-11-30T06:50:00.000Z', 
        notes: 'test', 
        header: 'SKP Danone', 
        status: 'active',
        createdAt: '',
        updatedAt: '',
        deletedAt: null
     },
        {id: '2', name: 'SKP Unilever', 
        description: 'Example SKP Unilever',  
        startDate: '2020-11-30T06:46:00.000Z', 
        endDate: '2020-11-30T06:50:00.000Z', 
        status: 'inactive',
        notes: 'test', 
        header: 'SKP Unilever', 
        createdAt: '',
        updatedAt: '',
        deletedAt: null },
    ];
    constructor(
        private domSanitizer: DomSanitizer,
        private router: Router,
        private ngxPermissionsService: NgxPermissionsService,
        private SkpStore: NgRxStore<SkpCoreState>
    ) {}

    ngOnInit() {
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<SkpModel>(true, []);
        this.dataSource = this.dataDummy;

        // this.dataSource$ = this.SkpStore.select(SkpSelectors.selectAll).pipe(takeUntil(this.subs$));
        // this.totalDataSource$ = this.SkpStore.select(SkpSelectors.getTotalItem);
        // this.isLoading$ = this.SkpStore.select(SkpSelectors.getIsLoading).pipe(
        //     takeUntil(this.subs$)
        // );

        this._initTable();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // if (changes['searchValue']) {
        //     if (!changes['searchValue'].isFirstChange()) {
        //         this.search.setValue(changes['searchValue'].currentValue);
        //         setTimeout(() => this._initTable());
        //     }
        // }
        if (changes['selectedStatus']) {
            switch(this.selectedStatus) {
                case 'active':
                    this.dataSource = this.dataDummy.filter(item => item.status === 'active');
                break;
                case 'inactive':
                    this.dataSource = this.dataDummy.filter(item => item.status === 'inactive');
                break;
                case 'all':
                    this.dataSource = this.dataDummy;
                break;
            }

        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;
            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.keyword);
            data['keyword'] = query;

            if (this.selectedStatus !== 'all') {
                data['status'] = this.selectedStatus;
            }
           
            this.SkpStore.dispatch(SkpActions.clearState());
            // this.SkpStore.dispatch(
            //     SkpActions.fetchSkpListRequest({
            //         payload: data,
            //     })
            // );

        }
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
    }

    openDetailPage(id): void {
        this.router.navigateByUrl('/pages/skp/detail/'+ id);
    }

    onEditSkp(id): void {
        this.router.navigateByUrl('/pages/skp/'+id);
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }
}

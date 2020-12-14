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
import { skpStoreList } from '../../../models';
import { HelperService } from 'app/shared/helpers';
import { DomSanitizer } from '@angular/platform-browser';

import { FeatureState as SkpCoreState } from '../../../store/reducers';
import { SkpActions } from '../../../store/actions';
import { SkpSelectors } from '../../../store/selectors';

@Component({
  selector: 'app-detail-customer-list',
  templateUrl: './detail-customer-list.component.html',
  styleUrls: ['./detail-customer-list.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCustomerListComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @Input() selectedStatus: string = '';
    @Input() searchValue: string = '';

    search: FormControl = new FormControl();

    displayedColumns = ['storeName', 'storeOwnerName', 'address', 'province', 'skpStatus', 'skpUpdateDate'];

    selection: SelectionModel<skpStoreList>;

    dataSource$: Observable<Array<skpStoreList>>;
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
        {id: '1', storeName: 'Tesno Ali Laundry', 
        storeOwnerName: 'Pak Ali',  
        address: 'Jl. kembangan utara no 11', 
        province: 'Jakarta Utara', 
        skpStatus: 'Agree', 
        skpUpdateDate: '2020-11-30T06:46:00.000Z', 
        start_date: '2020-11-30T06:46:00.000Z', 
        end_date: '2020-11-30T06:50:00.000Z', 
    }, {id: '2', storeName: 'Tika Laundry', 
        storeOwnerName: 'Ibu Tika',  
        address: 'Jl. kembangan utara no 120', 
        province: 'Jakarta Barat', 
        skpStatus: 'Waiting', 
        skpUpdateDate: null, 
        start_date: '2020-11-30T06:46:00.000Z', 
        end_date: '2020-11-30T06:50:00.000Z', 
    },
    ];
    constructor(
        private domSanitizer: DomSanitizer,
        private router: Router,
        private ngxPermissionsService: NgxPermissionsService,
        private SkpStore: NgRxStore<SkpCoreState>
    ) {}

    ngOnInit() {
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<skpStoreList>(true, []);
        this.dataSource = this.dataDummy;

        // this.dataSource$ = this.SkpStore.select(SkpSelectors.selectAll).pipe(takeUntil(this.subs$));
        // this.totalDataSource$ = this.SkpStore.select(SkpSelectors.getTotalItem);
        // this.isLoading$ = this.SkpStore.select(SkpSelectors.getIsLoading).pipe(
        //     takeUntil(this.subs$)
        // );

        this._initTable();
    }

    ngOnChanges(changes: SimpleChanges): void {
        
    }

    private _initTable(): void {
        if (this.paginator) {
            const data = {
                store_limit: this.paginator.pageSize || this.defaultPageSize,
                store_skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            this.SkpStore.dispatch(SkpActions.clearState());
            this.SkpStore.dispatch(
                SkpActions.fetchSkpListDetailStoreRequest({
                    payload: data,
                })
            );

        }
    }

   
    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data = {
            store_limit: this.paginator.pageSize,
            store_skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }
}

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
import { skpPromoList } from '../../../models';
import { HelperService } from 'app/shared/helpers';
import { DomSanitizer } from '@angular/platform-browser';

import { FeatureState as SkpCoreState } from '../../../store/reducers';
import { SkpActions } from '../../../store/actions';
import { SkpSelectors } from '../../../store/selectors';

@Component({
  selector: 'app-detail-promo-list',
  templateUrl: './detail-promo-list.component.html',
  styleUrls: ['./detail-promo-list.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailPromoListComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @Input() selectedStatus: string = '';
    @Input() searchValue: string = '';

    search: FormControl = new FormControl();

    displayedColumns = ['sellerId', 'storeName', 'start_date', 'end_date'];

    selection: SelectionModel<skpPromoList>;

    dataSource$: Observable<Array<skpPromoList>>;
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
        {id: 1, sellerId: 'D011', storeName: 'Tesno Ali Laundry', 
        name: 'Pak Ali',  
        start_date: '2020-11-30T06:46:00.000Z', 
        end_date: '2020-11-30T06:50:00.000Z', 
    }, {id: 2, sellerId: 'D012', storeName: 'Tika Laundry', 
        name: 'Ibu Tika',  
        start_date: '2020-11-30T06:46:00.000Z', 
        end_date: '2020-11-30T06:50:00.000Z', 
    }, {id: 3, sellerId: 'D013', storeName: 'Amin Laundry', 
        name: 'Pak Amin',  
        start_date: '2020-11-30T06:46:00.000Z', 
        end_date: '2020-11-30T06:50:00.000Z', 
    }, {id: 4, sellerId: 'D014', storeName: 'Ayu Market', 
        name: 'Ibu Ayu',  
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
        this.selection = new SelectionModel<skpPromoList>(true, []);
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
                promo_limit: this.paginator.pageSize || this.defaultPageSize,
                promo_skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };
           
            this.SkpStore.dispatch(SkpActions.clearState());
            // this.SkpStore.dispatch(
            //     SkpActions.fetchSkpListDetailPromoRequest({
            //         payload: data,
            //     })
            // );

        }
    }

   
    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data = {
            promo_limit: this.paginator.pageSize,
            promo_skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }
}

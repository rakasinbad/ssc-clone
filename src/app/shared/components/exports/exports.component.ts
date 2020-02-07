import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild, SecurityContext } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';
import { Export } from './models/exports.model';
import { User, UserStatus, IQueryParams } from 'app/shared/models';
import { Subject, Observable } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';
import { fromExport } from './store/reducers';
import { ExportActions } from './store/actions';
import { ExportSelector } from './store/selectors';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'sinbad-export',
    templateUrl: './exports.component.html',
    styleUrls: ['./exports.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportsComponent implements OnInit, OnDestroy {

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    search: string;
    isLoading$: Observable<boolean>;
    totalDataSource$: Observable<number>;
    subs$: Subject<void> = new Subject<void>();

    displayedColumns: Array<string> = [
        'user',
        'date',
        // 'fileName',
        'progress'
    ];

    dataSource: Array<Export> = [
        // {
        //     id: '1',
        //     type: 'export',
        //     status: 'done',
        //     url: 'https://www.google.com',
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //     deletedAt: null,
        //     userId: '1',
        //     user: new User({
        //         id: '1',
        //         fullName: 'Jajang Nurjaman',
        //         email: 'dion@toko1.co.id',
        //         mobilePhoneNo: '08966666621',
        //         idNo: '9123818910909012',
        //         taxNo: '9123818910909012',
        //         status: UserStatus.ACTIVE,
        //         idImageUrl: 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/user-id-images/image_1579756604741.png',
        //         selfieImageUrl: 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/user-selfie-images/image_1579756604810.png',
        //         urbanId: '1',
        //         createdAt: '2020-01-23T04:54:49.226Z',
        //         updatedAt: '2020-01-23T05:16:44.868Z',
        //         phoneNo: null,
        //         deletedAt: null,
        //         joinDate: null,
        //         userCode: null,
        //         imageUrl: null,
        //         taxImageUrl: null,
        //         saleTeamId: null,
        //     })
        // }
    ];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    constructor(
        private readonly sanitizer: DomSanitizer,
        private exportStore: NgRxStore<fromExport.State>,
        private _cd: ChangeDetectorRef,
    ) {
        this.isLoading$ = this.exportStore.select(ExportSelector.getLoadingState);
        this.totalDataSource$ = this.exportStore.select(ExportSelector.getTotalExports);
    }

    private refreshTable(): void {
        if (this.paginator) {
            // Menyiapkan query params yang akan dilempar.
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            // Menyalakan pagination.
            data['paginate'] = true;

            // Mengurutkan log export berdasarkan kapan dibuat.
            data['sort'] = 'desc';
            data['sortBy'] = 'created_at';

            if (this.search) {
                data['keyword'] = this.search;
            }
    
            this.exportStore.dispatch(ExportActions.fetchExportLogsRequest({
                payload: data
            }));
        }
    }

    onSearch(value: string): void {
        const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, value);
        this.search = searchValue;

        this.exportStore.dispatch(ExportActions.truncateExportLogs());
        setTimeout(() => this.refreshTable(), 100);
    }

    ngOnInit(): void {
        this.exportStore.select(ExportSelector.getAllExports)
            .pipe(
                takeUntil(this.subs$)
            ).subscribe(logs => {
                this.dataSource = logs;
                this._cd.markForCheck();
            });

        this.paginator.page
        .pipe(
            takeUntil(this.subs$)
        ).subscribe(() => {
            this.exportStore.dispatch(ExportActions.truncateExportLogs());
            // this.refreshTable();
            setTimeout(() => this.refreshTable(), 100);
        });

        // this.refreshTable();
        setTimeout(() => this.refreshTable(), 100);
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.exportStore.dispatch(ExportActions.setExportPage({ payload: '' }));
        this.exportStore.dispatch(ExportActions.truncateExportLogs());
    }

}

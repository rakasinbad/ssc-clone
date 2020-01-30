import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';
import { Export } from './models/exports.model';
import { User, UserStatus } from 'app/shared/models';
import { Subject } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';
import { fromExport } from './store/reducers';
import { ExportActions } from './store/actions';
import { ExportSelector } from './store/selectors';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-exports',
    templateUrl: './exports.component.html',
    styleUrls: ['./exports.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportsComponent implements OnInit, OnDestroy {

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

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

    constructor(
        private exportStore: NgRxStore<fromExport.State>,
        private _cd: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.exportStore.dispatch(ExportActions.fetchExportLogsRequest({
            payload: {
                paginate: true,
                skip: 0,
                limit: this.defaultPageSize
            }
        }));

        this.exportStore.select(ExportSelector.getAllExports)
            .pipe(
                takeUntil(this.subs$)
            ).subscribe(logs => {
                this.dataSource = logs;
                this._cd.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.exportStore.dispatch(ExportActions.truncateExportLogs());
    }

}

import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-import-history',
    templateUrl: './import-history.component.html',
    styleUrls: ['./import-history.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportHistoryComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        'user',
        'created',
        'file-name',
        'action',
        'processed',
        'status',
        'progress'
    ];
    dataSource = [
        {
            user: 'Fortnite',
            createdAt: 'Des 16, 2019 04:25:32 PM',
            fileName: 'Store1234',
            action: 'Update Store',
            processed: '100',
            status: 'active',
            progress: 'Success'
        },
        {
            user: 'Fortnite',
            createdAt: 'Des 17, 2019 04:25:32 PM',
            fileName: 'Store1234',
            action: 'Update Store',
            processed: '62',
            status: 'inactive',
            progress: 'Download Error Report'
        }
    ];

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}

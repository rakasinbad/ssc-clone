import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-template-history',
    templateUrl: './template-history.component.html',
    styleUrls: ['./template-history.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateHistoryComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = ['id', 'date', 'type', 'username', 'status', 'download'];
    dataSource = [
        {
            id: '3138224',
            userName: 'Fortnite Mart',
            createdAt: 'Des 16, 2019 04:25:32 PM',
            type: 'Update Store',
            status: 'Finished',
            download: true
        },
        {
            id: '3138225',
            userName: 'Fortnite Mart',
            createdAt: 'Des 17, 2019 04:25:32 PM',
            type: 'Update Store',
            status: 'Failed',
            download: false
        }
    ];

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}

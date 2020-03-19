import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-merchant-segmentation',
    templateUrl: './merchant-segmentation.component.html',
    styleUrls: ['./merchant-segmentation.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSegmentationComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-20 mx-16 mb-16',
        title: {
            label: 'Table'
        },
        search: {
            active: true
        }
        // add: {
        //     permissions: [],
        // },
        // export: {
        //     permissions: [],
        //     useAdvanced: true,
        //     pageType: ''
        // }
        // import: {
        //     permissions: [''],
        //     useAdvanced: true,
        //     pageType: ''
        // },
    };

    dataSource = new MatTableDataSource([
        {
            id: '001',
            name:
                'Rumah sakit/Rumah sakit bersalin/rumah sakit bersalin 1/Large capacity/Large capacity 1',
            level: '2',
            desc: 'Lorem ipsum',
            store: '5',
            status: 'active'
        },
        {
            id: '002',
            name:
                'Rumah sakit/Rumah sakit bersalin/rumah sakit bersalin 1/Large capacity/Large capacity 1',
            level: '2',
            desc: 'Lorem ipsum',
            store: '5',
            status: 'inactive'
        }
    ]);
    displayedColumns = [
        'branch-id',
        'segment-branch',
        'branch-level',
        'desc',
        'total-store',
        'status',
        'actions'
    ];

    search: FormControl = new FormControl('');

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}

import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-merchant-segmentation-alert',
    templateUrl: './merchant-segmentation-alert.component.html',
    styleUrls: ['./merchant-segmentation-alert.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSegmentationAlertComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    dialogTitle: string;

    displayedColumns = [
        'store-id',
        'store-name',
        'store-type',
        'store-group',
        'store-channel',
        'store-cluster'
    ];
    dataSource = new MatTableDataSource([
        {
            storeId: '1',
            storeName: 'Toko ABC',
            storeType: 'Apotek 2',
            storeGroup: 'Watson',
            storeChannel: 'MT',
            storeCluster: 'Toko Susu'
        },
        {
            storeId: '2',
            storeName: 'Toko ABC',
            storeType: 'Apotek 1',
            storeGroup: null,
            storeChannel: 'GT',
            storeCluster: null
        }
    ]);

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject();

    constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
        this.dialogTitle = this.data.title;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
}

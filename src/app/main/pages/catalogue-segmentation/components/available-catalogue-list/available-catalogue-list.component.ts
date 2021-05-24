import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-available-catalogue-list',
    templateUrl: './available-catalogue-list.component.html',
    styleUrls: ['./available-catalogue-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailableCatalogueListComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    constructor() {}

    ngOnInit(): void {}
}

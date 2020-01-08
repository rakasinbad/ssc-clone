import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Inject } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MAT_DIALOG_DATA } from '@angular/material';
import { IPortfolioAddForm } from '../../models/portfolios.model';
import { Store } from '../../models';

@Component({
    selector: 'app-portfolios-conflict-stores',
    templateUrl: './portfolios-conflict-stores.component.html',
    styleUrls: ['./portfolios-conflict-stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosConflictStoresComponent implements OnInit {

    displayedColumns: Array<string> = [
        'storeCode',
        'storeName',
        'portfolioCode',
        'portfolioName'
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { formData: IPortfolioAddForm; conflictStores: Array<Store> }
    ) { }

    ngOnInit(): void {}

}

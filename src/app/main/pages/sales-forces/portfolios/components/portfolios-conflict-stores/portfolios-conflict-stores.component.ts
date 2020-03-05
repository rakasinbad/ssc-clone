import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from 'app/main/pages/accounts/merchants/models';

import { IPortfolioAddForm } from '../../models/portfolios.model';

@Component({
    selector: 'app-portfolios-conflict-stores',
    templateUrl: './portfolios-conflict-stores.component.html',
    styleUrls: ['./portfolios-conflict-stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosConflictStoresComponent implements OnInit {
    displayedColumns: Array<string> = ['storeCode', 'storeName', 'portfolioCode', 'portfolioName'];

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { formData: IPortfolioAddForm; conflictStores: Array<Store> }
    ) {}

    ngOnInit(): void {}
}

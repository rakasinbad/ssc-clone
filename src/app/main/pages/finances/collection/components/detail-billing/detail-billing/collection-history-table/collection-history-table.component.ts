import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-collection-history-table',
    templateUrl: './collection-history-table.component.html',
    styleUrls: ['./collection-history-table.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class CollectionHistoryTableComponent implements OnInit {
    displayedColumnsCollectionHistory = [
        'finance-collection-code',
        'finance-billing-date',
        'finance-paid-amount',
        'finance-method-payment',
        'finance-sales-rep-name',
        'finance-collection-status',
        'finance-billing-status',
        'finance-reason',
        'finance-updatedby',
        'finance-action',
    ];

    constructor() {}

    ngOnInit() {}
}

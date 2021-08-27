import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-list-collection',
    templateUrl: './list-collection.component.html',
    styleUrls: ['./list-collection.component.scss'],
})
export class ListCollectionComponent implements OnInit {
    @Input() viewByPromo: string = '';

    displayedColumnsCollection = [
        'finance-collection-code',
        'finance-collection-method',
        'finance-collection-ref',
        'finance-collection-amount',
        'finance-collection-date',
        'finance-collection-due-date',
        'finance-collection-status',
        'finance-sales-rep',
        'finance-external-id',
        'finance-store-name',
        'finance-order-code',
        'finance-order-ref',
        'finance-reason',
    ];

    displayedColumnsBilling = [
        'finance-external-id',
        'finance-store-name',
        'finance-order-code',
        'finance-order-ref',
        'finance-total-amount',
        'finance-order-due-date',
        'finance-payment-status',
        'finance-sales-rep',
        'finance-collect-code',
        'finance-collection-ref',
        'finance-collection-amount',
        'finance-collection-date',
        'finance-collection-status',
        'finance-billing-code',
        'finance-materai',
        'finance-total-bill-amount',
        'finance-bill-date',
        'finance-bill-status',
        'finance-reason'
    ];

    constructor() {}

    ngOnInit() {}
}

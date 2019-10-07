import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-account-merchant-quick-panel',
    templateUrl: './account-merchant-quick-panel.component.html',
    styleUrls: ['./account-merchant-quick-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AccountMerchantQuickPanelComponent implements OnInit {
    accountStores: any;

    constructor() {}

    ngOnInit(): void {
        this.accountStores = {
            id: '1',
            userId: '1',
            storeId: '1',
            status: 'active',
            createdAt: '2019-09-08T08:21:12.818Z',
            updatedAt: '2019-09-08T08:21:12.818Z',
            deletedAt: null,
            store: {
                id: '1',
                partnerOdooUsername: '16060613',
                partnerOdooId: '13386',
                name: 'BUDI JAYA',
                address: 'Apt. 419',
                longitude: 106.865036,
                latitude: -6.17511,
                largeArea: null,
                phoneNo: '0454 9911 4606',
                status: 'active',
                storeTypeId: '1',
                storeGroupId: '1',
                storeSegmentId: '1',
                urbanId: '1',
                warehouseId: '1',
                createdAt: '2019-09-08T08:21:12.807Z',
                updatedAt: '2019-09-08T08:21:12.807Z',
                deletedAt: null,
                storeConfig: {
                    id: '1',
                    startingWorkHour: '07:00:00',
                    finishedWorkHour: '16:00:00',
                    status: 'active',
                    storeId: '1',
                    createdAt: '2019-09-08T08:21:12.897Z',
                    updatedAt: '2019-09-08T08:21:12.897Z',
                    deletedAt: null
                }
            }
        };
    }
}

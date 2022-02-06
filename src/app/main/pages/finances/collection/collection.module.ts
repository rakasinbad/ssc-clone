import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionNgrxModule } from './store/collection-ngrx.module';

import { CollectionComponent } from './collection.component';
import { DetailCollectionComponent } from './components/detail-collection/detail-collection.component';
import { ListCollectionComponent } from './components/list-collection/list-collection.component';
import { DetailCollectionTableComponent } from './components/detail-collection/detail-collection-table/detail-collection-table.component';
import { DetailCollectionInfoComponent } from './components/detail-collection/detail-collection-info/detail-collection-info.component';
import { DetailCollectionSalesComponent } from './components/detail-collection/detail-collection-sales/detail-collection-sales.component';
import { ListBillingComponent } from './components/list-billing/list-billing.component';
import { DetailBillingComponent } from './components/detail-billing/detail-billing/detail-billing.component';
import { DetailBillingGeneralinfoComponent } from './components/detail-billing/detail-billing/detail-billing-generalinfo/detail-billing-generalinfo.component';
import { CollectionHistoryTableComponent } from './components/detail-billing/detail-billing/collection-history-table/collection-history-table.component';
import { ModalDetailTableBillingComponent } from './components/modal/modal-detail-table-billing/modal-detail-table-billing.component';

@NgModule({
    declarations: [
        CollectionComponent,
        DetailCollectionComponent,
        ListCollectionComponent,
        DetailCollectionTableComponent,
        DetailCollectionInfoComponent,
        DetailCollectionSalesComponent,
        ListBillingComponent,
        DetailBillingComponent,
        DetailBillingGeneralinfoComponent,
        CollectionHistoryTableComponent,
        ModalDetailTableBillingComponent,
    ],

    imports: [
        CommonModule,
        CollectionRoutingModule,

        SharedModule,
        MaterialModule,
        SharedComponentsModule,
        RxReactiveFormsModule,
        NgxPermissionsModule.forChild(),

        // Ngrx Store
        CollectionNgrxModule,
    ],
    exports: [
        ModalDetailTableBillingComponent
    ],
    entryComponents: [
        ModalDetailTableBillingComponent
    ]
})
export class CollectionModule {}

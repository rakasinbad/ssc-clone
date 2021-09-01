import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { FinanceDetailCollection } from '../../models';
import { CollectionActions } from '../../store/actions';
import * as collectionStatus from '../../store/reducers';
import { CollectionSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-detail-collection',
    templateUrl: './detail-collection.component.html',
    styleUrls: ['./detail-collection.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCollectionComponent implements OnInit {
    public dataDetail: any;

    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Finance',
        },
        {
            title: 'Collection',
        },
        {
            title: 'Collection Details',
            active: true,
        },
    ];

    public detailCollection = [
        {
            id: 197,
            paymentCollectionMethod: {
                id: 380,
                refNo: 'tyo333',
                collectionCode: null,
                collectionRef: null,
                amount: 50000,
                stamp: {
                    id: 4,
                    name: 'Rp10.000',
                    nominal: 10000,
                },
                totalAmount: 60000,
                usedAmount: 60000,
                createdDate: '2021-04-01 11:09:45',
                paymentCollectionType: {
                    id: 3,
                    name: 'Giro',
                    code: 'giro',
                },
                bankFrom: {
                    id: 1,
                    name: 'BCA',
                    code: '014',
                    displayName: 'Bank BCA',
                },
                bankToAccount: null,
                date: '2021-04-01 00:00:00',
                dueDate: '2021-04-02 00:00:00',
                approvalStatus: 'pending',
                balance: 50000,
                approvalReason: '',
                suplierResponse: {
                    id: 1439,
                    supplierId: 2,
                    storeId: 0,
                    StoreExternalId: 'GGSTR000000203',
                    name: 'Toko Import Edit',
                },
                salesmanCode: '',
                salesmanName: '',
            },
            billingPayment: [
                {
                    storeExternalId: 'GGSTR000000203',
                    storeName: 'Toko Import',
                    orderCode: 'S010001014503725',
                    orderRef: null,
                    totalAmount: 0,
                    dueDate: '2021-04-02 00:00:00',
                    statusPayment: '',
                    salesmanName: '',
                    billingPaymentCode: null,
                    billingAmount: 385000,
                    stampNominal: 10000,
                    totalBillingAmount: 395000,
                    createdAt: '2021-04-01 11:09:45',
                    approvalStatus: 'pending',
                    approvalReason: null,
                },
                {
                  storeExternalId: 'GGSTR000000201',
                  storeName: 'Toko Import ABC',
                  orderCode: 'S010001014503721',
                  orderRef: null,
                  totalAmount: 0,
                  dueDate: '2021-04-03 00:00:00',
                  statusPayment: '',
                  salesmanName: '',
                  billingPaymentCode: null,
                  billingAmount: 3850000,
                  stampNominal: 10010,
                  totalBillingAmount: 395030,
                  createdAt: '2021-04-01 11:09:45',
                  approvalStatus: 'rejected',
                  approvalReason: null,
              },
            ],
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<collectionStatus.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    ngOnInit() {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs,
            })
        );
    }

    onClickBack(): void {
        this.router.navigateByUrl('/pages/finances/collection');
        localStorage.clear();
    }
}

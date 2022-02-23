import {
    Component,
    Input,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import Viewer from 'viewerjs';
import { CollectionActions } from '../../../store/actions';
import * as fromCollectionPhoto from '../../../store/reducers';
import { CollectionDetailSelectors, CollectionPhotoSelectors } from '../../../store/selectors';
import { ActivatedRoute } from '@angular/router';
import { FinanceDetailCollection } from '../../../models';
import * as StatusPaymentLabel from '../../../constants';
import { NoticeService } from 'app/shared/helpers';

@Component({
    selector: 'app-detail-collection-sales',
    templateUrl: './detail-collection-sales.component.html',
    styleUrls: ['./detail-collection-sales.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCollectionSalesComponent implements OnInit, OnDestroy {
    detailCollection$: Observable<FinanceDetailCollection>;
    isLoading$: Observable<boolean>;
    public idDetail: number;
    private subs: Subscription = new Subscription();
    private image$: Observable<any>;
    subsData: Subscription;

    collectionId: number;
    isLoadingPhoto$: Observable<boolean>;
    isLoadingPhotoSkp$: Observable<boolean>;
    collectionMethodType: string = '';

    CASH = StatusPaymentLabel.CASH;
    CHECK = StatusPaymentLabel.CHECK;
    GIRO = StatusPaymentLabel.GIRO;
    TRANSFER = StatusPaymentLabel.TRANSFER;

    constructor(
        private store: Store<fromCollectionPhoto.FeatureState>,
        private route: ActivatedRoute,
        private _$notice: NoticeService
    ) {}

    ngOnInit() {
        const { id } = this.route.snapshot.params;
        this.detailCollection$ = this.store.select(CollectionDetailSelectors.getSelectedItem);
        this.collectionId = id;

        this.subsData = this.detailCollection$.subscribe((val) => {
            if (val) {
                if (val.data.paymentCollectionMethod.paymentCollectionType.code !== 'sales_return') {
                    this.store.dispatch(
                        CollectionActions.fetchCollectionPhotoRequest({
                            payload: { id: this.collectionId },
                        })
                    );
                }
            }
        })
        

        this.isLoadingPhoto$ = this.store.select(CollectionPhotoSelectors.getIsLoading);
        this.isLoadingPhotoSkp$ = this.store.select(CollectionPhotoSelectors.getIsLoading);
    }

    initViewerImage = (image, type: string): void => {
        let imgView: string;
        let text: string;
        if (type == 'promo') {
            if (image.skpImage == null) {
                this._$notice.open('Photo Not Available', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            } else {
                imgView = 'data:image/jpeg;base64,' + image.skpImage;
                text = 'Promotion Cooperation Letter';
                this.viewerImage(imgView, text);
            }
        } else if (type == 'other') {
            if (image.image == null) {
                this._$notice.open('Photo Not Available', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            } else {
                imgView = 'data:image/jpeg;base64,' + image.image;
                text = 'Collection Photo';
                this.viewerImage(imgView, text);
            }
        }
    };

    viewerImage(src: string, text: string) {
        const imgSrc = src;
        const imgEl = document.createElement('img');
        imgEl.src = imgSrc;
        imgEl.alt = text;
        const viewerImg = new Viewer(imgEl, {
            inline: false,
        });

        viewerImg.show();
    }

    onClickViewImage = (type: string): void => {
        this.collectionMethodType = type;
        this.image$ = this.store.select(CollectionPhotoSelectors.getId);

        const sub = this.image$.subscribe({
            next: (resp) => {
                    this.initViewerImage(resp, this.collectionMethodType);
            },
        });

        this.subs.add(sub);

    };

    onClickViewPromotion = (type: string): void => {
        this.collectionMethodType = type;
        this.image$ = this.store.select(CollectionPhotoSelectors.getId);

        const sub = this.image$.subscribe({
            next: (resp) => {
                    this.initViewerImage(resp, this.collectionMethodType);
            },
        });

        this.subs.add(sub);
    };

    ngOnDestroy(): void {
        if (!this.subs.closed) {
            this.subs.unsubscribe();
        }
        this.clearCollectionPhotoState();
        this.clearCollectionPhotoStateSkp();
    }

    clearCollectionPhotoState = (): void => {
        this.store.dispatch(CollectionActions.clearCollectionPhoto());
    };
    clearCollectionPhotoStateSkp = (): void => {
        this.store.dispatch(CollectionActions.clearCollectionPhoto());
    };
}

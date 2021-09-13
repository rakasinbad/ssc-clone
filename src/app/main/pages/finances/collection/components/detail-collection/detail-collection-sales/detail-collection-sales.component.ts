import {
    Component,
    Input,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ViewEncapsulation,
    ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import Viewer from 'viewerjs';
import { CollectionActions } from '../../../store/actions';
import * as fromCollectionPhoto from '../../../store/reducers';
import { CollectionDetailSelectors, CollectionPhotoSelectors } from '../../../store/selectors';
import { ActivatedRoute } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FinanceDetailCollection } from '../../../models';
import * as collectionStatus from '../../../store/reducers';
import { Router } from '@angular/router';
import * as StatusPaymentLabel from '../../../constants';

@Component({
    selector: 'app-detail-collection-sales',
    templateUrl: './detail-collection-sales.component.html',
    styleUrls: ['./detail-collection-sales.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCollectionSalesComponent implements OnInit, OnDestroy {
    @Input() detailData;

    detailCollection$: Observable<FinanceDetailCollection>;
    isLoading$: Observable<boolean>;
    public idDetail: number;
    private subs: Subscription = new Subscription();
    private collectionPhoto$: Observable<any>;

    collectionId: number;
    isLoadingPhoto$: Observable<boolean>;

    constructor(private store: Store<fromCollectionPhoto.FeatureState>, 
        private storeDetail: Store<collectionStatus.FeatureState>,
        private cdRef: ChangeDetectorRef,
        private route: ActivatedRoute) {}

    ngOnInit() {
        this.detailCollection$ = this.store.select(CollectionDetailSelectors.getSelectedItem);
        const { id } = this.route.snapshot.params;
        
        this.collectionId = id;
        this.collectionPhoto$ = this.store.select(CollectionPhotoSelectors.getImage);
        const sub = this.collectionPhoto$.subscribe({
            next: (resp) => {
                if (resp) {
                    this.initViewerImage(resp);
                }
            },
        });
        this.subs.add(sub);

        this.isLoadingPhoto$ = this.store.select(CollectionPhotoSelectors.getIsLoading);
    }

    initViewerImage = (image: string): void => {
        const imgSrc = 'data:image/jpeg;base64,' + image;

        const imgEl = document.createElement('img');
        imgEl.src = imgSrc;
        imgEl.alt = 'Collection Photo';

        const viewer = new Viewer(imgEl, {
            inline: false,
        });
        viewer.show();
    };

    onClickViewImage = (): void => {
        this.clearCollectionPhotoState();
        this.store.dispatch(
            CollectionActions.fetchCollectionPhotoRequest({
                payload: { id: this.collectionId },
            })
        );
    };

    ngOnDestroy(): void {
        if (!this.subs.closed) {
            this.subs.unsubscribe();
        }
        this.clearCollectionPhotoState();
    }

    clearCollectionPhotoState = (): void => {
        this.store.dispatch(CollectionActions.clearCollectionPhoto());
    };
}

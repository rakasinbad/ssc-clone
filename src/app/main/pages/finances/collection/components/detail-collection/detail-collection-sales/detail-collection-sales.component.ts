import {
    Component,
    Input,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import Viewer from 'viewerjs';
import { CollectionActions } from '../../../store/actions';
import * as fromCollectionPhoto from '../../../store/reducers';
import { CollectionDetailSelectors, CollectionPhotoSelectors } from '../../../store/selectors';
// import { fuseAnimations } from '@fuse/animations';
// import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
// import { Store } from '@ngrx/store';
// import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
// import { UiActions } from 'app/shared/store/actions';
// import { Observable } from 'rxjs';

// import { locale as english } from '../../../i18n/en';
// import { locale as indonesian } from '../../../i18n/id';
// import { FinanceDetailCollection } from '../../../models';
// import { CollectionActions } from '../../../store/actions';
// import * as collectionStatus from '../../../store/reducers';
// import { CollectionSelectors } from '../../../store/selectors';
// import { IQueryParams } from 'app/shared/models/query.model';
// import { Router } from '@angular/router';

@Component({
    selector: 'app-detail-collection-sales',
    templateUrl: './detail-collection-sales.component.html',
    styleUrls: ['./detail-collection-sales.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCollectionSalesComponent implements OnInit, OnDestroy {
    @Input() detailData: any;

    private subs: Subscription = new Subscription();
    private collectionPhoto$: Observable<any>;

    collectionId: number;
    isLoadingPhoto$: Observable<boolean>;

    constructor(private store: Store<fromCollectionPhoto.FeatureState>) {}

    ngOnInit() {
        this.collectionId = this.detailData[0].id;
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

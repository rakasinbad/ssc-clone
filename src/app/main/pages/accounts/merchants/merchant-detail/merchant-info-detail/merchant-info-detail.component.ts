import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { BrandStore } from '../../models';
import { BrandStoreActions } from '../../store/actions';
import { fromMerchant } from '../../store/reducers';
import { BrandStoreSelectors } from '../../store/selectors';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';

@Component({
    selector: 'app-merchant-info-detail',
    templateUrl: './merchant-info-detail.component.html',
    styleUrls: ['./merchant-info-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantInfoDetailComponent implements OnInit, OnDestroy {
    brandStore$: Observable<BrandStore>;
    isLoading$: Observable<boolean>;

    constructor(
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private store: Store<fromMerchant.FeatureState>
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        const { id } = this.route.parent.snapshot.params;

        this.brandStore$ = this.store.select(BrandStoreSelectors.getSelectedBrandStoreInfo);
        this.isLoading$ = this.store.select(BrandStoreSelectors.getIsLoading);
        this.store.dispatch(BrandStoreActions.fetchBrandStoreRequest({ payload: id }));
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(BrandStoreActions.resetBrandStore());
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    safeValue(item: any): any {
        return item ? item : '-';
    }

    onShowImage(imageUrl: string, title: string): void {
        this.matDialog.open(ShowImageComponent, {
            data: {
                title: title || '',
                url: imageUrl || ''
            },
            disableClose: true
        });
    }
}

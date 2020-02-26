import {
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';

import { IQueryParams, Catalogue } from 'app/shared/models';
import { fromCatalogue } from 'app/main/pages/catalogues/store/reducers';
import { CatalogueSelectors } from 'app/main/pages/catalogues/store/selectors';
import { map, takeUntil } from 'rxjs/operators';
import { CatalogueActions } from 'app/main/pages/catalogues/store/actions';

@Component({
    selector: 'app-find-sku',
    templateUrl: './find-sku.component.html',
    styleUrls: ['./find-sku.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FindSkuComponent implements OnInit, OnDestroy {
    // Untuk keperluan subscription.
    subs$: Subject<string> = new Subject<string>();

    // Untuk menyimpan daftar catalogue yang tersedia untuk dipilih.
    availableCatalogues$: Observable<Array<Catalogue>>;

    constructor(private catalogueStore: NgRxStore<fromCatalogue.FeatureState>) {
        this.availableCatalogues$ = this.catalogueStore
            .select(CatalogueSelectors.getAllCatalogues)
            .pipe(
                map(catalogues => {
                    if (catalogues.length === 0) {
                        this.catalogueStore.dispatch(
                            CatalogueActions.fetchCataloguesRequest({
                                payload: {
                                    paginate: true
                                }
                            })
                        );
                    }

                    return catalogues;
                }),
                takeUntil(this.subs$)
            );
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }
}

import {
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';

import { IQueryParams, Catalogue } from 'app/shared/models';
import { fromCatalogue } from 'app/main/pages/catalogues/store/reducers';
import { CatalogueSelectors } from 'app/main/pages/catalogues/store/selectors';
import { map, takeUntil, tap } from 'rxjs/operators';
import { SkuAssignmentsActions } from '../../store/actions';
import { CatalogueActions } from 'app/main/pages/catalogues/store/actions';
import { MatSelectionListChange } from '@angular/material';
import { SkuAssignmentsSelectors } from '../../store/selectors';
import { fromSkuAssignments } from '../../store/reducers';

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

    // untuk menampilkan selected sku
    selectedSku$: Observable<Array<Catalogue>>;

    selectedSkuSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();

    constructor(
        private catalogueStore: NgRxStore<fromCatalogue.FeatureState>,
        private skuAssignmentStore: NgRxStore<fromSkuAssignments.SkuAssignmentsState>
    ) {
        // ini untuk menampilkan sku yang sudah ke select
        // TODO: Menampilkan catalogue yang sudah terasosiasi atau akan terasosiasi.
        this.selectedSku$ = combineLatest([
            this.skuAssignmentStore.select(SkuAssignmentsSelectors.getAllSkuAssignments),
            this.skuAssignmentStore.select(SkuAssignmentsSelectors.getCatalogueNewStores)
        ]).pipe(
            map(([skuAssignment, catalogues]) => {
                // Mendapatkan ID catalogue dari catalogue-nya warehouse.
                const catalogueIds = skuAssignment.map(skuAssignExist => skuAssignExist.id);
                // Mendapatkan ID catalogue dari catalogue yang terpilih.
                const selectedCatalogueIds = catalogues.map(skuAssign => skuAssign.id);
                // Menggabungkan catalogue dari catalogue-nya warehouse dengan catalogue yang terpilih.
                const mergedStores = skuAssignment.concat(catalogues);

                return mergedStores.map((catalogue: Catalogue) => {
                    const newCatalogue = new Catalogue(catalogue);

                    if (catalogueIds.includes(catalogue.id)) {
                        newCatalogue.source = 'list';
                    } else if (selectedCatalogueIds.includes(catalogue.id)) {
                        newCatalogue.source = 'fetch';
                    }

                    return newCatalogue;
                });
            }),
            takeUntil(this.subs$)
        );

        // ini untuk menangani (checklist / uncheck) assignment sku to warehouse
        this.selectedSkuSub$
            .pipe(
                tap($event => {
                    const sku = $event.option.value as Catalogue;
                    const isSelected = $event.option.selected;

                    if (sku.source === 'fetch') {
                        if (isSelected) {
                            this.catalogueStore.dispatch(
                                SkuAssignmentsActions.addSelectedCatalogues({
                                    payload: [sku]
                                })
                            );
                        } else {
                            this.catalogueStore.dispatch(
                                SkuAssignmentsActions.removeSelectedCatalogues({
                                    payload: [sku.id]
                                })
                            );
                        }
                    } else if (sku.source === 'list') {
                        if (!isSelected) {
                            this.catalogueStore.dispatch(
                                SkuAssignmentsActions.markCatalogueAsRemovedFromWarehouse({
                                    payload: sku.id
                                })
                            );
                        } else {
                            this.catalogueStore.dispatch(
                                SkuAssignmentsActions.abortCatalogueAsRemovedFromWarehouse({
                                    payload: sku.id
                                })
                            );
                        }
                    }
                })
            )
            .subscribe();

        // Get List Catalogue
        this.availableCatalogues$ = combineLatest([
            this.catalogueStore.select(CatalogueSelectors.getAllCatalogues),
            this.selectedSku$
        ]).pipe(
            map(([availableCatalogues, selectedCatalogues]) => {
                // Mengambil ID dari store yang sudah terasosiasi dengan portfolio.
                const selectedCatalogueIds = selectedCatalogues.map(
                    getCatalogue => getCatalogue.id
                );

                // Mengubah state toko tersebut tidak terpilih.
                const newListCatalogue = availableCatalogues.map(catalogue => {
                    let newCatalogue = new Catalogue(catalogue);

                    // Hanya menandai toko yang ada di portfolio, namun tidak ditandai akan dihapus nantinya.
                    if (selectedCatalogueIds.includes(newCatalogue.id)) {
                        const selectedCatalogue = selectedCatalogues.find(
                            selectCat => selectCat.id === newCatalogue.id
                        );

                        if (selectedCatalogue && newCatalogue.source === 'list') {
                            newCatalogue = new Catalogue(selectedCatalogue);
                            newCatalogue.source = 'list';
                            newCatalogue.isSelected = !!!selectedCatalogue.deletedAt;
                        } else if (selectedCatalogue) {
                            newCatalogue = new Catalogue(selectedCatalogue);
                            newCatalogue.isSelected = !!!selectedCatalogue.deletedAt;
                        }
                    } else {
                        newCatalogue.isSelected = false;
                    }

                    return newCatalogue;
                });

                return newListCatalogue;
            }),
            takeUntil(this.subs$)
        );
    }

    ngOnInit(): void {
        this.catalogueStore.dispatch(
            CatalogueActions.fetchCataloguesRequest({
                payload: {
                    paginate: true
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.selectedSkuSub$.next();
        this.selectedSkuSub$.complete();
    }
}

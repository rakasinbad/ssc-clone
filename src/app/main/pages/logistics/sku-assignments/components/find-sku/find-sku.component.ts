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

import { IQueryParams } from 'app/shared/models/query.model';
import { map, takeUntil, tap } from 'rxjs/operators';
import { SkuAssignmentsActions } from '../../store/actions';
import { MatSelectionListChange } from '@angular/material';
import { SkuAssignmentsSelectors } from '../../store/selectors';
import { FeatureState as SkuAssignmentsCoreState } from '../../store/reducers';
import { AnalyticsDashboardDb } from 'app/fake-db/dashboard-analytics';

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
    availableCatalogues$: Observable<Array<AnalyticsDashboardDb>>;

    // untuk menampilkan selected sku
    selectedSku$: Observable<Array<AnalyticsDashboardDb>>;

    selectedSkuSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();

    constructor(
        private skuAssignmentStore: NgRxStore<SkuAssignmentsCoreState>
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

                return mergedStores.map((catalogue: any) => {
                    const newCatalogue = catalogue;

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
                    const sku = $event.option.value as any;
                    const isSelected = $event.option.selected;

                    if (sku.source === 'fetch') {
                       
                    } else if (sku.source === 'list') {
                        
                    }
                }),
                takeUntil(this.subs$)
            )
            .subscribe();

        // Get List Catalogue
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.selectedSkuSub$.next();
        this.selectedSkuSub$.complete();
    }
}

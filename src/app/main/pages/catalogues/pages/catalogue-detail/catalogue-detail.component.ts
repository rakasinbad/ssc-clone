import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { Catalogue } from '../../models';
import { fromCatalogue } from '../../store/reducers';
import { CatalogueSelectors } from '../../store/selectors';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'app-catalogue-detail',
    templateUrl: './catalogue-detail.component.html',
    styleUrls: ['./catalogue-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogueDetailComponent implements OnInit, OnDestroy {

    private subs$: Subject<void> = new Subject<void>();

    selectedCatalogue$: Observable<Catalogue>;

    constructor(
        private store: NgRxStore<fromCatalogue.FeatureState>
    ) {}

    ngOnInit(): void {
        this.selectedCatalogue$ = this.store.select(
            CatalogueSelectors.getSelectedCatalogueEntity
        ).pipe(
            tap(catalogue => console.log(catalogue)),
            takeUntil(this.subs$)
        );
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

}

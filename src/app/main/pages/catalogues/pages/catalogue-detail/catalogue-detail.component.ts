import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { Catalogue } from '../../models';
import { fromCatalogue } from '../../store/reducers';
import { CatalogueSelectors } from '../../store/selectors';
import { takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    navigationSub$: Subject<void> = new Subject<void>();
    // tslint:disable-next-line: no-inferrable-types
    section: string = 'sku-information';

    selectedCatalogue$: Observable<Catalogue>;

    constructor(
        private router: Router,
        private store: NgRxStore<fromCatalogue.FeatureState>
    ) {}

    onSelectedTab(index: number): void {
        switch (index) {
            case 0: this.section = 'sku-information'; break;
            case 1: this.section = 'price-settings'; break;
            case 2: this.section = 'media-settings'; break;
            case 3: this.section = 'weight-and-dimension'; break;
            case 4: this.section = 'amount-settings'; break;
        }
    }

    ngOnInit(): void {
        this.selectedCatalogue$ = this.store.select(
            CatalogueSelectors.getSelectedCatalogueEntity
        ).pipe(
            tap(catalogue => console.log(catalogue)),
            takeUntil(this.subs$)
        );

        this.navigationSub$.pipe(
            withLatestFrom(this.selectedCatalogue$),
            takeUntil(this.subs$)
        ).subscribe(([_, { id: catalogueId }]) => {
            this.router.navigate([`/pages/catalogues/edit/${this.section}/${catalogueId}`]);
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.navigationSub$.next();
        this.navigationSub$.complete();
    }

}

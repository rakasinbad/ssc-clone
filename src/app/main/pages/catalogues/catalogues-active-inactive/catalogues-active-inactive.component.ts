import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { CatalogueActions } from '../store/actions';
import { fromCatalogue } from '../store/reducers';

@Component({
    selector: 'app-catalogues-active-inactive',
    templateUrl: './catalogues-active-inactive.component.html',
    styleUrls: ['./catalogues-active-inactive.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesActiveInactiveComponent implements OnInit {
    constructor(
        private store: Store<fromCatalogue.FeatureState>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit() {}

    onDelete(catalogueId): void {
        this.store.dispatch(CatalogueActions.removeCatalogueRequest({ payload: catalogueId }));
    }
}

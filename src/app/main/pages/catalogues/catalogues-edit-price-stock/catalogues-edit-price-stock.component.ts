/** Angular Core Libraries */
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ChangeDetectorRef,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    Validators,
    FormGroup
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/** NgRx */
import { Store } from '@ngrx/store';

/** RxJS */
import {
    Observable,
    Subject
} from 'rxjs';
import {
    map,
    takeUntil,
    distinctUntilChanged,
    debounceTime
} from 'rxjs/operators';

/** Models */
import {
    Catalogue,
    CatalogueCategory
} from '../models';

/** Actions */
import { CatalogueActions } from '../store/actions';

/** Reducers */
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';

interface IMatDialogData {
    catalogueId: string;
    editMode: 'price' | 'stock';
    price?: string;
    stock?: string;
}

interface ISelectedCategory {
    data: Array<CatalogueCategory>;
    selected: string;
}

interface ISelectedCategoryForm {
    id: string;
    idx: string;
    name: string;
}

@Component({
    selector: 'app-catalogues-edit-price-stock',
    templateUrl: './catalogues-edit-price-stock.component.html',
    styleUrls: ['./catalogues-edit-price-stock.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesEditPriceStockComponent implements OnDestroy, OnInit {

    /** Untuk menyimpan nilai yang akan dikirim ke back-end. */
    public form: FormGroup;

    /** Subject, untuk pipe takeUntil-nya Observable biar auto-unsubscribe. */
    private _unSubs$: Subject<void>;

    /** Untuk penanda apakah sedang ada aktivitas update. */
    public isUpdating: boolean;

    constructor(
        /**
         * Melakukan injeksi data yang dikirim oleh komponen lain.
         * Artinya, data yang dikirim bisa ditangkap oleh komponen ini.
         */
        @Inject(MAT_DIALOG_DATA) public data: IMatDialogData,
        private _cd: ChangeDetectorRef,
        private fb: FormBuilder,
        private store: Store<fromCatalogue.FeatureState>,
    ) {}

    public updateData(): void {
        if (this.form.status === 'VALID') {
            if (this.data.editMode === 'price') {
                this.store.dispatch(
                    CatalogueActions.patchCatalogueRequest({
                        payload: {
                            id: this.data.catalogueId,
                            data: Catalogue.patch({ suggestRetailPrice: this.form.get('price').value }),
                            source: 'list'
                        }
                    })
                );
            } else if (this.data.editMode === 'stock') {
                this.store.dispatch(
                    CatalogueActions.patchCatalogueRequest({
                        payload: {
                            id: this.data.catalogueId,
                            data: Catalogue.patch({ stock: this.form.get('stock').value }),
                            source: 'list'
                        }
                    })
                );
            }

            this.form.disable();
        }
    }

    ngOnInit(): void {
        /** Inisialisasi Subject. */
        this._unSubs$ = new Subject<void>();

        /** Inisialisasi FormGroup. */
        this.form = this.fb.group({});

        if (this.data.editMode === 'price') {
            /** Memasukkan FormControl untuk price JIKA mode-nya adalah price. */
            this.form.addControl('price', this.fb.control('', Validators.required));
            this.form.addControl('oldPrice', this.fb.control({ value: this.data.price, disabled: true }));
        } else if (this.data.editMode === 'stock') {
            /** Memasukkan FormControl untuk stock JIKA mode-nya adalah stock. */
            this.form.addControl('stock', this.fb.control('', Validators.required));
            this.form.addControl('oldStock', this.fb.control({ value: this.data.stock, disabled: true }));
        }

        /** Subscribe ke selector updating activity. */
        this.store
            .select(CatalogueSelectors.getUpdatingActivity)
            .pipe(
                takeUntil(this._unSubs$)
            ).subscribe(isUpdating => this.isUpdating = isUpdating);
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }
}

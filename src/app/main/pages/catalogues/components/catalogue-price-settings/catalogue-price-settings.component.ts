import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { fromCatalogue } from '../../store/reducers';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { CatalogueSelectors, BrandSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { CataloguesService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { CatalogueUnit, CatalogueCategory, Catalogue } from '../../models';
import { CatalogueActions, BrandActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { Brand } from 'app/shared/models/brand.model';
import { SafeHtml } from '@angular/platform-browser';
import { TNullable } from 'app/shared/models/global.model';

type IFormMode = 'add' | 'view' | 'edit';
// 
@Component({
    selector: 'catalogue-price-settings',
    templateUrl: './catalogue-price-settings.component.html',
    styleUrls: ['./catalogue-price-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguePriceSettingsComponent implements OnInit, AfterViewInit, OnDestroy {

    private subs$: Subject<void> = new Subject<void>();

    selectedCatalogue$: Observable<Catalogue>;

    brands$: Observable<Array<Brand>>;

    catalogueUnits: Array<CatalogueUnit>;

    productCategory$: SafeHtml;

    formMode: IFormMode = 'add';

    form: FormGroup;

    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
    formClass: {
        'custom-field-right': boolean;
        'view-field-right': boolean;
    };
    cataloguePriceTools: Array<string> = [
        'warehouse',
        'type',
        'group',
        'channel',
        'cluster',
    ];

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private store: NgRxStore<fromCatalogue.FeatureState>,
        private catalogue$: CataloguesService,
        private errorMessage$: ErrorMessageService,
    ) {
        this.selectedCatalogue$ = this.store.select(CatalogueSelectors.getSelectedCatalogueEntity)
        .pipe(
            takeUntil(this.subs$)
        );
    }

    drop(event: CdkDragDrop<Array<string>>): void {
        // this.cataloguePriceTools.
        moveItemInArray(this.cataloguePriceTools, event.previousIndex, event.currentIndex);
    }
// 
    private updateFormView(): void {
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'view-field-right': this.isViewMode()
        };

        this.catalogueContent = {
            'mt-16': this.isViewMode(),
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode()
        };
    }

    private checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe(urls => {
            if (urls.filter(url => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this.prepareEditCatalogue();
            } else if (urls.filter(url => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEditCatalogue();
            } else if (urls.filter(url => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
            this.store.select(AuthSelectors.getUserSupplier)
        ])
            .pipe(
                takeUntil(this.subs$)
            ).subscribe(([catalogue, userSupplier]: [Catalogue, UserSupplier]) => {
                /** Mengambil ID dari URL (untuk jaga-jaga ketika ID katalog yang terpilih tidak ada di state) */
                const { id } = this.route.snapshot.params;

                /** Butuh mengambil data katalog jika belum ada di state. */
                if (!catalogue) {
                    this.store.dispatch(
                        CatalogueActions.fetchCatalogueRequest({
                            payload: id
                        })
                    );

                    this.store.dispatch(
                        CatalogueActions.setSelectedCatalogue({
                            payload: id
                        })
                    );

                    return;
                }

                /** Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut. */
                if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                    this.store.dispatch(
                        CatalogueActions.spliceCatalogue({
                            payload: id
                        })
                    );

                    this.notice$.open('Produk tidak ditemukan.', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    setTimeout(() => this.router.navigate(['pages', 'catalogues', 'list']), 1000);

                    return;
                }

                if (!this.isAddMode()) {
                    this.form.get('advancePrice').disable();
                } else {
                    this.form.get('advancePrice').enable();
                }

                /** Pemberian jeda untuk memasukkan data katalog ke dalam form. */
                setTimeout(() => {
                    this.form.patchValue({
                        id: catalogue.id,
                        basePrice: catalogue.suggestedConsumerBuyingPrice,
                        retailBuyingPrice: catalogue.retailBuyingPrice,
                    });

                    this.cdRef.markForCheck();
                });

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    getFormError(form: any): string {
        return this.errorMessage$.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return form.errors && form.touched;
        }

        if (ignoreTouched) {
            return form.errors && form.dirty;
        }

        return form.errors && (form.dirty || form.touched);
    }

    isAddMode(): boolean {
        return this.formMode === 'add';
    }

    isEditMode(): boolean {
        return this.formMode === 'edit';
    }

    isViewMode(): boolean {
        return this.formMode === 'view';
    }

    ngOnInit(): void {
        /** Menyiapkan form. */
        this.form = this.fb.group({
            id: [''],
            basePrice: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState(
                            'default',
                            'required'
                        )
                    })
                ]
            ],
            retailBuyingPrice: [''],
            advancePrice: [true]
        });

        this.checkRoute();
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

}

import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, Output, EventEmitter, Input, SimpleChanges, OnChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject } from 'rxjs';
// 
import { fromCatalogue } from '../../store/reducers';
import { ErrorMessageService, NoticeService, HelperService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil, tap } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { CatalogueSelectors, BrandSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { CataloguesService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { CatalogueUnit, CatalogueCategory, Catalogue } from '../../models';
import { CatalogueActions, BrandActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { CataloguesSelectCategoryComponent } from '../../catalogues-select-category/catalogues-select-category.component';
import { Brand } from 'app/shared/models/brand.model';
import { SafeHtml } from '@angular/platform-browser';
import { TNullable, FormStatus } from 'app/shared/models/global.model';
import { CatalogueMedia } from '../../models/catalogue-media.model';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'catalogue-media-settings',
    templateUrl: './catalogue-media-settings.component.html',
    styleUrls: ['./catalogue-media-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class CatalogueMediaSettingsComponent implements OnInit, OnChanges, OnDestroy {

    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan re-subcribe form valueChanges dan statusChanges.
    private formSub$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk menyimpan daftar brand dari suatu supplier.
    brands$: Observable<Array<Brand>>;
    // Untuk form.
    form: FormGroup;
    // Untuk form bagian foto produk yang saat ini.
    productPhotos: FormArray;
    // Untuk form bagian foto produk yang sebelum di-edit.
    productOldPhotos: FormArray;

    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output() formValueChange: EventEmitter<CatalogueMedia> = new EventEmitter<CatalogueMedia>();

    // Untuk mendapatkan event ketika form mode berubah.
    @Output() formModeChange: EventEmitter<IFormMode> = new EventEmitter<IFormMode>();

    @Input()
    get formMode(): IFormMode {
        return this.formModeValue;
    }

    set formMode(mode: IFormMode) {
        this.formModeValue = mode;
        this.formModeChange.emit(this.formModeValue);
    }

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

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private store: NgRxStore<fromCatalogue.FeatureState>,
        private errorMessage$: ErrorMessageService,
    ) {
        this.formSub$.pipe(
            tap(() => HelperService.debug('[CATALOGUE/MEDIA SETTINGS] FORMSUB$ is closed?', this.formSub$.closed)),
            takeUntil(this.subs$)
        ).subscribe();
    }
    
    private prepareForm(): void {
        if (this.formSub$.closed) {
            this.formSub$ = new Subject<void>();
        } else {
            this.formSub$.next();
            this.formSub$.complete();

            this.formSub$ = new Subject<void>();
        }

        /** Menyiapkan form. */
        this.form = this.fb.group({
            productMedia: this.fb.group({
                photos: this.fb.array([
                    this.fb.control(null, [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'product_photo',
                                'min_1_photo'
                            )
                        })
                    ]),
                    this.fb.control(null),
                    this.fb.control(null),
                    this.fb.control(null),
                    this.fb.control(null),
                    this.fb.control(null)
                ]),
                oldPhotos: this.fb.array([
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] })
                ])
            }),
        });
    }

    private updateFormView(): void {
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'view-field-right': this.isViewMode()
        };

        this.catalogueContent = {
            'mt-16': true,
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
            this.trigger$,
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
            this.store.select(AuthSelectors.getUserSupplier)
        ])
            .pipe(
                takeUntil(this.subs$)
            ).subscribe(([_, catalogue, userSupplier]: [string, Catalogue, UserSupplier]) => {
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

                // Me-reset ulang semua form.
                this.prepareForm();
                this.initFormCheck();

                /** Pemberian jeda untuk memasukkan data katalog ke dalam form. */
                this.form.get('productMedia').patchValue({
                    photos: [...catalogue.catalogueImages.map(image => image.imageUrl)],
                    oldPhotos: [...catalogue.catalogueImages.map(image => image.imageUrl)]
                });

                this.productPhotos = this.form.get('productMedia.photos') as FormArray;
                this.productOldPhotos = this.form.get('productMedia.oldPhotos') as FormArray;

                /** Menampilkan foto produk pada form beserta menyimpannya di form invisible untuk sewaktu-waktu ingin undo penghapusan foto. */
                for (const [idx, image] of catalogue.catalogueImages.entries()) {
                    this.productPhotos.controls[idx].setValue(image.imageUrl);
                    this.productOldPhotos.controls[idx].get('id').setValue(image.id);
                    this.productOldPhotos.controls[idx].get('value').setValue(image.imageUrl);
                }

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    onFileBrowse($event: Event, index: number): void {
        const inputEl = $event.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            const photo = (this.form.get('productMedia.photos') as FormArray).controls[index];
            const fileReader = new FileReader();

            fileReader.onload = () => {
                photo.patchValue(fileReader.result);
                this.form.markAsTouched();
                this.cdRef.markForCheck();
            };

            fileReader.readAsDataURL(file);
        }

        return;
    }

    onAbortUploadPhoto($event: HTMLInputElement, index: number): void {
        $event.value = '';

        (this.form.get('productMedia.photos') as FormArray).controls[index].patchValue(null);
        this.cdRef.markForCheck();
    }

    onResetImage(index: number): void {
        const originalImage = this.productOldPhotos.controls[index].get('value').value;
        (this.form.get('productMedia.photos') as FormArray).controls[index].patchValue(
            originalImage
        );

        this.cdRef.markForCheck();
    }
// 
    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>).pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(value => HelperService.debug('CATALOGUE MEDIA SETTINGS FORM STATUS CHANGED:', value)),
            takeUntil(this.formSub$)
        ).subscribe(status => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(200),
            tap(value => HelperService.debug('[BEFORE MAP] CATALOGUE MEDIA SETTINGS FORM VALUE CHANGED', value)),
            map(value => {
                return value.productMedia;
            }),
            tap(value => HelperService.debug('[AFTER MAP] CATALOGUE MEDIA SETTINGS FORM VALUE CHANGED', value)),
            takeUntil(this.formSub$)
        ).subscribe(value => {
            this.formValueChange.emit(value);
        });
    }

    onEditCategory(): void {
        this.dialog.open(CataloguesSelectCategoryComponent, { width: '1366px' });
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
        this.prepareForm();

        this.productPhotos = this.form.get('productMedia.photos') as FormArray;
        this.productOldPhotos = this.form.get('productMedia.oldPhotos') as FormArray; 

        this.checkRoute();
        this.initFormCheck();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['formMode'].isFirstChange() && changes['formMode'].currentValue === 'edit') {
            this.trigger$.next('');

            setTimeout(() => {
                this.updateFormView();
            });
        } else if (changes['formMode'].currentValue) {
            this.trigger$.next('');
            setTimeout(() => this.updateFormView());
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        if (!this.formSub$.closed) {
            this.formSub$.next();
            this.formSub$.complete();
        }

        this.trigger$.next(null);
        this.trigger$.complete();
    }

}

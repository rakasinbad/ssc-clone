import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    Validator,
    Validators,
    FormControl,
    AbstractControl
} from '@angular/forms';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { statusCatalogue } from '../status';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';
import { MatTableDataSource } from '@angular/material';

@Component({
    selector: 'app-catalogues-form',
    templateUrl: './catalogues-form.component.html',
    styleUrls: ['./catalogues-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesFormComponent implements OnInit {
    maxVariantSelections = 20;

    form: FormGroup;
    variantForm: FormGroup;
    productPhotos: FormGroup;

    productCourierControls: AbstractControl[];
    productVariantControls: AbstractControl[];
    productVariantFormControls: AbstractControl[];
    productVariantSelectionControls: AbstractControl[];

    productVariantSelectionData: Array<MatTableDataSource<object>> = [];

    readonly variantListColumns: Array<string> = [
        'name', 'price', 'stock', 'sku'
    ];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    private _unSubs$: Subject<void>;

    constructor(
        private fb: FormBuilder,
        private store: Store<fromCatalogue.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public translate: TranslateService
    ) {
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Catalogue',
                        translate: 'BREADCRUMBS.CATALOGUE'
                    },
                    {
                        title: 'Add New Product',
                        translate: 'BREADCRUMBS.ADD_PRODUCT',
                        active: true
                    }
                ]
            })
        );

        this._fuseTranslationLoaderService.loadTranslations(
            indonesian,
            english
        );
    }

    ngOnInit() {
        this._unSubs$ = new Subject<void>();

        this.form = this.fb.group({
            productInfo: this.fb.group({
                id: ['', Validators.required],
                name: ['', Validators.required],
                description: [''],
                variant: ['', Validators.required],
                brand: ['', Validators.required],
                category: ['', Validators.required],
                stock: [''],
                uom: ['']
            }),
            productSale: this.fb.group({
                price: ['', Validators.required],
                tags: this.fb.array([], Validators.required),
                variants: this.fb.array([])
            }),
            productMedia: this.fb.group({
                photos: this.fb.array([
                    this.fb.control({ data: null }, Validators.required),
                    this.fb.control({ data: null }),
                    this.fb.control({ data: null }),
                    this.fb.control({ data: null }),
                    this.fb.control({ data: null }),
                    this.fb.control({ data: null })
                ])
            }),
            productSize: this.fb.group({
                length: [''],
                width: [''],
                height: ['']
            }),
            productShipment: this.fb.group({
                weight: [''],
                isDangerous: [''],
                couriers: this.fb.array([
                    this.fb.control({
                        name: 'SiCepat REG (maks 5000g)',
                        disabled: this.fb.control(false)
                    }),
                    this.fb.control({
                        name: 'JNE REG (maks 5000g)',
                        disabled: this.fb.control(false)
                    }),
                    this.fb.control({
                        name: 'SiCepat Cargo (maks 5000g)',
                        disabled: this.fb.control(false)
                    })
                ])
            })
        });

        this.variantForm = this.fb.group({
            variants: this.fb.array([])
        });

        this.productPhotos = this.form.get('productMedia.photos') as FormGroup;
        this.productCourierControls = (this.form.get(
            'productShipment.couriers'
        ) as FormArray).controls;
        this.productVariantControls = (this.form.get(
            'productSale.variants'
        ) as FormArray).controls;
        this.productVariantFormControls = (this.variantForm.get(
            'variants'
        ) as FormArray).controls;
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    onAddVariant() {
        const $index = this.productVariantControls.push(this.fb.array([this.fb.control('')]));

        this.productVariantFormControls.push(
            this.fb.group({
                price: '',
                stock: '',
                sku: ''
            })
        );

        this.productVariantSelectionData.push(
            new MatTableDataSource(
                (this.productVariantControls[$index - 1] as FormArray).controls
            )
        );
        // console.log(this.productVariants);
        // console.log(this.form.get('productSale.variants'));
        // console.log(this.productVariantSelections);
    }

    onAddVariantSelection(_: Event, $variant: number) {
        (this.productVariantControls[$variant] as FormArray).push(this.fb.control(''));

        console.log((this.productVariantControls[$variant] as FormArray).controls);
        this.productVariantSelectionData[$variant] = new MatTableDataSource(
            (this.productVariantControls[$variant] as FormArray).controls
        );
        console.log(this.productVariantSelectionData[$variant]);
    }

    onRemoveVariantSelection(_: Event, $variant: number, $index: number) {
        (this.productVariantControls[$variant] as FormArray).removeAt($index);
        if (
            (this.productVariantControls[$variant] as FormArray).controls.length === 0
        ) {
            this.productVariantFormControls.splice($variant, 1);
            this.productVariantControls.splice($variant, 1);
        }
        this.productVariantSelectionData[$variant] = new MatTableDataSource(
            (this.productVariantControls[$variant] as FormArray).controls
        );
    }

    onAddTag(event: MatChipInputEvent) {
        const input = event.input;
        const value = event.value;
        const formArray = this.form.get('productSale.tags') as FormArray;

        if ((value || '').trim()) {
            formArray.push(this.fb.control(value));
        }

        if (input) {
            input.value = '';
        }
    }

    onRemoveTag(tag: string) {
        const formArray = this.form.get('productSale.tags') as FormArray;
        const index = (formArray.value as Array<string>).indexOf(tag);

        if (index >= 0) {
            formArray.removeAt(index);
        }
    }

    printLog(val: any) {
        console.log(val);
    }
}

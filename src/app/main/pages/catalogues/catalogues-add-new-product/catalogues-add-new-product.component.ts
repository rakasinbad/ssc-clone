import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { CatalogueCategory } from '../models';
import { CatalogueActions } from '../store/actions';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';

interface CatalogueCategoryFlatNode {
    expandable: boolean;
    name: string;
    level: number;
}

interface ISelectedCategory {
    selected: string;
    data: Array<CatalogueCategory>;
}

@Component({
    selector: 'app-catalogues-add-new-product',
    templateUrl: './catalogues-add-new-product.component.html',
    styleUrls: ['./catalogues-add-new-product.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesAddNewProductComponent implements AfterViewInit, OnInit, OnDestroy {
    isFulfilled = false;
    productName: FormControl;
    search: FormControl;
    selectedCategories$: Observable<string>;
    categories: Array<CatalogueCategory>;

    selectedCategory: FormArray;

    @ViewChild('productNameInput', { static: true }) productNameInput: ElementRef;

    selectedCategories: Array<ISelectedCategory> = [
        { data: [], selected: '' },
        { data: [], selected: '' },
        { data: [], selected: '' },
        { data: [], selected: '' }
    ];
    categoryTree: Array<CatalogueCategory>;

    private _unSubs$: Subject<void>;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private _cd: ChangeDetectorRef,
        private store: Store<fromCatalogue.FeatureState>,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public translate: TranslateService,
        private errorMessageSvc: ErrorMessageService
    ) {
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Catalogue',
                        translate: 'BREADCRUMBS.CATALOGUE',
                        url: '/pages/catalogues'
                    },
                    {
                        title: 'Add Product',
                        translate: 'BREADCRUMBS.ADD_PRODUCT',
                        active: true
                    }
                ]
            })
        );

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    ngOnInit(): void {
        this._unSubs$ = new Subject<void>();

        this.productName = new FormControl('', [
            RxwebValidators.required({
                message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
            })
        ]);
        this.search = new FormControl('', Validators.required);

        this.selectedCategory = this.fb.array(
            [
                // Level 1
                this.fb.group(
                    {
                        id: this.fb.control(null, Validators.required),
                        idx: this.fb.control(null, Validators.required),
                        name: this.fb.control(null, Validators.required)
                    },
                    Validators.required
                ),
                // Level 2
                this.fb.group({
                    id: this.fb.control(null),
                    idx: this.fb.control(null),
                    name: this.fb.control(null)
                }),
                // Level 3
                this.fb.group({
                    id: this.fb.control(null),
                    idx: this.fb.control(null),
                    name: this.fb.control(null)
                }),
                // Level 4
                this.fb.group({
                    id: this.fb.control(null),
                    idx: this.fb.control(null),
                    name: this.fb.control(null)
                })
            ],
            Validators.required
        );

        combineLatest([
            this.store.select(CatalogueSelectors.getCategoryTree),
            this.store.select(CatalogueSelectors.getCatalogueCategories)
        ])
            .pipe(takeUntil(this._unSubs$))
            .subscribe(([tree, categories]) => {
                if (categories.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueCategoriesRequest({
                            payload: {
                                paginate: false
                            }
                        })
                    );
                }

                if (tree.length === 0) {
                    return this.store.dispatch(CatalogueActions.fetchCategoryTreeRequest());
                }

                this.categories = categories;
                this.categoryTree = tree;
                this._cd.markForCheck();
            });

        this.selectedCategories$ = this.selectedCategory.valueChanges.pipe(
            map(forms => {
                const form: [] = forms.filter(f => f.id).map(f => f.name);

                return form.join(' > ');
            })
        );
    }

    ngAfterViewInit(): void {
        this.productNameInput.nativeElement.focus();
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }

    onSelectCategory(
        _: Event,
        id: string,
        data: CatalogueCategory,
        name: string,
        level: number,
        hasChild: any
    ): void {
        const resetTree = lvl => {
            let tempLevel = lvl;

            while (tempLevel <= this.selectedCategories.length - 1) {
                this.selectedCategory.controls[tempLevel].get('id').setValue(null);
                this.selectedCategory.controls[tempLevel].get('name').setValue(null);

                this.selectedCategories[tempLevel].data = [];
                tempLevel++;
            }
        };
        //
        if (hasChild) {
            this.isFulfilled = false;

            // Jika parentId nya null, berarti dia induk kategori.
            if (!data.parentId) {
                const idx = this.categoryTree.findIndex(category => category.id === data.id);
                this.selectedCategories[level + 1].data = this.categoryTree[idx].children;
            } else {
                this.selectedCategories[level + 1].data = data.children;
            }
            resetTree(level + 2);
        } else {
            this.isFulfilled = true;
            resetTree(level + 1);
        }

        this.selectedCategory.controls[level].get('id').setValue(id);
        this.selectedCategory.controls[level].get('name').setValue(name);
        // const categories = this.selectedCategory.controls.filter(control => control.get('id').value).map(control => control.get('id').value);
    }

    addNewCatalogue(): void {
        const categories = this.selectedCategory.getRawValue().filter(selected => selected.id);
        const lastSelectedCategory = categories[categories.length - 1];
        const lastCategory = this.categories.filter(
            category => lastSelectedCategory.id === category.id
        );

        this.store.dispatch(
            CatalogueActions.setSelectedCategories({
                payload: [
                    ...this.selectedCategory.controls
                        .filter(control => control.get('id').value)
                        .map((control, idx, controls) => ({
                            id: control.get('id').value,
                            name: control.get('name').value,
                            parent: idx === 0 ? null : controls[idx - 1].get('id').value,
                            hasChildren: lastCategory[0].children.length === 0 ? false : true
                        }))
                ]
            })
        );

        this.store.dispatch(
            CatalogueActions.setProductName({
                payload: this.productName.value
            })
        );

        this.router.navigate(['pages', 'catalogues', 'add', 'new']);
    }

    hasChild = (_: number, node: CatalogueCategoryFlatNode) => node.expandable;

    getFormError(form: FormControl | FormGroup | FormArray): string {
        return this.errorMessageSvc.getFormError(form);
    }
}

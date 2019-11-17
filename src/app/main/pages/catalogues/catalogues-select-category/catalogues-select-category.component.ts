/*
 __        ______  _______   _______    ______   _______   ______  ________   ______  
/  |      /      |/       \ /       \  /      \ /       \ /      |/        | /      \ 
$$ |      $$$$$$/ $$$$$$$  |$$$$$$$  |/$$$$$$  |$$$$$$$  |$$$$$$/ $$$$$$$$/ /$$$$$$  |
$$ |        $$ |  $$ |__$$ |$$ |__$$ |$$ |__$$ |$$ |__$$ |  $$ |  $$ |__    $$ \__$$/ 
$$ |        $$ |  $$    $$< $$    $$< $$    $$ |$$    $$<   $$ |  $$    |   $$      \ 
$$ |        $$ |  $$$$$$$  |$$$$$$$  |$$$$$$$$ |$$$$$$$  |  $$ |  $$$$$/     $$$$$$  |
$$ |_____  _$$ |_ $$ |__$$ |$$ |  $$ |$$ |  $$ |$$ |  $$ | _$$ |_ $$ |_____ /  \__$$ |
$$       |/ $$   |$$    $$/ $$ |  $$ |$$ |  $$ |$$ |  $$ |/ $$   |$$       |$$    $$/ 
$$$$$$$$/ $$$$$$/ $$$$$$$/  $$/   $$/ $$/   $$/ $$/   $$/ $$$$$$/ $$$$$$$$/  $$$$$$/  
*/                                                                                      
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
    Validators
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
    takeUntil
} from 'rxjs/operators';

/** Models */
import {
    CatalogueCategory
} from '../models';

/** Actions */
import { CatalogueActions } from '../store/actions';

/** Reducers */
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';

/*
 ______  __    __  ________  ________  _______   ________  ______    ______   ________   ______  
/      |/  \  /  |/        |/        |/       \ /        |/      \  /      \ /        | /      \ 
$$$$$$/ $$  \ $$ |$$$$$$$$/ $$$$$$$$/ $$$$$$$  |$$$$$$$$//$$$$$$  |/$$$$$$  |$$$$$$$$/ /$$$$$$  |
  $$ |  $$$  \$$ |   $$ |   $$ |__    $$ |__$$ |$$ |__   $$ |__$$ |$$ |  $$/ $$ |__    $$ \__$$/ 
  $$ |  $$$$  $$ |   $$ |   $$    |   $$    $$< $$    |  $$    $$ |$$ |      $$    |   $$      \ 
  $$ |  $$ $$ $$ |   $$ |   $$$$$/    $$$$$$$  |$$$$$/   $$$$$$$$ |$$ |   __ $$$$$/     $$$$$$  |
 _$$ |_ $$ |$$$$ |   $$ |   $$ |_____ $$ |  $$ |$$ |     $$ |  $$ |$$ \__/  |$$ |_____ /  \__$$ |
/ $$   |$$ | $$$ |   $$ |   $$       |$$ |  $$ |$$ |     $$ |  $$ |$$    $$/ $$       |$$    $$/ 
$$$$$$/ $$/   $$/    $$/    $$$$$$$$/ $$/   $$/ $$/      $$/   $$/  $$$$$$/  $$$$$$$$/  $$$$$$/  
*/
interface ISelectedCategory {
    data: Array<CatalogueCategory>;
    selected: string;
}

interface ISelectedCategoryForm {
    id: string;
    idx: string;
    name: string;
}

/*
  ______    ______   __       __  _______    ______   __    __  ________  __    __  ________ 
 /      \  /      \ /  \     /  |/       \  /      \ /  \  /  |/        |/  \  /  |/        |
/$$$$$$  |/$$$$$$  |$$  \   /$$ |$$$$$$$  |/$$$$$$  |$$  \ $$ |$$$$$$$$/ $$  \ $$ |$$$$$$$$/ 
$$ |  $$/ $$ |  $$ |$$$  \ /$$$ |$$ |__$$ |$$ |  $$ |$$$  \$$ |$$ |__    $$$  \$$ |   $$ |   
$$ |      $$ |  $$ |$$$$  /$$$$ |$$    $$/ $$ |  $$ |$$$$  $$ |$$    |   $$$$  $$ |   $$ |   
$$ |   __ $$ |  $$ |$$ $$ $$/$$ |$$$$$$$/  $$ |  $$ |$$ $$ $$ |$$$$$/    $$ $$ $$ |   $$ |   
$$ \__/  |$$ \__$$ |$$ |$$$/ $$ |$$ |      $$ \__$$ |$$ |$$$$ |$$ |_____ $$ |$$$$ |   $$ |   
$$    $$/ $$    $$/ $$ | $/  $$ |$$ |      $$    $$/ $$ | $$$ |$$       |$$ | $$$ |   $$ |   
 $$$$$$/   $$$$$$/  $$/      $$/ $$/        $$$$$$/  $$/   $$/ $$$$$$$$/ $$/   $$/    $$/    
*/
@Component({
    selector: 'app-catalogues-select-category',
    templateUrl: './catalogues-select-category.component.html',
    styleUrls: ['./catalogues-select-category.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
/*
  ______   __         ______    ______    ______  
 /      \ /  |       /      \  /      \  /      \ 
/$$$$$$  |$$ |      /$$$$$$  |/$$$$$$  |/$$$$$$  |
$$ |  $$/ $$ |      $$ |__$$ |$$ \__$$/ $$ \__$$/ 
$$ |      $$ |      $$    $$ |$$      \ $$      \ 
$$ |   __ $$ |      $$$$$$$$ | $$$$$$  | $$$$$$  |
$$ \__/  |$$ |_____ $$ |  $$ |/  \__$$ |/  \__$$ |
$$    $$/ $$       |$$ |  $$ |$$    $$/ $$    $$/ 
 $$$$$$/  $$$$$$$$/ $$/   $$/  $$$$$$/   $$$$$$/  
*/
export class CataloguesSelectCategoryComponent implements OnDestroy, OnInit {

    /*
     __     __   ______   _______   ______   ______   _______   __        ________   ______  
    /  |   /  | /      \ /       \ /      | /      \ /       \ /  |      /        | /      \ 
    $$ |   $$ |/$$$$$$  |$$$$$$$  |$$$$$$/ /$$$$$$  |$$$$$$$  |$$ |      $$$$$$$$/ /$$$$$$  |
    $$ |   $$ |$$ |__$$ |$$ |__$$ |  $$ |  $$ |__$$ |$$ |__$$ |$$ |      $$ |__    $$ \__$$/ 
    $$  \ /$$/ $$    $$ |$$    $$<   $$ |  $$    $$ |$$    $$< $$ |      $$    |   $$      \ 
     $$  /$$/  $$$$$$$$ |$$$$$$$  |  $$ |  $$$$$$$$ |$$$$$$$  |$$ |      $$$$$/     $$$$$$  |
      $$ $$/   $$ |  $$ |$$ |  $$ | _$$ |_ $$ |  $$ |$$ |__$$ |$$ |_____ $$ |_____ /  \__$$ |
       $$$/    $$ |  $$ |$$ |  $$ |/ $$   |$$ |  $$ |$$    $$/ $$       |$$       |$$    $$/ 
        $/     $$/   $$/ $$/   $$/ $$$$$$/ $$/   $$/ $$$$$$$/  $$$$$$$$/ $$$$$$$$/  $$$$$$/  
    */
    /** Untuk penanda bahwa data yang di-input sudah memenuhi kriteria atau belum. */
    public isFulfilled: boolean;

    /** Menyimpan pohon kategori (kategori beserta sub-kategorinya). */
    public categoryTree: Array<CatalogueCategory>;

    /** Menyimpan kategori untuk dimunculkan di view. */
    public selectedCategories: Array<ISelectedCategory> = [
        { data: [], selected: '' },
        { data: [], selected: '' },
        { data: [], selected: '' },
        { data: [], selected: '' }
    ];

    /** Untuk menyimpan kategori-kategori yang telah terpilih. */
    public selectedCategoriesForm: FormArray;

    /** Untuk menampilkan kategori yang telah terpilih dan berubah sesuai dengan kategori-kategori yang terpilih. */
    public selectedCategories$: Observable<string>;

    /** Subject, untuk pipe takeUntil-nya Observable biar auto-unsubscribe. */
    private _unSubs$: Subject<void>;

    /*
      ______    ______   __    __   ______   ________  _______   __    __   ______   ________  ______   _______  
     /      \  /      \ /  \  /  | /      \ /        |/       \ /  |  /  | /      \ /        |/      \ /       \ 
    /$$$$$$  |/$$$$$$  |$$  \ $$ |/$$$$$$  |$$$$$$$$/ $$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$$//$$$$$$  |$$$$$$$  |
    $$ |  $$/ $$ |  $$ |$$$  \$$ |$$ \__$$/    $$ |   $$ |__$$ |$$ |  $$ |$$ |  $$/    $$ |  $$ |  $$ |$$ |__$$ |
    $$ |      $$ |  $$ |$$$$  $$ |$$      \    $$ |   $$    $$< $$ |  $$ |$$ |         $$ |  $$ |  $$ |$$    $$< 
    $$ |   __ $$ |  $$ |$$ $$ $$ | $$$$$$  |   $$ |   $$$$$$$  |$$ |  $$ |$$ |   __    $$ |  $$ |  $$ |$$$$$$$  |
    $$ \__/  |$$ \__$$ |$$ |$$$$ |/  \__$$ |   $$ |   $$ |  $$ |$$ \__$$ |$$ \__/  |   $$ |  $$ \__$$ |$$ |  $$ |
    $$    $$/ $$    $$/ $$ | $$$ |$$    $$/    $$ |   $$ |  $$ |$$    $$/ $$    $$/    $$ |  $$    $$/ $$ |  $$ |
     $$$$$$/   $$$$$$/  $$/   $$/  $$$$$$/     $$/    $$/   $$/  $$$$$$/   $$$$$$/     $$/    $$$$$$/  $$/   $$/ 
    */                                                                                                       
    constructor(
        /**
         * Melakukan injeksi data yang dikirim oleh komponen lain.
         * Artinya, data yang dikirim bisa ditangkap oleh komponen ini.
         */
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _cd: ChangeDetectorRef,
        private fb: FormBuilder,
        private store: Store<fromCatalogue.FeatureState>,
    ) {}

    /*
     _______   _______   ______  __     __   ______   ________  ________ 
    /       \ /       \ /      |/  |   /  | /      \ /        |/        |
    $$$$$$$  |$$$$$$$  |$$$$$$/ $$ |   $$ |/$$$$$$  |$$$$$$$$/ $$$$$$$$/ 
    $$ |__$$ |$$ |__$$ |  $$ |  $$ |   $$ |$$ |__$$ |   $$ |   $$ |__    
    $$    $$/ $$    $$<   $$ |  $$  \ /$$/ $$    $$ |   $$ |   $$    |   
    $$$$$$$/  $$$$$$$  |  $$ |   $$  /$$/  $$$$$$$$ |   $$ |   $$$$$/    
    $$ |      $$ |  $$ | _$$ |_   $$ $$/   $$ |  $$ |   $$ |   $$ |_____ 
    $$ |      $$ |  $$ |/ $$   |   $$$/    $$ |  $$ |   $$ |   $$       |
    $$/       $$/   $$/ $$$$$$/     $/     $$/   $$/    $$/    $$$$$$$$/ 
    */                                                                    
    private joinSelectedCategories(categories: Array<ISelectedCategoryForm>): string {
        return categories.filter(c => c.id).map(c => c.name).join(' > ');
    }

    private resetSelectedCategoryTree(level: number): void {
        while (level <= this.selectedCategories.length - 1) {
            this.selectedCategoriesForm.controls[level].get('id').setValue(null);
            this.selectedCategoriesForm.controls[level].get('name').setValue(null);

            this.selectedCategories[level].data = [];
            level++;
        }
    }

    /*
     _______   __    __  _______   __        ______   ______  
    /       \ /  |  /  |/       \ /  |      /      | /      \ 
    $$$$$$$  |$$ |  $$ |$$$$$$$  |$$ |      $$$$$$/ /$$$$$$  |
    $$ |__$$ |$$ |  $$ |$$ |__$$ |$$ |        $$ |  $$ |  $$/ 
    $$    $$/ $$ |  $$ |$$    $$< $$ |        $$ |  $$ |      
    $$$$$$$/  $$ |  $$ |$$$$$$$  |$$ |        $$ |  $$ |   __ 
    $$ |      $$ \__$$ |$$ |__$$ |$$ |_____  _$$ |_ $$ \__/  |
    $$ |      $$    $$/ $$    $$/ $$       |/ $$   |$$    $$/ 
    $$/        $$$$$$/  $$$$$$$/  $$$$$$$$/ $$$$$$/  $$$$$$/  
    */                                     
    public onSelectCategory(_: Event, id: string, data: CatalogueCategory, name: string, level: number, hasChild: any): void {
        if (hasChild) {
            this.isFulfilled = false;
            // Jika parentId nya null, berarti dia induk kategori.
            if (!data.parentId) {
                const idx = this.categoryTree.findIndex(category => category.id === data.id);
                this.selectedCategories[level + 1].data = this.categoryTree[idx].children;
            } else {
                this.selectedCategories[level + 1].data = data.children;
            }
            this.resetSelectedCategoryTree(level + 2);
        } else {
            this.isFulfilled = true;
            this.resetSelectedCategoryTree(level + 1);
        }

        this.selectedCategoriesForm.controls[level].get('id').setValue(id);
        this.selectedCategoriesForm.controls[level].get('name').setValue(name);
    }

    public selectCategory(): void {
        this.store.dispatch(CatalogueActions.setSelectedCategories({
            payload: [
                ...this.selectedCategoriesForm.controls
                    .filter(control => control.get('id').value)
                    .map((control, idx, controls) => ({
                        id: control.get('id').value,
                        name: control.get('name').value,
                        parent: idx === 0 ? null : controls[idx - 1].get('id').value
                    })
                )
            ]
        }));
    }

    /*    
     __        ______  ________  ________   ______   __      __  ______   __        ________   ______  
    /  |      /      |/        |/        | /      \ /  \    /  |/      \ /  |      /        | /      \ 
    $$ |      $$$$$$/ $$$$$$$$/ $$$$$$$$/ /$$$$$$  |$$  \  /$$//$$$$$$  |$$ |      $$$$$$$$/ /$$$$$$  |
    $$ |        $$ |  $$ |__    $$ |__    $$ |  $$/  $$  \/$$/ $$ |  $$/ $$ |      $$ |__    $$ \__$$/ 
    $$ |        $$ |  $$    |   $$    |   $$ |        $$  $$/  $$ |      $$ |      $$    |   $$      \ 
    $$ |        $$ |  $$$$$/    $$$$$/    $$ |   __    $$$$/   $$ |   __ $$ |      $$$$$/     $$$$$$  |
    $$ |_____  _$$ |_ $$ |      $$ |_____ $$ \__/  |    $$ |   $$ \__/  |$$ |_____ $$ |_____ /  \__$$ |
    $$       |/ $$   |$$ |      $$       |$$    $$/     $$ |   $$    $$/ $$       |$$       |$$    $$/ 
    $$$$$$$$/ $$$$$$/ $$/       $$$$$$$$/  $$$$$$/      $$/     $$$$$$/  $$$$$$$$/ $$$$$$$$/  $$$$$$/  
    */                                                                                
    ngOnInit(): void {
        /** Inisialisasi Subject. */
        this._unSubs$ = new Subject<void>();

        /** Inisialisasi FormArray untuk kategori hingga level 4. */
        this.selectedCategoriesForm = this.fb.array([
            // Level 1
            this.fb.group({
                id: this.fb.control(null, Validators.required),
                idx: this.fb.control(null, Validators.required),
                name: this.fb.control(null, Validators.required)
            }, Validators.required),
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
            }),
        ], Validators.required);

        /** Melakukan observable saat nilai pada FormArray berubah. */
        this.selectedCategories$
            = this.selectedCategoriesForm.valueChanges
                .pipe(
                    takeUntil(this._unSubs$),
                    map<(Array<ISelectedCategoryForm>), string>(this.joinSelectedCategories)
                );

        /** Melakukan subscribe ke selector untuk mendapatkan kategori yang telah terpilih. */
        this.store.select(CatalogueSelectors.getSelectedCategories)
                    .pipe(
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(categories => {
                        console.log(categories);
                    });

        /** Dispatch action untuk request data category tree ke back-end. */
        this.store.dispatch(CatalogueActions.fetchCategoryTreeRequest());

        /** Memilih selector untuk melakukan "stream" perubahan category tree. */
        this.store
            .select(CatalogueSelectors.getCategoryTree)
            .pipe(
                takeUntil(this._unSubs$)
            ).subscribe(categories => {
                if (categories) {
                    /** Mengambil data category tree yang diperoleh dari back-end. */
                    this.categoryTree = categories;
                }
                
                /** Memaksa ChangeDetection-nya Angular untuk memeriksa perubahan pada view. */
                this._cd.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }
}

import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectorRef,
    ViewChild,
    ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MatInput } from '@angular/material';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService, ErrorMessageService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { map, takeUntil, distinctUntilChanged, debounceTime, tap } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { statusCatalogue } from '../status';
import { CatalogueActions } from '../store/actions';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';
import { CatalogueCategory } from '../models';
import { MatTableDataSource } from '@angular/material';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

interface CatalogueCategoryFlatNode {
    expandable: boolean;
    name: string;
    level: number;
}


interface ISelectedCategory {
    selected: string;
    data: Array<CatalogueCategory>;
}

const CATALOGUE_CATEGORIES_DUMMY: Array<CatalogueCategory> = [
    {
        'id': '1',
        'parentId': null,
        'category': 'Mandi & Perawatan Tubuh',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/mandi%20dan%20perawatan%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/Mandi.png',
        'sequence': null,
        'hasChild': true,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': [
            {
                'id': '2',
                'parentId': '1',
                'category': 'Deodorant Shampo',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/deodorant.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/deodorant.png',
                'sequence': null,
                'hasChild': true,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': [
                    {
                        'id': '9',
                        'parentId': '2',
                        'category': 'Anak',
                        'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/pasta+gigi+-+pastagigianak.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/pasta+gigi+-+pastagigianak.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    },
                    {
                        'id': '10',
                        'parentId': '2',
                        'category': 'Dewasa',
                        'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/sikat+gigi+-+5-9.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/sikat+gigi+-+5-9.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    },
                    {
                        'id': '11',
                        'parentId': '2',
                        'category': 'Sangat Uzur Sekali',
                        'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/sikat+gigi+-+5-9.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/sikat+gigi+-+5-9.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    },
                    {
                        'id': '31',
                        'parentId': '2',
                        'category': 'Makanan Binatang',
                        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/makanan%20hewan%403x.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/Hewan.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    }
                ]
            },
            {
                'id': '3',
                'parentId': '1',
                'category': 'Shampoo',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/shampoo+-+dove.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/shampoo+-+dove.png',
                'sequence': null,
                'hasChild': false,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': []
            },
            {
                'id': '4',
                'parentId': '1',
                'category': 'Mouthwash',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/mouthwash.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/mouthwash.png',
                'sequence': null,
                'hasChild': false,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': []
            }
        ]
    },
    {
        'id': '5',
        'parentId': null,
        'category': 'Makanan',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/makanan%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/Makanan.png',
        'sequence': 2,
        'hasChild': true,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': [
            {
                'id': '6',
                'parentId': '5',
                'category': 'Mentega',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/mentega+-+blueband.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/mentega+-+blueband.png',
                'sequence': null,
                'hasChild': false,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': []
            },
            {
                'id': '7',
                'parentId': '5',
                'category': 'Sereal',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/makanan+-+sereal.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/makanan+-+sereal.png',
                'sequence': null,
                'hasChild': false,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': []
            },
            {
                'id': '8',
                'parentId': '5',
                'category': 'Makanan Kaleng',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/Makanan+-+sarden+kaleng.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/Makanan+-+sarden+kaleng.png',
                'sequence': null,
                'hasChild': false,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': []
            }
        ]
    },
    {
        'id': '12',
        'parentId': null,
        'category': 'Susu',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/susu%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/Susu.png',
        'sequence': null,
        'hasChild': true,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': [
            {
                'id': '13',
                'parentId': '12',
                'category': 'Susu Bayi',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/bayi+-+0-6.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/bayi+-+0-6.png',
                'sequence': null,
                'hasChild': true,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': [
                    {
                        'id': '15',
                        'parentId': '13',
                        'category': '0 - 6 Bulan',
                        'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/bayi+-+0-6.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/bayi+-+0-6.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    },
                    {
                        'id': '16',
                        'parentId': '13',
                        'category': '6 - 12 Bulan',
                        'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/bayi+-+6-12.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/bayi+-+6-12.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    }
                ]
            },
            {
                'id': '14',
                'parentId': '12',
                'category': 'Susu Balita',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/anak+-+1-3tahun.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/anak+-+1-3tahun.png',
                'sequence': null,
                'hasChild': true,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': [
                    {
                        'id': '17',
                        'parentId': '14',
                        'category': '1 - 3 Tahun',
                        'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/anak+-+1-3tahun.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/anak+-+1-3tahun.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    },
                    {
                        'id': '18',
                        'parentId': '14',
                        'category': '3 - 5 Tahun',
                        'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/anak+-+3-5tahun.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/tigaraksa/anak+-+3-5tahun.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    }
                ]
            }
        ]
    },
    {
        'id': '19',
        'parentId': null,
        'category': 'Pembersih Pakaian',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/pembersih%20pakaian%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/pembersihpakaian.png',
        'sequence': null,
        'hasChild': true,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': [
            {
                'id': '20',
                'parentId': '19',
                'category': 'Pewangi',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/pewangi+-+molto.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/pewangi+-+molto.png',
                'sequence': null,
                'hasChild': false,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': []
            },
            {
                'id': '21',
                'parentId': '19',
                'category': 'Softener',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/softener+-+molto.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/softener+-+molto.png',
                'sequence': null,
                'hasChild': false,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': []
            },
            {
                'id': '22',
                'parentId': '19',
                'category': 'Deterjen',
                'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/deterjen+bubuk+-+rinso.png',
                'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/deterjen+bubuk+-+rinso.png',
                'sequence': null,
                'hasChild': false,
                'status': 'active',
                'createdAt': '2019-11-06T03:23:05.751Z',
                'updatedAt': '2019-11-06T03:23:05.751Z',
                'deletedAt': null,
                'children': [
                    {
                        'id': '23',
                        'parentId': '22',
                        'category': 'Deterjen Bubuk',
                        'iconHome': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/deterjen+bubuk+-+rinso.png',
                        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/bukalapak+kategori/deterjen+bubuk+-+rinso.png',
                        'sequence': null,
                        'hasChild': false,
                        'status': 'active',
                        'createdAt': '2019-11-06T03:23:05.751Z',
                        'updatedAt': '2019-11-06T03:23:05.751Z',
                        'deletedAt': null,
                        'children': []
                    }
                ]
            }
        ]
    },
    {
        'id': '24',
        'parentId': null,
        'category': 'Kosmetik',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/kosmetik%403x.png',
        'iconTree': 'https://s3.amazonaws.com/sinbad-website/odoo_img/kategori/Kecantikan.png',
        'sequence': 1,
        'hasChild': false,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': []
    },
    {
        'id': '25',
        'parentId': null,
        'category': 'Rokok',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/rokok%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/rokok.png',
        'sequence': 3,
        'hasChild': false,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': []
    },
    {
        'id': '26',
        'parentId': null,
        'category': 'Permen',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/permen%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/Permen.png',
        'sequence': null,
        'hasChild': false,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': []
    },
    {
        'id': '27',
        'parentId': null,
        'category': 'Perlengkapan Rumah Tangga',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/perlengkapan%20rumah%20tangga%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/perlengkapanrumahtangga.png',
        'sequence': null,
        'hasChild': false,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': []
    },
    {
        'id': '28',
        'parentId': null,
        'category': 'Pakaian',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/pakaian%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/pakaian.png',
        'sequence': null,
        'hasChild': false,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': []
    },
    {
        'id': '29',
        'parentId': null,
        'category': 'Minuman',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/minuman%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/Minuman.png',
        'sequence': null,
        'hasChild': false,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': []
    },
    {
        'id': '30',
        'parentId': null,
        'category': 'Makanan Hewan',
        'iconHome': 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/category_home_icon/makanan%20hewan%403x.png',
        'iconTree': 'https://sinbad-website.s3.amazonaws.com/odoo_img/kategori/Hewan.png',
        'sequence': null,
        'hasChild': false,
        'status': 'active',
        'createdAt': '2019-11-06T03:23:05.751Z',
        'updatedAt': '2019-11-06T03:23:05.751Z',
        'deletedAt': null,
        'children': []
    }
];
// 
@Component({
    selector: 'app-catalogues-add-new-product',
    templateUrl: './catalogues-add-new-product.component.html',
    styleUrls: ['./catalogues-add-new-product.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CataloguesAddNewProductComponent implements OnInit {

    isFulfilled = false;
    productName: FormControl;
    search: FormControl;
    selectedCategories$: Observable<string>;

    subs: Subscription = new Subscription();

    selectedCategory: FormArray;

    @ViewChild('productNameInput', { static: true }) productNameInput: ElementRef;
    
    // _transform = (node: CatalogueCategory, level: number) => ({
    //     expandable: !!node.children && node.children.length > 0,
    //     id: node.id,
    //     name: node.category,
    //     data: node,
    //     level: level
    // })
    
    // treeControl = new FlatTreeControl<CatalogueCategoryFlatNode>(
    //     node => node.level, node => node.expandable
    // );
    
    // treeFlattener = new MatTreeFlattener(
    //     this._transform, node => node.level, node => node.expandable, node => node.children
    // );

    // dataSource = [
    //     new MatTreeFlatDataSource(this.treeControl, this.treeFlattener, []),
    //     new MatTreeFlatDataSource(this.treeControl, this.treeFlattener, []),
    //     new MatTreeFlatDataSource(this.treeControl, this.treeFlattener, []),
    //     new MatTreeFlatDataSource(this.treeControl, this.treeFlattener, []),
    // ];

    selectedCategories: Array<ISelectedCategory> = [
        { data: [], selected: '' },
        { data: [], selected: '' },
        { data: [], selected: '' },
        { data: [], selected: '' }
    ];
    categoryTree: Array<CatalogueCategory>;
    // selectedCategories: Array<string> = ['', '', '', ''];

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
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
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

        this._fuseTranslationLoaderService.loadTranslations(
            indonesian,
            english
        );
    }

    ngOnInit() {
        this._unSubs$ = new Subject<void>();

        this.productName = new FormControl('', [
            RxwebValidators.required({
                message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
            })
        ]);
        this.search = new FormControl('', Validators.required);

        // this.subs.add(this.productName.valueChanges.pipe(
        //     debounceTime(1000),
        //     distinctUntilChanged()
        // ).subscribe(() => {
        //     console.log('NAME', this.productName);
        //     console.log('Is fulfilled?', this.isFulfilled);
        // }));
// 
        this.store.dispatch(CatalogueActions.fetchCategoryTreeRequest());

        this.store
            .select(CatalogueSelectors.getCategoryTree)
            .pipe(
                takeUntil(this._unSubs$)
            ).subscribe(categories => {
                this.categoryTree = categories;
                this._cd.markForCheck();
            });

        this.selectedCategory = this.fb.array([
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

        this.selectedCategories$ = this.selectedCategory.valueChanges
                                    .pipe(
                                        map(forms => {
                                            const form: [] = forms.filter(f => f.id).map(f => f.name);

                                            return form.join(' > ');
                                        })
                                    );
    }

    ngAfterViewInit() {
        this.productNameInput.nativeElement.focus();
    }

    ngOnDestroy() {
        this._unSubs$.next();
        this._unSubs$.complete();

        this.subs.unsubscribe();
    }

    onSelectCategory(_: Event, id: string, data: CatalogueCategory, name: string, level: number, hasChild: any): void {
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
                const idx = CATALOGUE_CATEGORIES_DUMMY.findIndex(category => category.id === data.id);
                this.selectedCategories[level + 1].data = this.categoryTree[idx].children;
            } else {
                this.selectedCategories[level + 1].data = data.children;
            }
            resetTree(level + 2);
        } else {
            this.isFulfilled = true;
            resetTree(level + 1);
        }

        // if (isHasChild) {
        //     let idx = this.selectedCategory.controls[0].get('id').value;
        //     const firstIdx = CATALOGUE_CATEGORIES_DUMMY.findIndex(category => category.id === idx);

        //     if (level === 0) {
        //         idx = CATALOGUE_CATEGORIES_DUMMY.findIndex(category => category.id === id);

        //         if (idx >= 0) {
        //             this.dataSource[level + 1].data = CATALOGUE_CATEGORIES_DUMMY[idx].children;
        //         }
        //     } else {
        //         let tempLevel = level;
        //         let tempIdx   = [];

        //         while (tempLevel > 0) {
        //             tempIdx = this.selectedCategory.controls[level].get('idx').value;
        //             tempIdx.push(tempIdx);
        //             tempLevel--;
        //         }

        //         let tempData: CatalogueCategory;

        //         for (const _idx of tempIdx.reverse()) {
        //             tempData = !tempData ? CATALOGUE_CATEGORIES_DUMMY[index]
        //                         : tempData.children[_idx];
        //         }

        //         this.dataSource[level + 1].data = tempData.children;
        //     }
        // }
        
        this.selectedCategory.controls[level].get('id').setValue(id);
        this.selectedCategory.controls[level].get('name').setValue(name);


        const categories = this.selectedCategory.controls.filter(control => control.get('id').value).map(control => control.get('id').value);
    }

    addNewCatalogue() {
        this.store.dispatch(CatalogueActions.setSelectedCategories({
            payload: [
                ...this.selectedCategory.controls
                    .filter(control => control.get('id').value)
                    .map((control, idx, controls) => ({
                        id: control.get('id').value,
                        name: control.get('name').value,
                        parent: idx === 0 ? null : controls[idx - 1].get('id').value
                    })
                )
            ]
        }));

        this.store.dispatch(CatalogueActions.setProductName({
            payload: this.productName.value
        }));

        this.router.navigate([ 'pages', 'catalogues', 'add', 'new' ]);
    }

    hasChild = (_: number, node: CatalogueCategoryFlatNode) => node.expandable;

    getFormError(form: FormControl | FormGroup | FormArray): string {
        return this.errorMessageSvc.getFormError(form);
    }
}

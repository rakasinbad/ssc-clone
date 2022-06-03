// import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
// import { fuseAnimations } from '@fuse/animations';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';

// @Component({
//     selector: 'app-in-store-catalogs',
//     templateUrl: './in-store-catalogs.component.html',
//     styleUrls: ['./in-store-catalogs.component.scss'],
//     animations: fuseAnimations,
//     encapsulation: ViewEncapsulation.None
// })
// export class InStoreCatalogsComponent implements OnInit {
//     dataSource: Array<object>;
//     displayedColumns = ['id', 'image', 'name', 'address', 'type', 'active', 'actions'];

//     @ViewChild(MatPaginator, { static: true })
//     paginator: MatPaginator;

//     @ViewChild(MatSort, { static: true })
//     sort: MatSort;

//     @ViewChild('filter', { static: true })
//     filter: ElementRef;

//     constructor() {}

//     ngOnInit(): void {
//         this.dataSource = this.dummySource();
//     }

//     private dummySource(): Array<object> {
//         return [
//             {
//                 id: '300',
//                 addition: 2,
//                 subtraction: null,
//                 imageUrl: 'https://s3.amazonaws.com/sinbad-website/odoo_img/product/110006.png',
//                 name: 'S-26 GLOBAL 900GR'
//                 notes: '',
//                 source: 'manual',
//                 sourceNumber: 'N07272',
//                 storeCatalogId: '9',
//                 conditionId: '2',
//                 creatorId: '2',
//                 createdAt: '2019-09-06T07:31:05.907Z',
//                 updatedAt: '2019-09-06T07:31:05.907Z',
//                 deletedAt: null,
//                 userId: null,
//                 storeCatalogs: {
//                     id: '9',
//                     catalogOdooId: '15485',
//                     status: 'active',
//                     storeId: '3',
//                     createdAt: '2019-09-06T07:31:05.885Z',
//                     updatedAt: '2019-09-06T07:31:05.885Z',
//                     deletedAt: null
//                 },
//                 condition: {
//                     id: '2',
//                     name: 'Ditemukan',
//                     method: 'plus',
//                     createdAt: '2019-09-06T07:31:05.892Z',
//                     updatedAt: '2019-09-06T07:31:05.892Z',
//                     deletedAt: null
//                 }
//             },
//             {
//                 id: '299',
//                 addition: null,
//                 subtraction: 3,
//                 imageUrl: '',
//                 notes: '',
//                 source: 'manual',
//                 sourceNumber: 'N07271',
//                 storeCatalogId: '2',
//                 conditionId: '3',
//                 creatorId: '1',
//                 createdAt: '2019-09-06T07:31:05.907Z',
//                 updatedAt: '2019-09-06T07:31:05.907Z',
//                 deletedAt: null,
//                 userId: null,
//                 storeCatalogs: {
//                     id: '2',
//                     catalogOdooId: '15582',
//                     status: 'active',
//                     storeId: '1',
//                     createdAt: '2019-09-06T07:31:05.885Z',
//                     updatedAt: '2019-09-06T07:31:05.885Z',
//                     deletedAt: null
//                 },
//                 condition: {
//                     id: '3',
//                     name: 'Rusak',
//                     method: 'minus',
//                     createdAt: '2019-09-06T07:31:05.892Z',
//                     updatedAt: '2019-09-06T07:31:05.892Z',
//                     deletedAt: null
//                 }
//             },
//             {
//                 id: '298',
//                 addition: 6,
//                 subtraction: null,
//                 imageUrl: '',
//                 notes: '',
//                 source: 'default',
//                 sourceNumber: 'N07272',
//                 storeCatalogId: '1',
//                 conditionId: '2',
//                 creatorId: '2',
//                 createdAt: '2019-09-06T07:31:05.907Z',
//                 updatedAt: '2019-09-06T07:31:05.907Z',
//                 deletedAt: null,
//                 userId: null,
//                 storeCatalogs: {
//                     id: '1',
//                     catalogOdooId: '15500',
//                     status: 'active',
//                     storeId: '1',
//                     createdAt: '2019-09-06T07:31:05.885Z',
//                     updatedAt: '2019-09-06T07:31:05.885Z',
//                     deletedAt: null
//                 },
//                 condition: {
//                     id: '2',
//                     name: 'Ditemukan',
//                     method: 'plus',
//                     createdAt: '2019-09-06T07:31:05.892Z',
//                     updatedAt: '2019-09-06T07:31:05.892Z',
//                     deletedAt: null
//                 }
//             },
//             {
//                 id: '297',
//                 addition: null,
//                 subtraction: 3,
//                 imageUrl: '',
//                 notes: '',
//                 source: 'pod',
//                 sourceNumber: 'N07271',
//                 storeCatalogId: '1',
//                 conditionId: '3',
//                 creatorId: '1',
//                 createdAt: '2019-09-06T07:31:05.907Z',
//                 updatedAt: '2019-09-06T07:31:05.907Z',
//                 deletedAt: null,
//                 userId: null,
//                 storeCatalogs: {
//                     id: '1',
//                     catalogOdooId: '15500',
//                     status: 'active',
//                     storeId: '1',
//                     createdAt: '2019-09-06T07:31:05.885Z',
//                     updatedAt: '2019-09-06T07:31:05.885Z',
//                     deletedAt: null
//                 },
//                 condition: {
//                     id: '3',
//                     name: 'Rusak',
//                     method: 'minus',
//                     createdAt: '2019-09-06T07:31:05.892Z',
//                     updatedAt: '2019-09-06T07:31:05.892Z',
//                     deletedAt: null
//                 }
//             },
//             {
//                 id: '296',
//                 addition: 5,
//                 subtraction: null,
//                 imageUrl: '',
//                 notes: '',
//                 source: 'pod',
//                 sourceNumber: 'N07272',
//                 storeCatalogId: '3',
//                 conditionId: '1',
//                 creatorId: '2',
//                 createdAt: '2019-09-06T07:31:05.907Z',
//                 updatedAt: '2019-09-06T07:31:05.907Z',
//                 deletedAt: null,
//                 userId: null,
//                 storeCatalogs: {
//                     id: '3',
//                     catalogOdooId: '15485',
//                     status: 'active',
//                     storeId: '1',
//                     createdAt: '2019-09-06T07:31:05.885Z',
//                     updatedAt: '2019-09-06T07:31:05.885Z',
//                     deletedAt: null
//                 },
//                 condition: {
//                     id: '1',
//                     name: 'Baik',
//                     method: 'plus',
//                     createdAt: '2019-09-06T07:31:05.892Z',
//                     updatedAt: '2019-09-06T07:31:05.892Z',
//                     deletedAt: null
//                 }
//             }
//         ];
//     }
// }

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
// import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
// import { getParams } from 'app/store/app.reducer';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { of } from 'rxjs';
import {
    catchError,
    concatMap,
    exhaustMap,
    finalize,
    map,
    mergeMap,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { Catalogue, CatalogueCategory, CatalogueUnit } from '../../models';
import { CataloguesService } from '../../services';
import { CatalogueActions } from '../actions';
import { fromCatalogue } from '../reducers';
import { state } from '@angular/animations';

@Injectable()
export class CatalogueEffects {

    patchCatalogueRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.patchCatalogueRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$catalogueApi.patchCatalogue(payload.id, payload.data)
                    .pipe(
                        catchOffline(),
                        map(() => {
                            return CatalogueActions.patchCatalogueSuccess();
                        }),
                        catchError(err =>
                            of(
                                CatalogueActions.patchCatalogueFailure({
                                    payload: {
                                        id: 'patchCatalogueFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    patchCatalogueSuccess$ = createEffect(() => 
        this.actions$.pipe(
            ofType(CatalogueActions.patchCatalogueSuccess),
            tap(() => {
                this._$notice.open('Produk berhasil di-update', 'success', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });

                this.matDialog.closeAll();
            })
        ), { dispatch: false }
    );

    fetchCatalogueCategorySuccess$ = createEffect(() => 
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCatalogueCategorySuccess),
            map(action => {
                const { id, category: name, parentId: parent } = action.payload.category;

                if (parent) {
                    this.store.dispatch(CatalogueActions.fetchCatalogueCategoryRequest({ payload: parent }));
                }

                return CatalogueActions.addSelectedCategory({
                    payload: { id, name, parent }
                });
            })
        )
    );

    fetchCatalogueCategoryRequest$ = createEffect(() => 
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCatalogueCategoryRequest),
            map(action => action.payload),
            switchMap(categoryId => {
                return this._$catalogueApi
                    .getCategory(Number(categoryId))
                    .pipe(
                        map(response => {
                            return CatalogueActions.fetchCatalogueCategorySuccess({
                                payload: {
                                    // category: actions[actions.length - 1],
                                    category: response,
                                    source: 'fetch'
                                }
                            });
                        }),
                        catchError(err => 
                            of(CatalogueActions.fetchCatalogueCategoryFailure({
                                payload: { id: 'fetchCatalogueCategoryFailure', errors: err }
                            }))
                        )
                    );
            })
        )
    );

    fetchTotalCatalogueStatuses = createEffect(() => 
        this.actions$.pipe(
            ofType(CatalogueActions.fetchTotalCatalogueStatusRequest),
            switchMap(_ => {
                return this._$catalogueApi
                    .fetchTotalCatalogueStatuses()
                    .pipe(
                        map(response => {
                            return CatalogueActions.fetchTotalCatalogueStatusSuccess({
                                payload: {
                                    totalInactive: Number(response.totalinactive),
                                    totalActive: Number(response.totalactive),
                                    totalEmptyStock: Number(response.totalemptystock),
                                    totalBanned: Number(response.totalbanned),
                                    totalAllStatus: Number(response.total)
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                CatalogueActions.fetchTotalCatalogueStatusFailure({
                                    payload: { id: 'fetchTotalCatalogueStatusFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    addNewCatalogueRequest$ = createEffect(() => 
        this.actions$.pipe(
            ofType(CatalogueActions.addNewCatalogueRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$catalogueApi
                    .addNewCatalogue(payload)
                    .pipe(
                        map<Catalogue, any>(catalogue => {
                            return CatalogueActions.addNewCatalogueSuccess({
                                payload: catalogue
                            });
                        }),
                        catchError(err =>
                            of(
                                CatalogueActions.addNewCatalogueFailure({
                                    payload: { id: 'addNewCatalogueFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchCatalogueUnitRequest$ = createEffect(() => 
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCatalogueUnitRequest),
            switchMap(_ => {
                return this._$catalogueApi
                    .getCatalogueUnitOfMeasurement({ limit: 10, skip: 0, sort: 'desc', sortBy: 'id' })
                    .pipe(
                        catchOffline(),
                        map<Array<CatalogueUnit>, any>(units => {
                            return CatalogueActions.fetchCatalogueUnitSuccess({
                                payload: {
                                    units: [
                                        ...units.map(unit => ({
                                            ...new CatalogueUnit(
                                                unit.id,
                                                unit.unit,
                                                unit.status,
                                                unit.createdAt,
                                                unit.updatedAt,
                                                unit.deletedAt
                                            )
                                        }))
                                    ],
                                    source: 'fetch'
                                }
                            });
                        })
                    );
            })
        )
    );

    fetchCatalogueCategoriesRequest$ = createEffect(() =>
    this.actions$.pipe(
        ofType(CatalogueActions.fetchCategoryTreeRequest),
        switchMap(_ => {
            return this._$catalogueApi
                .getCategoryTree()
                .pipe(
                    catchOffline(),
                    map<Array<CatalogueCategory>, any>(categories => {
                        if (categories.length > 0) {
                            return CatalogueActions.fetchCategoryTreeSuccess({
                                payload: {
                                    categories: [
                                        ...categories.map(category => ({
                                            ...new CatalogueCategory(
                                                category.id,
                                                category.parentId,
                                                category.category,
                                                category.iconHome,
                                                category.iconTree,
                                                category.sequence,
                                                category.hasChild,
                                                category.status,
                                                category.createdAt,
                                                category.updatedAt,
                                                category.deletedAt,
                                                category.children
                                            )
                                        }))
                                    ],
                                    source: 'fetch'
                                }
                            });
                        }
                    }),
                    catchError(err =>
                        of(
                            CatalogueActions.fetchCategoryTreeFailure({
                                payload: { id: 'fetchCategoryTreeFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchCataloguesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCataloguesRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$catalogueApi
                    .findAll(payload)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            let newResp = {
                                total: 0,
                                data: []
                            };

                            if (resp.total > 0) {
                                newResp = {
                                    total: resp.total,
                                    data: [
                                        ...resp.data.map(catalogue => {
                                            return {
                                                ...new Catalogue(
                                                    catalogue.id,
                                                    catalogue.name,
                                                    catalogue.barcode,
                                                    catalogue.information,
                                                    catalogue.description,
                                                    catalogue.detail,
                                                    catalogue.color,
                                                    catalogue.weight,
                                                    catalogue.dimension,
                                                    catalogue.sku,
                                                    catalogue.skuRef,
                                                    catalogue.productPrice,
                                                    catalogue.suggestRetailPrice,
                                                    catalogue.minQty,
                                                    catalogue.packagedQty,
                                                    catalogue.multipleQty,
                                                    catalogue.displayStock,
                                                    catalogue.stock,
                                                    catalogue.hazardLevel,
                                                    catalogue.forSale,
                                                    catalogue.unitOfMeasureId,
                                                    catalogue.purchaseUnitOfMeasure,
                                                    catalogue.status,
                                                    catalogue.principalId,
                                                    catalogue.catalogueTaxId,
                                                    catalogue.catalogueVariantId,
                                                    catalogue.brandId,
                                                    catalogue.firstCatalogueCategoryId,
                                                    catalogue.lastCatalogueCategoryId,
                                                    catalogue.catalogueTypeId,
                                                    catalogue.createdAt,
                                                    catalogue.updatedAt,
                                                    catalogue.deletedAt,
                                                    catalogue.catalogueCategoryId,
                                                    catalogue.catalogueUnitId,
                                                    catalogue.catalogueImages,
                                                    catalogue.catalogueTax,
                                                    catalogue.firstCatalogueCategory,
                                                    catalogue.lastCatalogueCategory,
                                                    catalogue.catalogueKeywordCatalogues,
                                                    catalogue.catalogueType,
                                                    catalogue.catalogueUnit,
                                                    catalogue.catalogueVariant
                                                )
                                            };
                                        })
                                    ]
                                };
                            }

                            return CatalogueActions.fetchCataloguesSuccess({
                                payload: { catalogues: newResp.data, total: newResp.total }
                            });
                        }),
                        catchError(err =>
                            of(
                                CatalogueActions.fetchCataloguesFailure({
                                    payload: { id: 'fetchCataloguesFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchCatalogueRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCatalogueRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$catalogueApi.findById(id).pipe(
                    catchOffline(),
                    map(resp =>
                        CatalogueActions.fetchCatalogueSuccess({
                            payload: {
                                catalogue: {
                                    ...new Catalogue(
                                        resp.id,
                                        resp.name,
                                        resp.barcode,
                                        resp.information,
                                        resp.description,
                                        resp.detail,
                                        resp.color,
                                        resp.weight,
                                        resp.dimension,
                                        resp.sku,
                                        resp.skuRef,
                                        resp.productPrice,
                                        resp.suggestRetailPrice,
                                        resp.minQty,
                                        resp.packagedQty,
                                        resp.multipleQty,
                                        resp.displayStock,
                                        resp.stock,
                                        resp.hazardLevel,
                                        resp.forSale,
                                        resp.unitOfMeasureId,
                                        resp.purchaseUnitOfMeasure,
                                        resp.status,
                                        resp.principalId,
                                        resp.catalogueTaxId,
                                        resp.catalogueVariantId,
                                        resp.brandId,
                                        resp.firstCatalogueCategoryId,
                                        resp.lastCatalogueCategoryId,
                                        resp.catalogueTypeId,
                                        resp.createdAt,
                                        resp.updatedAt,
                                        resp.deletedAt,
                                        resp.catalogueCategoryId,
                                        resp.catalogueUnitId,
                                        resp.catalogueImages,
                                        resp.catalogueTax,
                                        resp.firstCatalogueCategory,
                                        resp.lastCatalogueCategory,
                                        resp.catalogueKeywordCatalogues,
                                        resp.catalogueType,
                                        resp.catalogueUnit,
                                        resp.catalogueVariant
                                    )
                                },
                                source: 'fetch'
                            }
                        })
                    ),
                    catchError(err =>
                        of(
                            CatalogueActions.fetchCatalogueFailure({
                                payload: {
                                    id: 'fetchCatalogueFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    deleteCatalogueRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.removeCatalogueRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$catalogueApi.removeCatalogue(id).pipe(
                    map(response => {
                        console.log('RESPONSE', response);

                        return CatalogueActions.removeCatalogueSuccess({ payload: response });
                    }),
                    catchError(err => 
                        of(
                            CatalogueActions.removeCatalogueFailure({
                                payload: { id: 'removeCatalogueFailure', errors: err }
                            })
                        )
                    ),
                    finalize(() => {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    })
                );
            })
        )
    );

    setCatalogueToActive$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.setCatalogueToActiveRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$catalogueApi.setCatalogueToActive(id).pipe(
                    map(response => {
                        console.log('RESPONSE', response);

                        return CatalogueActions.setCatalogueToActiveSuccess({ payload: {
                            id: response.id,
                            changes: {
                                ...response
                            }
                        } });
                    }),
                    catchError(err => 
                        of(
                            CatalogueActions.setCatalogueToActiveFailure({
                                payload: { id: 'setCatalogueToActiveFailure', errors: err }
                            })
                        )
                    ),
                    finalize(() => {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    })
                );
            })
        )
    );

    setCatalogueToInactive$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.setCatalogueToInactiveRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$catalogueApi.setCatalogueToInactive(id).pipe(
                    map(response => {
                        console.log('RESPONSE', response);

                        return CatalogueActions.setCatalogueToInactiveSuccess({ payload: {
                            id: response.id,
                            changes: {
                                ...response
                            }
                        } });
                    }),
                    catchError(err => 
                        of(
                            CatalogueActions.setCatalogueToInactiveFailure({
                                payload: { id: 'setCatalogueToInactiveFailure', errors: err }
                            })
                        )
                    ),
                    finalize(() => {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    })
                );
            })
        )
    );

    /*
      ______                        ______   __                         
     /      \                      /      \ /  |                        
    /$$$$$$  |  ______   _______  /$$$$$$  |$$/   ______   _____  ____  
    $$ |  $$/  /      \ /       \ $$ |_ $$/ /  | /      \ /     \/    \ 
    $$ |      /$$$$$$  |$$$$$$$  |$$   |    $$ |/$$$$$$  |$$$$$$ $$$$  |
    $$ |   __ $$ |  $$ |$$ |  $$ |$$$$/     $$ |$$ |  $$/ $$ | $$ | $$ |
    $$ \__/  |$$ \__$$ |$$ |  $$ |$$ |      $$ |$$ |      $$ | $$ | $$ |
    $$    $$/ $$    $$/ $$ |  $$ |$$ |      $$ |$$ |      $$ | $$ | $$ |
     $$$$$$/   $$$$$$/  $$/   $$/ $$/       $$/ $$/       $$/  $$/  $$/                                                         
    */

    confirmRemoveCatalogue$ = createEffect(
        () =>
        this.actions$.pipe(
            ofType(CatalogueActions.confirmRemoveCatalogue),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                    data: {
                        title: 'Delete',
                        message: `Are you sure want to delete product <strong>${ params.name }</strong>?`,
                        id: params.id
                    }, disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(response => {
                console.log('CONFIRM DELETE', response);
                
                if (response) {
                    this.store.dispatch(
                        CatalogueActions.removeCatalogueRequest({ payload: response })
                    );
                } else {
                    this.store.dispatch(UiActions.resetHighlightRow());
                }
            })
        ), { dispatch: false }
    );

    confirmSetCatalogueToActive$ = createEffect(
        () =>
        this.actions$.pipe(
            ofType(CatalogueActions.confirmSetCatalogueToActive),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                    data: {
                        title: 'Set Product to Active',
                        message: `Are you sure want to set product <strong>${ params.name }</strong> to <strong>Active</strong>?`,
                        id: params.id
                    }, disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(response => {
                console.log('CONFIRM SET TO ACTIVE', response);
                
                if (response) {
                    this.store.dispatch(
                        CatalogueActions.setCatalogueToActiveRequest({ payload: response })
                    );
                } else {
                    this.store.dispatch(UiActions.resetHighlightRow());
                }
            })
        ), { dispatch: false }
    );

    confirmSetCatalogueToInactive$ = createEffect(
        () =>
        this.actions$.pipe(
            ofType(CatalogueActions.confirmSetCatalogueToInactive),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                    data: {
                        title: 'Set Product to Inactive',
                        message: `Are you sure want to set product <strong>${ params.name }</strong> to <strong>Inactive</strong>?`,
                        id: params.id
                    }, disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(response => {
                console.log('CONFIRM SET TO INACTIVE', response);
                
                if (response) {
                    this.store.dispatch(
                        CatalogueActions.setCatalogueToInactiveRequest({ payload: response })
                    );
                } else {
                    this.store.dispatch(UiActions.resetHighlightRow());
                }
            })
        ), { dispatch: false }
    );

    /*
     ________         __  __                                         
    /        |       /  |/  |                                        
    $$$$$$$$/______  $$/ $$ | __    __   ______    ______    _______ 
    $$ |__  /      \ /  |$$ |/  |  /  | /      \  /      \  /       |
    $$    | $$$$$$  |$$ |$$ |$$ |  $$ |/$$$$$$  |/$$$$$$  |/$$$$$$$/ 
    $$$$$/  /    $$ |$$ |$$ |$$ |  $$ |$$ |  $$/ $$    $$ |$$      \ 
    $$ |   /$$$$$$$ |$$ |$$ |$$ \__$$ |$$ |      $$$$$$$$/  $$$$$$  |
    $$ |   $$    $$ |$$ |$$ |$$    $$/ $$ |      $$       |/     $$/ 
    $$/     $$$$$$$/ $$/ $$/  $$$$$$/  $$/        $$$$$$$/ $$$$$$$/                                                           
    */
   fetchCatalogueCategoriesFailure$ = createEffect(
    () =>
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCategoryTreeFailure),
            map(action => action.payload),
            tap(resp => {
                this._$notice.open(resp.errors.error.message, 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            })
        ),
        { dispatch: false }
    );

    fetchCatalogueFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.fetchCatalogueFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open(resp.errors.error.message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    addNewCatalogueFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.addNewCatalogueFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open(resp.errors.error.message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    removeCatalogueFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.removeCatalogueFailure),
            map(action => action.payload),
            tap(response => {
                console.log('GAGAL', response);

                this._$notice.open('Produk gagal dihapus', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            })
        ), { dispatch: false }
    );

    setCatalogueToActiveFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.setCatalogueToActiveFailure),
            map(action => action.payload),
            tap(response => {
                console.log('GAGAL', response);

                this._$notice.open('Status produk gagal diubah menjadi aktif', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            })
        ), { dispatch: false }
    );

    setCatalogueToInactiveFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.setCatalogueToInactiveFailure),
            map(action => action.payload),
            tap(response => {
                console.log('GAGAL', response);

                this._$notice.open('Status produk gagal diubah menjadi tidak aktif', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            })
        ), { dispatch: false }
    );

    /*
      ______                                                             
    /      \                                                            
    /$$$$$$  | __    __   _______   _______   ______    _______  _______ 
    $$ \__$$/ /  |  /  | /       | /       | /      \  /       |/       |
    $$      \ $$ |  $$ |/$$$$$$$/ /$$$$$$$/ /$$$$$$  |/$$$$$$$//$$$$$$$/ 
     $$$$$$  |$$ |  $$ |$$ |      $$ |      $$    $$ |$$      \$$      \ 
    /  \__$$ |$$ \__$$ |$$ \_____ $$ \_____ $$$$$$$$/  $$$$$$  |$$$$$$  |
    $$    $$/ $$    $$/ $$       |$$       |$$       |/     $$//     $$/ 
    $$$$$$/   $$$$$$/   $$$$$$$/  $$$$$$$/  $$$$$$$/ $$$$$$$/ $$$$$$$/  
    */

    removeCatalogueSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.removeCatalogueSuccess),
            map(action => action.payload),
            tap(response => {
                console.log('SUKSES', response);
                this._$notice.open('Produk berhasil dihapus', 'success', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            })
        ), { dispatch: false }
    );

    addNewCatalogueSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.addNewCatalogueSuccess),
            map(action => action.payload),
            tap(response => {
                console.log('SUKSES', response);
                this._$notice.open('Berhasil menambah produk baru', 'success', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
                this.router.navigate(['pages', 'catalogues']);
            })
        ), { dispatch: false }
    );

    setCatalogueToActiveSucess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.setCatalogueToActiveSuccess),
            map(action => action.payload),
            tap(response => {
                console.log('SUKSES', response);
                this._$notice.open('Status produk berhasil diubah menjadi aktif', 'success', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            })
        ), { dispatch: false }
    );

    setCatalogueToInactiveSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.setCatalogueToInactiveSuccess),
            map(action => action.payload),
            tap(response => {
                console.log('SUKSES', response);
                this._$notice.open('Status produk berhasil diubah menjadi tidak aktif', 'success', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            })
        ), { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromCatalogue.FeatureState>,
        protected network: Network,
        private _$log: LogService,
        private _$catalogueApi: CataloguesService,
        private _$notice: NoticeService
    ) {}
}

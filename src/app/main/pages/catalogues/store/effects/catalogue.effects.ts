import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Update } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { IQueryParams } from 'app/shared/models/query.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { Catalogue, CatalogueCategory, CatalogueUnit } from '../../models';
import { CataloguesService } from '../../services';
import { CatalogueActions } from '../actions';
import { fromCatalogue } from '../reducers';

@Injectable()
export class CatalogueEffects {
    patchCatalogueRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.patchCatalogueRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$catalogueApi.patchCatalogue(payload.id, payload.data).pipe(
                    catchOffline(),
                    map(catalogue => {
                        return CatalogueActions.patchCatalogueSuccess({
                            payload: {
                                data: catalogue,
                                source: payload.source,
                                section: payload.section,
                            }
                        });
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
                    ),
                    finalize(() => this.store.dispatch(FormActions.resetClickSaveButton()))
                );
            })
        )
    );

    patchCatalogueSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.patchCatalogueSuccess),
                map(action => action.payload),
                tap(({ data: catalogue, source, section }) => {
                    this._$notice.open('Produk berhasil di-update', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    if (source === 'form') {
                        if (!section) {
                            this.router.navigate(['pages', 'catalogues']);
                        } else {
                            const changes = { ...catalogue };

                            const updatedCatalogue: Update<Catalogue> = {
                                id: catalogue.id,
                                changes
                            };

                            this.store.dispatch(
                                CatalogueActions.updateCatalogue({ catalogue: updatedCatalogue })
                            );
                        }
                    } else if (source === 'list') {
                        this.matDialog.closeAll();
                        // this.router.navigate(['pages', 'catalogues']);
                        const changes = { ...catalogue };

                        const updatedCatalogue: Update<Catalogue> = {
                            id: catalogue.id,
                            changes
                        };

                        this.store.dispatch(
                            CatalogueActions.updateCatalogue({ catalogue: updatedCatalogue })
                        );
                    }

                    this.store.dispatch(CatalogueActions.setRefreshStatus({ status: true }));
                })
            ),
        { dispatch: false }
    );

    patchCataloguesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.patchCataloguesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([{ file, type }, userSupplier]) => {
                if (!userSupplier) {
                    return of(
                        CatalogueActions.patchCataloguesFailure({
                            payload: {
                                id: 'patchCataloguesFailure',
                                errors: 'Not authenticated'
                            }
                        })
                    );
                }

                const formData: FormData = new FormData();
                formData.append('file', file);
                formData.append('supplierId', userSupplier.supplierId);
                formData.append('type', type);

                return this._$catalogueApi.updateCataloguePrices(formData).pipe(
                    catchOffline(),
                    map(response => {
                        return CatalogueActions.patchCataloguesSuccess({
                            payload: {
                                status: response.status
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            CatalogueActions.patchCataloguesFailure({
                                payload: {
                                    id: 'patchCataloguesFailure',
                                    errors: err
                                }
                            })
                        )
                    ),
                    finalize(() => this.store.dispatch(FormActions.resetClickSaveButton()))
                );
            })
        )
    );

    patchCataloguesSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.patchCataloguesSuccess),
                map(action => action.payload),
                tap(() => {
                    this._$notice.open('Produk berhasil di-update', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    this.matDialog.closeAll();

                    this.store.dispatch(CatalogueActions.setRefreshStatus({ status: true }));
                })
            ),
        { dispatch: false }
    );

    importCataloguesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.importCataloguesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([{ file, type }, userSupplier]) => {
                if (!userSupplier) {
                    return of(
                        CatalogueActions.patchCataloguesFailure({
                            payload: {
                                id: 'importCataloguesFailure',
                                errors: 'Not authenticated'
                            }
                        })
                    );
                }

                const formData: FormData = new FormData();
                formData.append('file', file);
                formData.append('supplierId', userSupplier.supplierId);
                formData.append('type', type);

                return this._$catalogueApi.updateCataloguePrices(formData).pipe(
                    catchOffline(),
                    map(response => {
                        return CatalogueActions.importCataloguesSuccess({
                            payload: {
                                status: response.status
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            CatalogueActions.importCataloguesFailure({
                                payload: {
                                    id: 'importCataloguesFailure',
                                    errors: err
                                }
                            })
                        )
                    ),
                    finalize(() => this.store.dispatch(FormActions.resetClickSaveButton()))
                );
            })
        )
    );

    importCataloguesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.importCataloguesFailure),
                map(action => action.payload),
                tap(resp => {
                    let message: string;

                    if (resp.errors.code === 406) {
                        message = resp.errors.error.errors
                            .map(r => {
                                return `${r.errCode}<br>${r.solve}`;
                            })
                            .join('<br><br>');
                    } else {
                        if (typeof resp.errors === 'string') {
                            message = resp.errors;
                        } else {
                            message =
                                resp.errors.error && resp.errors.error.message
                                    ? resp.errors.error.message
                                    : resp.errors.message;
                        }
                    }

                    this._$notice.open(message, 'error', {
                        duration: 10000,
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    // this.matDialog.closeAll();

                    // this.store.dispatch(
                    //     CatalogueActions.setRefreshStatus({ status: true })
                    // );
                })
            ),
        { dispatch: false }
    );

    importCataloguesSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.patchCataloguesSuccess),
                map(action => action.payload),
                tap(() => {
                    this._$notice.open('Import produk berhasil.', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    this.matDialog.closeAll();

                    this.store.dispatch(CatalogueActions.setRefreshStatus({ status: true }));
                })
            ),
        { dispatch: false }
    );

    fetchCatalogueCategorySuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCatalogueCategorySuccess),
            map(action => {
                const { id, category: name, parentId: parent } = action.payload.category;

                if (parent) {
                    this.store.dispatch(
                        CatalogueActions.fetchCatalogueCategoryRequest({ payload: parent })
                    );
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
                return this._$catalogueApi.getCategory(Number(categoryId)).pipe(
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
                        of(
                            CatalogueActions.fetchCatalogueCategoryFailure({
                                payload: { id: 'fetchCatalogueCategoryFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchTotalCatalogueStatuses = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.fetchTotalCatalogueStatusRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                /** NO SUPPLIER ID! */
                if (!supplierId) {
                    return of(
                        CatalogueActions.fetchCataloguesFailure({
                            payload: {
                                id: 'fetchCataloguesFailure',
                                errors: 'Not authenticated'
                            }
                        })
                    );
                }

                const params: IQueryParams = {};
                params['supplierId'] = supplierId;

                return this._$catalogueApi.fetchTotalCatalogueStatuses(params).pipe(
                    map(
                        ({
                            total: totalAllStatus,
                            totalEmptyStock,
                            totalActive,
                            totalInactive,
                            totalBanned
                        }) => {
                            return CatalogueActions.fetchTotalCatalogueStatusSuccess({
                                payload: {
                                    totalAllStatus,
                                    totalEmptyStock,
                                    totalActive,
                                    totalInactive,
                                    totalBanned
                                }
                            });
                        }
                    ),
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
                return this._$catalogueApi.addNewCatalogue(payload).pipe(
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
                    ),
                    finalize(() => this.store.dispatch(FormActions.resetClickSaveButton()))
                );
            })
        )
    );

    fetchCatalogueUnitRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCatalogueUnitRequest),
            switchMap(_ => {
                return this._$catalogueApi
                    .getCatalogueUnitOfMeasurement({
                        limit: 10,
                        skip: 0,
                        sort: 'desc',
                        sortBy: 'id'
                    })
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
            ofType(CatalogueActions.fetchCatalogueCategoriesRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$catalogueApi.getCatalogueCategories(payload).pipe(
                    catchOffline(),
                    map<Array<CatalogueCategory>, any>(categories => {
                        if (categories.length > 0) {
                            return CatalogueActions.fetchCatalogueCategoriesSuccess({
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
                            CatalogueActions.fetchCatalogueCategoryFailure({
                                payload: { id: 'fetchCatalogueCategoryFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchCategoryTreeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCategoryTreeRequest),
            switchMap(_ => {
                return this._$catalogueApi.getCategoryTree().pipe(
                    catchOffline(),
                    map<Array<CatalogueCategory>, any>(categories => {
                        if (categories.length > 0) {
                            return CatalogueActions.fetchCategoryTreeSuccess({
                                payload: {
                                    categoryTree: [
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
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                /** NO SUPPLIER ID! */
                if (!supplierId) {
                    return of(
                        CatalogueActions.fetchCataloguesFailure({
                            payload: {
                                id: 'fetchCataloguesFailure',
                                errors: 'Not authenticated'
                            }
                        })
                    );
                }

                const newPayload: IQueryParams = {
                    ...payload
                };
                newPayload['supplierId'] = supplierId;

                return this._$catalogueApi.findAll(newPayload).pipe(
                    catchOffline(),
                    map(resp => {
                        let newResp = {
                            total: 0,
                            data: []
                        };

                        if (resp.total > 0) {
                            newResp = {
                                total: resp.total,
                                data: [...resp.data.map(catalogue => new Catalogue(catalogue))]
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
                                catalogue: new Catalogue(resp),
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

    fetchCatalogueStockRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.fetchCatalogueStockRequest),
                map(action => action.payload),
                switchMap(id => {
                    return this._$catalogueApi.getStock(id).pipe(
                        catchOffline(),
                        map(resp =>
                            this.store.dispatch(
                                CatalogueActions.fetchCatalogueStockSuccess({
                                    payload: {
                                        catalogueId: id,
                                        stock: resp
                                    }
                                })
                            )
                        ),
                        catchError(err =>
                            of(
                                CatalogueActions.fetchCatalogueStockFailure({
                                    payload: {
                                        id: 'fetchCatalogueStockFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                })
            ),
        { dispatch: false }
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
                        this.store.dispatch(FormActions.resetClickSaveButton());
                    })
                );
            })
        )
    );

    setRefreshStatusToActive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    CatalogueActions.setCatalogueToActiveSuccess,
                    CatalogueActions.setCatalogueToInactiveSuccess,
                ),
                map(action => action.payload),
                tap(() => {
                    this.store.dispatch(CatalogueActions.setRefreshStatus({ status: true }));
                })
            ),
        { dispatch: false }
    );

    setCatalogueToActive$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.setCatalogueToActiveRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$catalogueApi.setCatalogueToActive(id).pipe(
                    map(response => {
                        console.log('RESPONSE', response);

                        return CatalogueActions.setCatalogueToActiveSuccess({
                            payload: {
                                id: response.id,
                                changes: {
                                    ...response
                                }
                            }
                        });
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

                        return CatalogueActions.setCatalogueToInactiveSuccess({
                            payload: {
                                id: response.id,
                                changes: {
                                    ...response
                                }
                            }
                        });
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
                            message: `Are you sure want to delete product <strong>${params.name}</strong>?`,
                            id: params.id
                        },
                        disableClose: true
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
            ),
        { dispatch: false }
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
                            message: `Are you sure want to set product <strong>${params.name}</strong> to <strong>Active</strong>?`,
                            id: params.id
                        },
                        disableClose: true
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
            ),
        { dispatch: false }
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
                            message: `Are you sure want to set product <strong>${params.name}</strong> to <strong>Inactive</strong>?`,
                            id: params.id
                        },
                        disableClose: true
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
            ),
        { dispatch: false }
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
    fetchCategoryTreeFailure$ = createEffect(
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

    fetchCatalogueCategoriesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.fetchCatalogueCategoryFailure),
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

    removeCatalogueFailure$ = createEffect(
        () =>
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
            ),
        { dispatch: false }
    );

    setCatalogueToActiveFailure$ = createEffect(
        () =>
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
            ),
        { dispatch: false }
    );

    setCatalogueToInactiveFailure$ = createEffect(
        () =>
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
            ),
        { dispatch: false }
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

    removeCatalogueSuccess$ = createEffect(
        () =>
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
            ),
        { dispatch: false }
    );

    addNewCatalogueSuccess$ = createEffect(
        () =>
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
            ),
        { dispatch: false }
    );

    setCatalogueToActiveSucess$ = createEffect(
        () =>
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
            ),
        { dispatch: false }
    );

    setCatalogueToInactiveSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.setCatalogueToInactiveSuccess),
                map(action => action.payload),
                tap(response => {
                    console.log('SUKSES', response);
                    this._$notice.open(
                        'Status produk berhasil diubah menjadi tidak aktif',
                        'success',
                        {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        }
                    );
                })
            ),
        { dispatch: false }
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

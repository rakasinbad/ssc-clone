import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { Province, Urban } from 'app/shared/models/location.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { LocationApiService } from '../../services/location-api.service';
import { LocationActions, LocationFailureActionNames } from '../actions';
import { FeatureState as WarehouseCoverageCoreState } from '../reducers';
import { LocationSelectors } from '../selectors';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class LocationEffects {
    constructor(
        private actions$: Actions,
        // private authStore: NgRxStore<fromAuth.FeatureState>,
        private locationStore: NgRxStore<WarehouseCoverageCoreState>,
        // private notice: NoticeService,
        private locationApi$: LocationApiService,
        // private router: Router,
        private helper$: HelperService // private matDialog: MatDialog,
    ) {}

    fetchProvincesRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request province.
            ofType(LocationActions.fetchProvincesRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap((queryParams: IQueryParams) => {
                return of(queryParams).pipe(
                    switchMap<IQueryParams, Observable<AnyAction>>(this.processProvincesRequest),
                    catchError((err) => this.sendErrorToState(err, 'fetchProvincesFailure'))
                );
            })
        )
    );

    fetchCitiesRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request province.
            ofType(LocationActions.fetchCitiesRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil province yang terpilih dari state.
            withLatestFrom(this.locationStore.select(LocationSelectors.getSelectedProvince)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, selectedProvince]: [IQueryParams, string]) => {
                return of([queryParams, selectedProvince] as [IQueryParams, string]).pipe(
                    switchMap<[IQueryParams, string], Observable<AnyAction>>(
                        this.processCitiesRequest
                    ),
                    catchError((err) => this.sendErrorToState(err, 'fetchCitiesFailure'))
                );
            })
        )
    );

    fetchDistrictsRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request province.
            ofType(LocationActions.fetchDistrictsRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil city yang terpilih dari state.
            withLatestFrom(this.locationStore.select(LocationSelectors.getSelectedCity)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, selectedCity]: [IQueryParams, string]) => {
                return of([queryParams, selectedCity] as [IQueryParams, string]).pipe(
                    switchMap<[IQueryParams, string], Observable<AnyAction>>(
                        this.processDistrictsRequest
                    ),
                    catchError((err) => this.sendErrorToState(err, 'fetchDistrictsFailure'))
                );
            })
        )
    );

    fetchUrbansRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request urban.
            ofType(LocationActions.fetchUrbansRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil district yang terpilih dari state.
            withLatestFrom(
                this.locationStore.select(LocationSelectors.getSelectedProvince),
                this.locationStore.select(LocationSelectors.getSelectedCity),
                this.locationStore.select(LocationSelectors.getSelectedDistrict)
            ),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(
                ([queryParams, selectedProvince, selectedCity, selectedDistrict]: [
                    IQueryParams,
                    string,
                    string,
                    string
                ]) => {
                    return of([queryParams, selectedProvince, selectedCity, selectedDistrict] as [
                        IQueryParams,
                        string,
                        string,
                        string
                    ]).pipe(
                        switchMap<[IQueryParams, string, string, string], Observable<AnyAction>>(
                            this.processUrbansRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'fetchUrbansFailure'))
                    );
                }
            )
        )
    );

    checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throwError(
                new ErrorHandler({
                    id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                    errors: `User Data: ${userData}`,
                })
            );
        }

        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    };

    processProvincesRequest = (queryParams: IQueryParams): Observable<AnyAction> => {
        const newQuery: IQueryParams = {
            ...queryParams,
        };
        newQuery['locationType'] = 'province';

        return this.locationApi$.findLocation<Array<Province>>(newQuery).pipe(
            catchOffline(),
            switchMap((response: IPaginatedResponse<Province> | Array<Province>) => {
                if (queryParams.paginate) {
                    const newResponse = response as IPaginatedResponse<Province>;

                    return of(
                        LocationActions.fetchProvincesSuccess({
                            payload: {
                                data: newResponse.data.map((province) => new Province(province)),
                                total: newResponse.total,
                            },
                        })
                    );
                } else {
                    const newResponse = response as Array<Province>;

                    return of(
                        LocationActions.fetchProvincesSuccess({
                            payload: {
                                data: newResponse.map((province) => new Province(province)),
                                total: newResponse.length,
                            },
                        })
                    );
                }
            }),
            catchError((err) => this.sendErrorToState(err, 'fetchCitiesFailure'))
        );
    };

    processCitiesRequest = ([queryParams, selectedProvince]: [
        IQueryParams,
        string
    ]): Observable<AnyAction> => {
        if (!selectedProvince) {
            throw new ErrorHandler({
                id: 'ERR_PROVINCE_NOT_SELECTED',
                errors: 'Province not selected to find cities.',
            });
        }

        const newQuery: IQueryParams = {
            ...queryParams,
        };
        newQuery['locationType'] = 'city';
        newQuery['provinceId'] = selectedProvince;

        return this.locationApi$.findLocation<Array<{ city: string }>>(newQuery).pipe(
            catchOffline(),
            switchMap(
                (response: IPaginatedResponse<{ city: string }> | Array<{ city: string }>) => {
                    if (queryParams.paginate) {
                        const newResponse = response as IPaginatedResponse<{ city: string }>;

                        return of(
                            LocationActions.fetchCitiesSuccess({
                                payload: {
                                    cities: newResponse.data.map((city) => city.city),
                                    total: newResponse.total,
                                },
                            })
                        );
                    } else {
                        const newResponse = response as Array<{ city: string }>;

                        return of(
                            LocationActions.fetchCitiesSuccess({
                                payload: {
                                    cities: newResponse.map((city) => city.city),
                                    total: newResponse.length,
                                },
                            })
                        );
                    }
                }
            ),
            catchError((err) => this.sendErrorToState(err, 'fetchCitiesFailure'))
        );
    };

    processDistrictsRequest = ([queryParams, selectedCity]: [
        IQueryParams,
        string
    ]): Observable<AnyAction> => {
        if (!selectedCity) {
            throw new ErrorHandler({
                id: 'ERR_CITY_NOT_SELECTED',
                errors: 'City not selected to find districts.',
            });
        }

        const newQuery: IQueryParams = {
            ...queryParams,
        };
        newQuery['locationType'] = 'district';
        newQuery['city'] = selectedCity;

        return this.locationApi$.findLocation<Array<{ district: string }>>(newQuery).pipe(
            catchOffline(),
            switchMap(
                (
                    response: IPaginatedResponse<{ district: string }> | Array<{ district: string }>
                ) => {
                    if (queryParams.paginate) {
                        const newResponse = response as IPaginatedResponse<{ district: string }>;

                        return of(
                            LocationActions.fetchDistrictsSuccess({
                                payload: {
                                    districts: newResponse.data.map(
                                        (district) => district.district
                                    ),
                                    total: newResponse.total,
                                },
                            })
                        );
                    } else {
                        const newResponse = response as Array<{ district: string }>;

                        return of(
                            LocationActions.fetchDistrictsSuccess({
                                payload: {
                                    districts: newResponse.map((district) => district.district),
                                    total: newResponse.length,
                                },
                            })
                        );
                    }
                }
            ),
            catchError((err) => this.sendErrorToState(err, 'fetchDistrictsFailure'))
        );
    };

    processUrbansRequest = ([queryParams, selectedProvince, selectedCity, selectedDistrict]: [
        IQueryParams,
        string,
        string,
        string
    ]): Observable<AnyAction> => {
        if (!selectedProvince) {
            throw new ErrorHandler({
                id: 'ERR_PROVINCE_NOT_SELECTED',
                errors: 'Province not selected to find urbans.',
            });
        } else if (!selectedCity) {
            throw new ErrorHandler({
                id: 'ERR_CITY_NOT_SELECTED',
                errors: 'City not selected to find urbans.',
            });
        } else if (!selectedDistrict) {
            throw new ErrorHandler({
                id: 'ERR_DISTRICT_NOT_SELECTED',
                errors: 'District not selected to find urbans.',
            });
        }

        const newQuery: IQueryParams = {
            ...queryParams,
        };
        newQuery['locationType'] = 'urban';
        newQuery['provinceId'] = selectedProvince;
        newQuery['city'] = selectedCity;
        newQuery['district'] = selectedDistrict;

        return this.locationApi$.findLocation<Array<Urban>>(newQuery).pipe(
            catchOffline(),
            switchMap((response: IPaginatedResponse<Urban> | Array<Urban>) => {
                if (queryParams.paginate) {
                    const newResponse = response as IPaginatedResponse<Urban>;

                    return of(
                        LocationActions.fetchUrbansSuccess({
                            payload: {
                                urbans: newResponse.data.map((urban) => new Urban(urban)),
                                total: newResponse.total,
                            },
                        })
                    );
                } else {
                    const newResponse = response as Array<Urban>;

                    return of(
                        LocationActions.fetchUrbansSuccess({
                            payload: {
                                urbans: newResponse.map((urban) => new Urban(urban)),
                                total: newResponse.length,
                            },
                        })
                    );
                }
            }),
            catchError((err) => this.sendErrorToState(err, 'fetchUrbansFailure'))
        );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: LocationFailureActionNames
    ): Observable<AnyAction> => {
        // Memunculkan error di console.
        // console.error(err);

        this.helper$.showErrorNotification(err);

        if (err instanceof ErrorHandler) {
            return of(
                LocationActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                LocationActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            LocationActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    // Referensi: https://stackoverflow.com/a/26199752
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    };
}

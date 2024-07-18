// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
// import { Store } from '@ngrx/store';
// import { IQueryParams } from 'app/shared/models';
// import { Observable } from 'rxjs';
// import { filter, first, tap } from 'rxjs/operators';

// import { BrandStoreActions } from '../store/actions';
// import { fromMerchant } from '../store/reducers';
// import { BrandStoreSelectors } from '../store/selectors';

// /**
//  *
//  *
//  * @export
//  * @class MerchantResolver
//  * @implements {Resolve<any>}
//  */
// @Injectable({
//     providedIn: 'root'
// })
// export class MerchantResolver implements Resolve<any> {
//     /**
//      * Creates an instance of MerchantResolver.
//      * @param {Store<fromMerchant.FeatureState>} store
//      * @memberof MerchantResolver
//      */
//     constructor(private store: Store<fromMerchant.FeatureState>) {}

//     /**
//      *
//      *
//      * @param {ActivatedRouteSnapshot} route
//      * @returns {(Observable<any> | Promise<any> | any)}
//      * @memberof MerchantResolver
//      */
//     resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
//         return this.store.select(BrandStoreSelectors.getTotalBrandStore).pipe(
//             tap(total => {
//                 if (!total) {
//                     const data: IQueryParams = {
//                         limit: 5,
//                         skip: 5 * 0
//                     };

//                     data['paginate'] = true;

//                     this.store.dispatch(
//                         BrandStoreActions.fetchBrandStoresRequest({ payload: data })
//                     );
//                     // -----------------------------------------------------------------------------------------------------
//                     // For Demo
//                     // -----------------------------------------------------------------------------------------------------

//                     /* const generator = this._$generator.generator(
//                         GeneratorService.accountsStoreSchema,
//                         5,
//                         50
//                     );

//                     this.store.dispatch(StoreActions.generateStoresDemo({ payload: generator })); */
//                 }
//             }),
//             filter(total => !!total),
//             first()
//         );
//     }
// }

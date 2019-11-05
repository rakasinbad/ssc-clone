import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { GeneratorService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { CatalogueActions } from '../store/actions';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class CatalogueResolver implements Resolve<any> {
    constructor(
        private store: Store<fromCatalogue.FeatureState>,
        private _$generator: GeneratorService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(CatalogueSelectors.getAllCatalogues).pipe(
            tap(total => {
                console.log('RESOLVE TOTAL', total);
                if (!total) {
                    const data: IQueryParams = {
                        limit: 10,
                        skip: 10 * 0
                    };

                    data['paginate'] = true;

                    this.store.dispatch(
                        CatalogueActions.fetchCataloguesRequest({ payload: data })
                    );
                    /*
                     _______                                    
                    /       \                                   
                    $$$$$$$  |  ______   _____  ____    ______  
                    $$ |  $$ | /      \ /     \/    \  /      \ 
                    $$ |  $$ |/$$$$$$  |$$$$$$ $$$$  |/$$$$$$  |
                    $$ |  $$ |$$    $$ |$$ | $$ | $$ |$$ |  $$ |
                    $$ |__$$ |$$$$$$$$/ $$ | $$ | $$ |$$ \__$$ |
                    $$    $$/ $$       |$$ | $$ | $$ |$$    $$/ 
                    $$$$$$$/   $$$$$$$/ $$/  $$/  $$/  $$$$$$/                                                                  
                    */
                    // const generator = this._$generator.generator(
                    //     GeneratorService.cataloguesSchema,
                    //     50,
                    //     200
                    // );

                    // console.log(generator);

                    // this.store.dispatch(
                    //     CatalogueActions.generateCataloguesDemo({
                    //         payload: generator
                    //     })
                    // );
                }
            }),
            filter(total => !!total),
            first()
        );
    }
}

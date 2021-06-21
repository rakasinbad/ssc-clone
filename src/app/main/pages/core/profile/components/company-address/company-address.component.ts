import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FeatureState as GeolocationCoreState } from 'app/shared/components/geolocation/store/reducers';
import { GeolocationSelectors } from 'app/shared/components/geolocation/store/selectors';
import { GeolocationActions } from 'app/shared/components/geolocation/store/actions';
import { IQueryParams } from 'app/shared/models/query.model';
import { Province } from 'app/shared/models/location.model';
import { ProfileSelectors } from '../../store/selectors';
import { fromProfile } from '../../store/reducers';

@Component({
    selector: 'company-address-component',
    templateUrl: './company-address.component.html',
    styleUrls: ['./company-address.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CompanyAddressComponent implements OnInit {
    // tslint:disable-next-line: no-inferrable-types
    labelFlex: string = '20';

    profile$: Observable<any>;

    // Subject for detect location changes.
    location$: Subject<string> = new Subject<string>();

    availableProvinces$: Observable<Array<Province>>;

    private unSubs$: Subject<any> = new Subject();

    constructor(
        private store: Store<fromProfile.FeatureState>,
        private geolocationStore: Store<GeolocationCoreState>,
    ) {
        // Get selector profile
        this.profile$ = this.store.select(ProfileSelectors.getProfile);

        this.availableProvinces$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllProvinces)
            .pipe(takeUntil(this.unSubs$));
    }

    ngOnInit() {
        this.initProvinces();

        this.store
            .select(ProfileSelectors.getProfile)
            .pipe(takeUntil(this.unSubs$))
            .subscribe((payload) => {
                if (payload) {
                    this.initSelectedLocation(payload);
                }
            });
    }

    private initProvinces(): void {
        // Menyiapkan query untuk pencarian province.
        const newQuery: IQueryParams = {
            paginate: false,
        };

        // Mengirim state untuk melepas province yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(GeolocationActions.deselectProvince());

        // Mengosongkan province pada state.
        this.geolocationStore.dispatch(GeolocationActions.truncateProvinces());

        // Mengirim state untuk melakukan request province.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchProvincesRequest({
                payload: newQuery,
            })
        );
    }

    private initSelectedLocation(payload: any): void {
        const data = payload.address;
        if (data && data.urban.id) {
            this.geolocationStore
                .select(GeolocationSelectors.selectAllProvinces)
                .pipe(debounceTime(300), takeUntil(this.unSubs$))
                .subscribe((provinces) => {
                    const filterProvince = provinces.filter(function (value) {
                        return value.name == data.urban.province;
                    });
                    if (filterProvince.length > 0) {
                        const province = filterProvince[0];
                        this.geolocationStore.dispatch(
                            GeolocationActions.selectProvince({ payload: province.id })
                        );
                    }
                });

            this.geolocationStore.dispatch(
                GeolocationActions.selectCity({ payload: data.urban.city })
            );

            this.geolocationStore.dispatch(
                GeolocationActions.selectDistrict({ payload: data.urban.district })
            );
        }
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }
}

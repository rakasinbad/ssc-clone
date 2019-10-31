import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { icon, latLng, latLngBounds, Map, MapOptions, marker, tileLayer } from 'leaflet';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BrandStore } from '../../models';
import { BrandStoreActions } from '../../store/actions';
import { fromMerchant } from '../../store/reducers';
import { BrandStoreSelectors } from '../../store/selectors';

@Component({
    selector: 'app-merchant-location-detail',
    templateUrl: './merchant-location-detail.component.html',
    styleUrls: ['./merchant-location-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantLocationDetailComponent implements OnInit, OnDestroy {
    options: MapOptions = {
        layers: [
            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                detectRetina: true,
                maxZoom: 18,
                maxNativeZoom: 18,
                minZoom: 3,
                attribution: 'Open Street Map'
            })
        ],
        zoom: 5,
        center: latLng([-2.5, 117.86])
    };

    brandStore$: Observable<BrandStore>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(private route: ActivatedRoute, private store: Store<fromMerchant.FeatureState>) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        const { id } = this.route.parent.snapshot.params;

        this._unSubs$ = new Subject<void>();
        this.brandStore$ = this.store.select(BrandStoreSelectors.getSelectedBrandStoreInfo);
        this.isLoading$ = this.store.select(BrandStoreSelectors.getIsLoading);
        this.store.dispatch(BrandStoreActions.fetchBrandStoreRequest({ payload: id }));
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this.store.dispatch(BrandStoreActions.resetBrandStore());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    onMapReady(map: Map): void {
        // const newMarker = marker([46.879966, -121.726909], {
        //     icon: icon({
        //         iconSize: [25, 41],
        //         iconUrl: 'leaflet/marker-icon-2x.png',
        //         shadowUrl: 'leaflet/marker-shadow.png'
        //     })
        // });
        // this.options.layers.push(newMarker);

        this.store
            .select(BrandStoreSelectors.getSelectedBrandStoreInfo)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(brandStores => {
                if (
                    brandStores &&
                    brandStores.store &&
                    brandStores.store.latitude &&
                    brandStores.store.longitude
                ) {
                    const newMarker = marker(
                        [brandStores.store.latitude, brandStores.store.longitude],
                        {
                            icon: icon({
                                iconSize: [18, 30],
                                iconUrl: 'assets/images/marker.png'
                            })
                        }
                    );

                    newMarker.addTo(map);

                    const markerBound = latLngBounds([newMarker.getLatLng()]);
                    map.fitBounds(markerBound);
                }
            });
    }
}

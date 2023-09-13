import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Warehouse } from '../../models';
import * as fromWarehouses from '../../store/reducers';
import { WarehouseSelectors } from '../../store/selectors';
import { tap } from 'rxjs/operators';
import { assetUrl } from 'single-spa/asset-url';

@Component({
    selector: 'app-warehouse-detail-location',
    templateUrl: './warehouse-detail-location.component.html',
    styleUrls: ['./warehouse-detail-location.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailLocationComponent implements OnInit {
    opts = {
        minZoom: 3,
        maxZoom: 18,
        zoom: 5,
        lat: -2.5,
        lng: 117.86,
        icon: {
            url: assetUrl('images/marker.png'),
            scaledSize: {
                width: 18,
                height: 30
            }
        }
    };

    warehouse$: Observable<Warehouse>;

    constructor(
        private cdRef: ChangeDetectorRef,
        private store: Store<fromWarehouses.FeatureState>
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.warehouse$ = this.store.select(WarehouseSelectors.getSelectedItem);
    }
}

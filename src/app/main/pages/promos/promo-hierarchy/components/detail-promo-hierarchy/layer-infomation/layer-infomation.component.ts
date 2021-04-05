import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import * as _ from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { PromoHierarchy, PromoHierarchyDetail } from '../../../models';
import * as fromPromoHierarchy from '../../../store/reducers';
import { PromoHierarchySelectors } from '../../../store/selectors';

@Component({
    selector: 'app-layer-infomation',
    templateUrl: './layer-infomation.component.html',
    styleUrls: ['./layer-infomation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayerInfomationComponent implements OnInit {
    public dataDetail: any;
    promoHierarchy$: Observable<PromoHierarchy>;
    isLoading$: Observable<boolean>;
    constructor(
        private store: Store<fromPromoHierarchy.FeatureState>,
        private _$helperService: HelperService,
        private cdRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.promoHierarchy$ = this.store.select(PromoHierarchySelectors.getSelectedItem);
        this.isLoading$ = this.store.select(PromoHierarchySelectors.getLoadingState);
    }
}

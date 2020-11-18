import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { NgxMaskModule } from 'ngx-mask';
import { SingleWarehouseDropdownModule } from '../dropdowns/single-warehouse/single-warehouse.module';
import { SegmentChannelAutocompleteModule } from '../segment-channel-autocomplete';
import { SegmentClusterAutocompleteModule } from '../segment-cluster-autocomplete';
import { SegmentGroupAutocompleteModule } from '../segment-group-autocomplete';
import { SegmentTypeAutocompleteModule } from '../segment-type-autocomplete';
import { SinbadFilterActionComponent } from './components';
import { SinbadFilterComponent } from './sinbad-filter.component';

@NgModule({
    declarations: [SinbadFilterComponent, SinbadFilterActionComponent],
    imports: [
        FuseSharedModule,
        MaterialModule,
        NgxMaskModule,
        SegmentChannelAutocompleteModule,
        SegmentClusterAutocompleteModule,
        SegmentGroupAutocompleteModule,
        SegmentTypeAutocompleteModule,
        SingleWarehouseDropdownModule,
    ],
    exports: [SinbadFilterComponent],
})
export class SinbadFilterModule {}

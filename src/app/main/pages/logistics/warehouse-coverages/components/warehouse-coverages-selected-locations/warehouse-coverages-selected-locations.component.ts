import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-warehouse-coverages-selected-locations',
  templateUrl: './warehouse-coverages-selected-locations.component.html',
  styleUrls: ['./warehouse-coverages-selected-locations.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseCoveragesSelectedLocationsComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

}

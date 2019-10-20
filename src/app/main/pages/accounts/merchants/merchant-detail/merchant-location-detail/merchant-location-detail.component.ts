import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-merchant-location-detail',
  templateUrl: './merchant-location-detail.component.html',
  styleUrls: ['./merchant-location-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantLocationDetailComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

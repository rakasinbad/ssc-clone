import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-merchant-setting',
  templateUrl: './merchant-setting.component.html',
  styleUrls: ['./merchant-setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSettingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

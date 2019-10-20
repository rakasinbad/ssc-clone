import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-credit-limit-group',
  templateUrl: './credit-limit-group.component.html',
  styleUrls: ['./credit-limit-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitGroupComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

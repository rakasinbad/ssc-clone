import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-credit-limit-group-form',
  templateUrl: './credit-limit-group-form.component.html',
  styleUrls: ['./credit-limit-group-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitGroupFormComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

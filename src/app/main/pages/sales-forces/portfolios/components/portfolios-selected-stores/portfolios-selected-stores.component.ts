import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-portfolios-selected-stores',
  templateUrl: './portfolios-selected-stores.component.html',
  styleUrls: ['./portfolios-selected-stores.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosSelectedStoresComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

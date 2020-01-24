import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-journey-plan-info',
  templateUrl: './journey-plan-info.component.html',
  styleUrls: ['./journey-plan-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyPlanInfoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

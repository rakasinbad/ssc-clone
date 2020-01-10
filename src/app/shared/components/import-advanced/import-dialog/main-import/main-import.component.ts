import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-main-import',
  templateUrl: './main-import.component.html',
  styleUrls: ['./main-import.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainImportComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ElementRef
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-catalogues-remove',
  templateUrl: './catalogues-remove.component.html',
  styleUrls: ['./catalogues-remove.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesRemoveComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
  }

}

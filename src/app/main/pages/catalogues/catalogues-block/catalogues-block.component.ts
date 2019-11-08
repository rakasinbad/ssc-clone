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
  selector: 'app-catalogues-block',
  templateUrl: './catalogues-block.component.html',
  styleUrls: ['./catalogues-block.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesBlockComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
  }

}

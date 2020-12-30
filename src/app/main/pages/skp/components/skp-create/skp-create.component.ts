import {  
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewEncapsulation, } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-skp-create',
  templateUrl: './skp-create.component.html',
  styleUrls: ['./skp-create.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkpCreateComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

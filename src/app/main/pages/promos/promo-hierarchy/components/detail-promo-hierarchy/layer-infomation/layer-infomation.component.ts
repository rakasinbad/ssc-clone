import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-layer-infomation',
  templateUrl: './layer-infomation.component.html',
  styleUrls: ['./layer-infomation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayerInfomationComponent implements OnInit {
    public dataDetail: any;
    constructor() { }

    ngOnInit() {
        this.dataDetail = JSON.parse(localStorage.getItem('promo_hierarchy'));
        
    }

}

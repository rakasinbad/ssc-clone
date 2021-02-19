import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layer-infomation',
  templateUrl: './layer-infomation.component.html',
  styleUrls: ['./layer-infomation.component.scss']
})
export class LayerInfomationComponent implements OnInit {
    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
  constructor() { }

  ngOnInit() {
  }

}

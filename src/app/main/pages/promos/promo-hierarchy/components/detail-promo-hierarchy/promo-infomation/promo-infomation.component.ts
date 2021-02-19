import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-promo-infomation',
  templateUrl: './promo-infomation.component.html',
  styleUrls: ['./promo-infomation.component.scss']
})
export class PromoInfomationComponent implements OnInit {
  public dataDetail: any;
  constructor() { }

  ngOnInit() {
    this.dataDetail = JSON.parse(localStorage.getItem('promo_hierarchy'));
    console.log('dataDetail->', this.dataDetail)
  }

  getTriggerCatalogues(value: []): string {
    if (value && value.length > 0) {
        const triggerCatalogues = value.map((v) => v);

        return triggerCatalogues.length > 0 ? triggerCatalogues.join(', ') : '-';
    }

    return '-';
}

}

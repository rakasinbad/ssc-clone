import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';

@Component({
    selector: 'app-catalogue-segmentation',
    templateUrl: './catalogue-segmentation.component.html',
    styleUrls: ['./catalogue-segmentation.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationComponent implements OnInit {
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Catalogue Segmentation',
        },
        search: {
            active: true,
        },
        add: {
            permissions: [],
        },
    };

    keyword: string = null;

    constructor(private router: Router) {}

    ngOnInit(): void {}

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/catalogue-segmentations/add');
    }
}

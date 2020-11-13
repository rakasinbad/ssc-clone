import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { SinbadFilterConfig } from 'app/shared/components/sinbad-filter/models/sinbad-filter.model';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services/sinbad-filter.service';

@Component({
    selector: 'app-catalogue-segmentation',
    templateUrl: './catalogue-segmentation.component.html',
    styleUrls: ['./catalogue-segmentation.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationComponent implements OnInit, OnDestroy {
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
        filter: {
            permissions: [],
        },
    };

    filterConfig: SinbadFilterConfig = {
        by: {
            warehouse: null,
            type: null,
            group: null,
            channel: null,
            cluster: null,
        },
        showFilter: true,
    };

    keyword: string = null;

    constructor(
        private router: Router,
        private fuseSidebarService: FuseSidebarService,
        private sinbadFilterService: SinbadFilterService
    ) {}

    ngOnInit(): void {
        this.sinbadFilterService.setConfig(this.filterConfig);
    }

    ngOnDestroy(): void {
        this.sinbadFilterService.resetConfig();
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/catalogue-segmentations/add');
    }

    onClickFilter(): void {
        this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();
    }
}

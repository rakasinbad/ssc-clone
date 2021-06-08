import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { CardHeaderComponent } from 'app/shared/components/card-header/card-header.component';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { SinbadFilterConfig } from 'app/shared/components/sinbad-filter/models';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services';
import { HelperService } from 'app/shared/helpers';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CatalogueSegmentationFilterDto } from './models';
import { CatalogueSegmentationService } from './services';

@Component({
    selector: 'app-catalogue-segmentation',
    templateUrl: './catalogue-segmentation.component.html',
    styleUrls: ['./catalogue-segmentation.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueSegmentationComponent implements OnInit, OnDestroy {
    private form: FormGroup;
    private unSubs$: Subject<any> = new Subject<any>();

    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Catalogue Segmentation',
        },
        search: {
            active: true,
        },
        add: {
            permissions: ['CATALOGUE.CREATE'],
        },
        filter: {
            permissions: [],
        },
    };

    filterConfig: SinbadFilterConfig = {
        by: {
            /* status: {
                title: 'Status',
                sources: [
                    { id: 'active', label: 'Active', checked: false },
                    { id: 'inactive', label: 'Inactive', checked: false },
                ],
            }, */
            warehouse: null,
            segmentType: {
                title: 'Type',
                sources: [],
            },
            segmentGroup: {
                title: 'Group',
                sources: [],
            },
            segmentChannel: {
                title: 'Channel',
                sources: [],
            },
            segmentCluster: {
                title: 'Cluster',
                sources: [],
            },
            group: null,
            channel: null,
            cluster: null,
        },
        showFilter: true,
    };

    keyword: string = null;

    globalFilterDto: CatalogueSegmentationFilterDto;

    @ViewChild('cardHeader', { static: true })
    cardHeader: CardHeaderComponent;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private fuseSidebarService: FuseSidebarService,
        private catalogueSegmentationService: CatalogueSegmentationService,
        private sinbadFilterService: SinbadFilterService
    ) {}

    ngOnInit(): void {
        // Form for the filter
        this.form = this.fb.group({
            search: null,
            // status: null,
            segmentChannel: null,
            segmentCluster: null,
            segmentGroup: null,
            segmentType: null,
            warehouse: null,
        });

        this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.form });

        // Handle action in filter
        this.sinbadFilterService
            .getClickAction$()
            .pipe(
                filter((action) => action === 'reset' || action === 'submit'),
                takeUntil(this.unSubs$)
            )
            .subscribe((action) => {
                if (action === 'reset') {
                    this.cardHeader.reset();
                    this.form.reset();
                    this.globalFilterDto = null;
                } else {
                    this._handleApplyFilter();
                }

                HelperService.debug('[CatalogueSegmentationComponent] ngOnInit getClickAction$()', {
                    form: this.form,
                    filterConfig: this.filterConfig,
                });
            });
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

    onSearch(value: string): void {
        this.keyword = value;

        if (this.form && this.form.get('search')) {
            this.form.get('search').setValue(value);
        }
    }

    private _handleApplyFilter(): void {
        this.globalFilterDto = {};

        const {
            // status,
            segmentChannel,
            segmentCluster,
            segmentGroup,
            segmentType,
            warehouse,
        } = this.form.value;

        const configStatus = this.filterConfig.by['status'];
        const totalStatusSource =
            configStatus && configStatus.sources && configStatus.sources.length;
        /* const newStatus = this.catalogueSegmentationService.prepareStatusValue(
            status,
            totalStatusSource
        ); */
        const channelId =
            this.catalogueSegmentationService.prepareSegmentChannelValue(segmentChannel);
        const clusterId =
            this.catalogueSegmentationService.prepareSegmentClusterValue(segmentCluster);
        const groupId = this.catalogueSegmentationService.prepareSegmentGroupValue(segmentGroup);
        const typeId = this.catalogueSegmentationService.prepareSegmentGroupValue(segmentType);
        const warehouseId = this.catalogueSegmentationService.prepareWarehouseValue(warehouse);

        this.globalFilterDto = {
            // status: newStatus,
        };

        // Handle filter segment channel
        if (channelId) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                channelId,
            };
        }

        // Handle filter segment cluster
        if (clusterId) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                clusterId,
            };
        }

        // Handle filter segment group
        if (groupId) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                groupId,
            };
        }

        // Handle filter segment type
        if (typeId) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                typeId,
            };
        }

        // Handle filter warehouse
        if (warehouseId) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                warehouseId,
            };
        }
    }
}

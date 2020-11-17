import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { SinbadFilterConfig } from 'app/shared/components/sinbad-filter/models/sinbad-filter.model';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services/sinbad-filter.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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
            permissions: [],
        },
        filter: {
            permissions: [],
        },
    };

    filterConfig: SinbadFilterConfig = {
        by: {
            status: {
                title: 'Status',
                sources: [
                    { id: 'active', label: 'Active' },
                    { id: 'inactive', label: 'Inactive' },
                ],
            },
            warehouse: null,
            segmentType: {
                title: 'Type',
                sources: [],
            },
            group: null,
            channel: null,
            cluster: null,
        },
        showFilter: true,
    };

    keyword: string = null;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private fuseSidebarService: FuseSidebarService,
        private sinbadFilterService: SinbadFilterService
    ) {}

    ngOnInit(): void {
        // Form for the filter
        this.form = this.fb.group({
            search: null,
            segmentType: null,
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
                    // this.cardHeader.reset();
                    // this._form.reset();
                    // this.globalFilterDto = null;
                } else {
                    // this._handleApplyFilter();1
                }
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
}

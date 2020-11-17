import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { SinbadFilterConfig } from './models/sinbad-filter.model';
import { SinbadFilterService } from './services';

@Component({
    selector: 'app-sinbad-filter',
    templateUrl: './sinbad-filter.component.html',
    styleUrls: ['./sinbad-filter.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SinbadFilterComponent implements OnInit {
    form: FormGroup;
    showPanel = true;
    filterSegmentType: boolean = false;
    filterWarehouse: boolean = false;

    selectedSuppliers: any[] = [];
    sourceStatus: { id: string; label: string }[] = [];
    sourceType: { id: string; label: string }[] = [];
    sourceOrderStatus: any[] = [];
    sourceSuppliers: any[] = [];

    maxDate = new Date();

    config$: Observable<SinbadFilterConfig>;

    constructor(
        private fuseSidebarService: FuseSidebarService,
        private sinbadFilterService: SinbadFilterService
    ) {}

    ngOnInit(): void {
        this.config$ = this.sinbadFilterService.getConfig$().pipe(
            tap((config) => {
                if (config.form) {
                    this.form = config.form;

                    if (config.by && Object.keys(config.by).length > 0) {
                        if (typeof config.by['status'] !== 'undefined') {
                            if (config.by['status'].sources) {
                                this.sourceStatus = config.by['status'].sources;
                            }
                        }

                        if (typeof config.by['type'] !== 'undefined') {
                            if (config.by['type'].sources) {
                                this.sourceType = config.by['type'].sources;
                            }
                        }

                        if (typeof config.by['segmentType'] !== 'undefined') {
                            this.filterSegmentType = true;
                        }

                        if (typeof config.by['warehouse'] !== 'undefined') {
                            this.filterWarehouse = true;
                        }

                        // if (config.by['suppliers']) {
                        //     this.sourceSuppliers = config.by['suppliers'];
                        // }
                    }
                }
            }),
            shareReplay()
        );
    }

    close(): void {
        this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();
    }

    onClickReset(): void {
        this.sinbadFilterService.setClickAction('reset');
    }

    onClickSubmit(): void {
        this.sinbadFilterService.setClickAction('submit');
        this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();
    }

    trackByStatus(index: number, item: any): string {
        if (!item) {
            return null;
        }

        return item.id || index;
    }

    trackByType(index: number, item: any): string {
        if (!item) {
            return null;
        }

        return item.id || index;
    }
}

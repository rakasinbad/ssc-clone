import {
    Component,
    ComponentFactoryResolver,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterAdvancedFormComponent } from 'app/shared/modals/filter-advanced-form/filter-advanced-form.component';

import { ContentDirective } from './../../directives/content.directive';
import { FieldConfig } from './../../models/field.model';

@Component({
    selector: 'app-filter-advanced',
    templateUrl: './filter-advanced.component.html',
    styleUrls: ['./filter-advanced.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FilterAdvancedComponent implements OnInit {
    @Input() btnLabel: string;
    @Input() btnIcon: string;
    @Input() btnPosition: 'content' | 'header';
    @Input() btnType: string;
    @Input() filterConfig;
    @Input() filterColumn: FieldConfig[];

    @ViewChild(ContentDirective, { static: false }) filterHost: ContentDirective;

    constructor(
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        // this.btnIcon = 'filter_list';
    }

    onOpenFilter(): void {
        this._matDialog.open(FilterAdvancedFormComponent, {
            data: {
                title: 'Advanced Filter',
                filterConfig: this.filterConfig,
                filterColumn: this.filterColumn
            },
            disableClose: true
        });
        //  const filterFactory = this._componentFactoryResolver.resolveComponentFactory(FiltersComponent);
        //  const hostViewContainerRef = this.filterHost.viewContainerRef;
        //  hostViewContainerRef.clear();
        //  const filterComponentRef = hostViewContainerRef.createComponent(filterFactory);
        //  filterComponentRef.instance.onOpenMenu();
    }
}

import {
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FiltersComponent implements OnInit, OnChanges, AfterViewInit {
    filterForm: FormGroup;
    forFirstValue = false;
    forSecondValue = false;
    hasNoValue = false;
    conditions = [
        {
            id: 'is-empty',
            text: 'Is Empty'
        },
        {
            id: 'is-not-empty',
            text: 'Is Not Empty'
        }
    ];

    @ViewChild('filterMenu', { static: true }) triggerMenu: MatMenuTrigger;
    @ViewChild('filterColumnMenu', { static: true }) filterColumnMenu;
    @Input() title: string;
    @Input() openFilter: boolean;

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.filterForm = this._formBuilder.group({
            operator: '',
            filterVal1: '',
            filterVal2: ''
        });
    }

    ngOnChanges(): void {
        // if (this.openFilter) {
        //     this.triggerMenu.openMenu();
        // }
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.
        if (this.openFilter) {
            this.triggerMenu.openMenu();
        }
    }

    onOpenMenu() {
        this.triggerMenu.openMenu();
    }

    onFilterSubmit(): void {}
}

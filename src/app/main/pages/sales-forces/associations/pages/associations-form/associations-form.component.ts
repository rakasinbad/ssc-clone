import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-associations-form',
    templateUrl: './associations-form.component.html',
    styleUrls: ['./associations-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociationsFormComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

}

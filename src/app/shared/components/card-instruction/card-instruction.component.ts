import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'card-instruction',
    templateUrl: './card-instruction.component.html',
    styleUrls: ['./card-instruction.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardInstructionComponent implements OnInit {

    // tslint:disable-next-line: no-inferrable-types
    isOpened: boolean = false;

    constructor() { }

    toggleCollapsible(): void {
        this.isOpened = !this.isOpened;
    }

    ngOnInit(): void {
    }

}

import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';


/**
 *  @author Mufid Jamaluddin
 */
@Component({
    selector: 'app-return-status',
    templateUrl: './return_status.component.html',
    styleUrls: ['./return_status.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ReturnStatusComponent {
    @Input()
    status: string;

    @Input()
    returned: boolean;

    @Output()
    returnStatusHandler: EventEmitter<string> = new EventEmitter();
}

import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { capitalizeFirstLetter } from '../../utility';


/**
 *  @author Mufid Jamaluddin
 */
@Component({
    selector: 'app-return-status-bar',
    templateUrl: './return_bar.component.html',
    styleUrls: ['./return_bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ReturnStatusBarComponent {
    @Input()
    status: string;

    stepTwoStatuses: Array<string>;

    stepThreeStatuses: Array<string>;

    constructor() {
        this.stepTwoStatuses = [
            'approved',
            'approved_returned',
        ];

        this.stepThreeStatuses = [
            'closed',
            'rejected'
        ];
    }

    getStatusText(): string {
        let title;
        switch (this.status) {
            case 'pending':
                title = 'Pending';
                break;
            case 'approved':
                title = 'Approved';
                break;
            case 'approved_returned':
                title = 'Approved & Returned';
                break;
            case 'rejected':
                title = 'Rejected';
                break;
            default:
                title = '';
                break;
        }
        return title;
    }

    isStepTwoActive(): boolean {
        return this.stepTwoStatuses.includes(this.status) || this.isStepThreeActive();

    }

    isStepThreeActive(): boolean {
        return this.stepThreeStatuses.includes(this.status);
    }

    getFinalStatus(): string {
        return this.status === 'rejected' ? 'Rejected' : 'Closed';
    }
}

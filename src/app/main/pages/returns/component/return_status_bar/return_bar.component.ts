import { Component, ViewEncapsulation, Input } from '@angular/core';
import { getReturnStatusTitle } from '../../models/returnline.model';


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
        return getReturnStatusTitle(this.status);
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

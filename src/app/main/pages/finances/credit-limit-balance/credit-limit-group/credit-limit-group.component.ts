import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog } from '@angular/material';
import { CreditLimitGroupFormComponent } from '../credit-limit-group-form/credit-limit-group-form.component';

@Component({
    selector: 'app-credit-limit-group',
    templateUrl: './credit-limit-group.component.html',
    styleUrls: ['./credit-limit-group.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitGroupComponent implements OnInit {
    constructor(private matDialog: MatDialog) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onSetup(): void {
        this.matDialog.open(CreditLimitGroupFormComponent, {
            data: {
                title: 'Set Credit Limit'
            },
            disableClose: true
        });
    }
}

import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
    selector: 'app-errors',
    template: '<ng-content></ng-content>',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorsComponent implements OnInit {
    constructor(
        private router: Router,
        private angularFireDatabase : AngularFireDatabase,
    ) {
        // CHECK MAINTENANCE
        this.angularFireDatabase.object('/maintenance').valueChanges().subscribe((res:any) => {
            if(!res.ssc) {
                this.router.navigate(['/pages/account/store']);
            }
        });
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.router.navigate(['/pages/errors/404'], {
            replaceUrl: true,
            skipLocationChange: true
        });
    }
}

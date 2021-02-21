import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-set-promo-hierarchy',
  templateUrl: './set-promo-hierarchy.component.html',
  styleUrls: ['./set-promo-hierarchy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetPromoHierarchyComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  
    ngOnInit(): void {
        console.log('isi data set promo->', this.data)
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.item = this.data;
    }

}

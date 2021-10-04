import { Component, Input, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Location } from '@angular/common';

/**
 *  @author Mufid Jamaluddin
 */
@Component({
    selector: 'app-header-detail',
    templateUrl: './header_detail.component.html',
    styleUrls: ['./header_detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class HeaderDetailComponent {

    constructor(
        private location: Location,
    ) {
    }

    @Input()
    isLoading: boolean;

    @Input()
    title: string;

    @Input()
    description: string | null;

    goBack(): void {
        this.location.back();
    }

}

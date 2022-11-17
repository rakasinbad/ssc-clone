import { Component, Input, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';

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
        private router: Router
    ) {
    }

    @Input()
    isLoading: boolean;

    @Input()
    title: string;

    @Input()
    description: string | null;

    @Input()
    withDesc: boolean;

    goBack(): void {
        this.router.navigateByUrl('/pages/returns', { replaceUrl: true })
    }

}

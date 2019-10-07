import { Component, HostBinding, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'fuse-nav-horizontal-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuseNavHorizontalItemComponent {
    @HostBinding('class')
    classes = 'nav-item';

    @Input()
    item: any;

    constructor(private translateService: TranslateService) {}
}

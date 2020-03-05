import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-find-location',
    templateUrl: './find-location.component.html',
    styleUrls: ['./find-location.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FindLocationComponent implements OnInit, OnDestroy {
    constructor() {}

    ngOnInit(): void {}

    ngOnDestroy(): void {}
}

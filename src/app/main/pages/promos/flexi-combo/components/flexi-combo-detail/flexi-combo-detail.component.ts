import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

@Component({
    selector: 'app-flexi-combo-detail',
    templateUrl: './flexi-combo-detail.component.html',
    styleUrls: ['./flexi-combo-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailComponent implements OnInit {
    constructor(private _fuseTranslationLoaderService: FuseTranslationLoaderService) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}

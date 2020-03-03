import {
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy,
    AfterViewInit,
    SecurityContext,
    ViewChild,
    ViewChildren,
    ElementRef,
    HostListener
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';

import { IQueryParams } from 'app/shared/models';
import { MatDialog, MatSelectionListChange, MatSelectionList } from '@angular/material';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ActivatedRoute } from '@angular/router';

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

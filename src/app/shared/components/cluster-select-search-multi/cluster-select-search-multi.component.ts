import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { SinbadSelectSearchSource } from '../sinbad-select-search/models';

@Component({
    selector: 'cluster-select-search-multi',
    templateUrl: './cluster-select-search-multi.component.html',
    styleUrls: ['./cluster-select-search-multi.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClusterSelectSearchMultiComponent implements OnInit {
    @Input()
    limitItem: number = 10;

    @Input()
    limitLength: number;

    @Input()
    loading: boolean;

    @Output()
    loadingChange: EventEmitter<boolean> = new EventEmitter();

    @Output()
    selectedValue: EventEmitter<SinbadSelectSearchSource[]> = new EventEmitter();

    @Input()
    reset: boolean;

    @Output()
    resetChange: EventEmitter<boolean> = new EventEmitter();

    @Input()
    externalSources: SinbadSelectSearchSource[];

    private selectedItem: string;
    private triggerSelected: boolean = false;
    private unSubs$: Subject<any> = new Subject();

    readonly form: FormControl = new FormControl('');
    readonly placeholder: string = 'Cluster';

    // collections$: Observable<SegmentTypeAutocomplete[]>;
    // loading$: Observable<boolean>;

    constructor() {}

    ngOnInit(): void {}

    onSelected(value: SinbadSelectSearchSource[]): void {
        console.log('CLUSTER SELECT', { value });

        this.selectedValue.emit(value);
    }
}

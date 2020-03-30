import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { select, Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { from, Observable, of, Subject } from 'rxjs';
import { concatMap, distinctUntilChanged, filter, finalize, takeUntil } from 'rxjs/operators';

import { MerchantSegmentationAlertComponent } from '../merchant-segmentation-alert';
import { MerchantSegmentationFormComponent } from '../merchant-segmentation-form';
import { PayloadStoreType, StoreType } from '../models';
import { StoreTypeActions } from '../store/actions';
import * as fromStoreSegments from '../store/reducers';
import { StoreTypeSelectors } from '../store/selectors';

@Component({
    selector: 'app-store-type-segmentation',
    templateUrl: './store-type-segmentation.component.html',
    styleUrls: ['./store-type-segmentation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreTypeSegmentationComponent implements OnInit, OnDestroy {
    form: FormGroup;
    maxSegment = 5;
    triggerSegment = [false, false, false, false, false];
    isFromSelector = false;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16',
        title: {
            label: 'Store Type'
        },
        search: {
            active: false
        },
        // add: {
        //     permissions: [],
        // },
        viewBy: {
            list: [
                { id: 'segment-tree', label: 'Segment Tree' }
                // { id: 'store', label: 'Store' }
            ]
        }
        // export: {
        //     permissions: [],
        //     useAdvanced: true,
        //     pageType: ''
        // }
        // import: {
        //     permissions: [''],
        //     useAdvanced: true,
        //     pageType: ''
        // },
    };

    items$: Observable<Array<StoreType>>;
    isLoading$: Observable<boolean>;
    isLoadingRow$: Observable<boolean>;

    private _unSubs$: Subject<void> = new Subject();

    constructor(
        private cdRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private matDialog: MatDialog,
        private store: Store<fromStoreSegments.FeatureState>
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    addSegment(): void {
        this.segments().push(this._createSegments());
    }

    deleteSegment(idx: number): void {
        this.segments().removeAt(idx);
    }

    segments(): FormArray {
        return this.form.get('segments') as FormArray;
    }

    addSegmentBranch(idx: number): void {
        this.segmentBranches(idx).push(this._createBranches());
        this.triggerSegment[idx] = true;
    }

    deleteSegmentBranch(segmentIdx: number, branchIdx: number): void {
        this.segmentBranches(segmentIdx).removeAt(branchIdx);
    }

    segmentBranches(idx: number): FormArray {
        return this.form.get(['segments', idx, 'branches']) as FormArray;
    }

    hasBranchName(segmentIdx: number, branchIdx: number): any {
        return this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'name']).value;
    }

    hasChild(segmentIdx: number, branchIdx: number): boolean {
        return !!this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'hasChild']).value;
    }

    handleSegmentBranchFocus(segmentIdx: number, branchIdx: number): void {
        (this.form.get([
            'segments',
            segmentIdx,
            'branches',
            branchIdx,
            'name'
        ]) as any).nativeElement.focus();
    }

    handleEvent(segmentIdx: number, branchIdx: number): void {
        this.triggerSegment[segmentIdx] = false;

        if (!this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'name']).value) {
            this.deleteSegmentBranch(segmentIdx, branchIdx);
            return;
        }

        if (!this.isFromSelector) {
            const selectedIdx = segmentIdx > 0 ? segmentIdx - 1 : segmentIdx;
            const selectedId = this.form.get(['segments', selectedIdx, 'selectedId']).value;

            this.form
                .get(['segments', segmentIdx, 'branches', branchIdx, 'parentId'])
                .setValue(selectedId);

            this.form
                .get(['segments', segmentIdx, 'branches', branchIdx, 'sequence'])
                .setValue(segmentIdx + 1);

            setTimeout(() => {
                this._onSubmit(segmentIdx, branchIdx);
            }, 100);
        }

        const status = this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'status'])
            .value;

        if (status === 'active') {
            this.form
                .get(['segments', segmentIdx, 'branches', branchIdx, 'status'])
                .setValue('readonly');
        }
    }

    isInactive(segmentIdx: number, branchIdx: number): boolean {
        return (
            this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'status']).value ===
            'inactive'
        );
    }

    isReadonly(segmentIdx: number, branchIdx: number): boolean {
        return (
            this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'status']).value ===
            'readonly'
        );
    }

    isTyping(segmentIdx: number, branchIdx: number): boolean {
        return (
            this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'status']).value ===
            'typing'
        );
    }

    isAddDisabled(segmentIdx: number): boolean {
        return this.triggerSegment[segmentIdx];
    }

    isSelected(segmentIdx: number, branchIdx: number): boolean {
        const selectedId = this.form.get(['segments', segmentIdx, 'selectedId']).value;
        const currentId = this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'id'])
            .value;

        return selectedId === currentId;
    }

    lastSegmentHasBranchName(): boolean {
        if (this.segmentBranches(this.segments().length - 1).length > 0) {
            const branches = this.segmentBranches(this.segments().length - 1)
                .getRawValue()
                .filter(v => !!v.name);

            return (
                !!branches.length &&
                !!this.form.get(['segments', this.segments().length - 1, 'selectedId']).value
            );
        }

        return false;
    }

    onEdit(segmentIdx: number, branchIdx: number): void {
        const formValue = this.form.get(['segments', segmentIdx, 'branches', branchIdx]).value;

        this.matDialog.open(MerchantSegmentationFormComponent, {
            data: {
                title: 'Segment Branch Information',
                form: formValue
            },
            panelClass: 'merchant-segment-form-dialog',
            disableClose: true
        });
    }

    onShowChild(segmentIdx: number, branchIdx: number): void {
        const parentId = this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'id']).value;
        const currLevel = this.form.get(['segments', segmentIdx, 'level']).value;
        const currLastSegment = +this.form.get('lastSegment').value;

        this.form.get(['segments', segmentIdx, 'selectedId']).setValue(parentId);

        if (segmentIdx > currLastSegment) {
            this.form.get('lastSegment').setValue(currLevel);
        }

        this._resetSegment(segmentIdx);

        this.store
            .pipe(
                select(StoreTypeSelectors.getChild(parentId)),
                distinctUntilChanged(),
                // delay(300),
                filter(items => items && items.length > 0),
                takeUntil(this._unSubs$)
            )
            .subscribe(items => {
                if (!this.form.get(['segments', currLevel])) {
                    this.addSegment();
                }

                this._generateHierarchies(items);
            });
    }

    onSetStatus(segmentIdx: number, branchIdx: number): void {
        const formValue = this.form.get(['segments', segmentIdx, 'branches', branchIdx]).value;

        this.matDialog.open(MerchantSegmentationAlertComponent, {
            data: {
                title: 'Alert',
                form: formValue
            },
            panelClass: 'merchant-segment-alert-dialog',
            disableClose: true
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _createBranches(): FormGroup {
        return this.formBuilder.group(
            {
                id: null,
                parentId: null,
                sequence: null,
                name: null,
                hasChild: false,
                status: 'typing'
            },
            { updateOn: 'blur' }
        );
    }

    private _createSegments(): FormGroup {
        return this.formBuilder.group({
            selectedId: null,
            level: null,
            branches: this.formBuilder.array([])
        });
    }

    private _generateHierarchies(items: Array<StoreType>): void {
        if (items && items.length > 0) {
            this.isFromSelector = true;

            from(items)
                .pipe(
                    // concatMap((item, idx) => of({ item, idx }).pipe(delay(1000))),
                    concatMap((item, idx) => of({ item, idx })),
                    finalize(() => {
                        this.isFromSelector = false;
                        console.log('Out Looping', this.isFromSelector, this.form);
                    }),
                    takeUntil(this._unSubs$)
                )
                .subscribe(({ item, idx }) => {
                    if (this.segmentBranches(item.sequence - 1).length < items.length) {
                        this.addSegmentBranch(item.sequence - 1);
                    }

                    // Set level control (segments)
                    this.form.get(['segments', item.sequence - 1, 'level']).setValue(item.sequence);

                    // Set id control (branches)
                    this.form
                        .get(['segments', item.sequence - 1, 'branches', idx, 'id'])
                        .setValue(item.id);

                    // Set parentId control (branches)
                    this.form
                        .get(['segments', item.sequence - 1, 'branches', idx, 'parentId'])
                        .setValue(item.parentId);

                    // Set sequence control (branches)
                    this.form
                        .get(['segments', item.sequence - 1, 'branches', idx, 'sequence'])
                        .setValue(item.sequence);

                    // Set name control (branches)
                    this.form
                        .get(['segments', item.sequence - 1, 'branches', idx, 'name'])
                        .setValue(item.name);

                    const hasChild = item.hasChild
                        ? Array.isArray(item.children) && item.children.length > 0 && item.hasChild
                        : item.hasChild;

                    // Set hasChild control (branches)
                    this.form
                        .get(['segments', item.sequence - 1, 'branches', idx, 'hasChild'])
                        .setValue(hasChild);

                    // Set status control (branches)
                    this.form
                        .get(['segments', item.sequence - 1, 'branches', idx, 'status'])
                        .setValue(item.status);

                    this.handleEvent(item.sequence - 1, idx);
                    this.cdRef.markForCheck();
                });
        }
    }

    private _generateHierarchy(item: Array<StoreType>, itemIdx: number): void {}

    private _resetSegment(currentSegment: number): void {
        let lastSegment = +this.form.get('lastSegment').value;

        while (lastSegment > currentSegment) {
            // console.log(`Remove lastSegment: ${lastSegment}, except ${currentSegment}`);
            this.segments().removeAt(lastSegment);
            lastSegment--;
        }
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset core state storeTypes
                this.store.dispatch(StoreTypeActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this._initHierarchy();
                this._initForm();

                this.isLoading$ = this.store.select(StoreTypeSelectors.getIsLoading);
                this.isLoadingRow$ = this.store.select(StoreTypeSelectors.getIsLoadingRow);

                this.store.dispatch(StoreTypeActions.clearTableState());

                // Trigger refresh
                this.store
                    .select(StoreTypeSelectors.getIsRefresh)
                    .pipe(
                        filter(v => !!v),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(() => this._onRefreshHierarchy());
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            lastSegment: null,
            segments: this.formBuilder.array([this._createSegments()])
        });

        this.store
            .select(StoreTypeSelectors.selectAll)
            .pipe(
                // delay(300),
                filter(items => items && items.length > 0),
                takeUntil(this._unSubs$)
            )
            .subscribe(items => {
                this._generateHierarchies(items);
            });
    }

    private _initHierarchy(): void {
        const data: IQueryParams = {
            paginate: false
        };

        this.store.dispatch(StoreTypeActions.fetchStoreTypesRequest({ payload: data }));
    }

    private _onRefreshHierarchy(): void {
        const data: IQueryParams = {
            paginate: false
        };

        this.store.dispatch(StoreTypeActions.refreshStoreTypesRequest({ payload: data }));
    }

    private _onSubmit(segmentIdx: number, branchIdx: number): void {
        const isValid = this.form.get(['segments', segmentIdx, 'branches', branchIdx]).valid;
        const body = this.form.getRawValue();

        if (!isValid && !body.segments[segmentIdx].selectedId) {
            return;
        }

        const payload = new PayloadStoreType({
            supplierId: null,
            parentId: body.segments[segmentIdx].branches[branchIdx].parentId,
            sequence: +body.segments[segmentIdx].branches[branchIdx].sequence,
            name: body.segments[segmentIdx].branches[branchIdx].name
        });

        this.store.dispatch(StoreTypeActions.createStoreTypeRequest({ payload }));
    }
}

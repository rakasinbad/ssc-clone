import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { FormBuilder, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { MatDialog } from '@angular/material';
import { MerchantSegmentationFormComponent } from '../merchant-segmentation-form';
import { MerchantSegmentationAlertComponent } from '../merchant-segmentation-alert';

@Component({
    selector: 'app-store-type-segmentation',
    templateUrl: './store-type-segmentation.component.html',
    styleUrls: ['./store-type-segmentation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreTypeSegmentationComponent implements OnInit {
    form: FormGroup;
    maxSegment = 5;
    triggerSegment = [false, false, false, false, false];

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16',
        title: {
            label: 'Store Segmentation'
        },
        search: {
            active: true
        },
        // add: {
        //     permissions: [],
        // },
        viewBy: {
            list: [
                { id: 'segment-tree', label: 'Segment Tree' },
                { id: 'store', label: 'Store' }
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

    coba = [
        {
            id: 'Lv1'
        },
        {
            id: 'Lv2'
        },
        {
            id: 'Lv3'
        },
        {
            id: 'Lv4'
        },
        {
            id: 'Lv5'
        }
    ];

    constructor(private formBuilder: FormBuilder, private matDialog: MatDialog) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
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

    handleBranchNameFocus(segmentIdx: number, branchIdx: number): void {
        console.log(`SegmentID: ${segmentIdx}, BranchID: ${branchIdx}`);
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
        console.log('On Event');
        console.log(`SegmentID: ${segmentIdx}, BranchID: ${branchIdx}`);

        this.triggerSegment[segmentIdx] = false;

        if (!this.form.get(['segments', segmentIdx, 'branches', branchIdx, 'name']).value) {
            this.deleteSegmentBranch(segmentIdx, branchIdx);
            return;
        }

        this.form
            .get(['segments', segmentIdx, 'branches', branchIdx, 'status'])
            .setValue('readonly');
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

    lastSegmentHasBranchName(): boolean {
        if (this.segmentBranches(this.segments().length - 1).length > 0) {
            const branches = this.segmentBranches(this.segments().length - 1)
                .getRawValue()
                .filter(v => !!v.name);

            return !!branches.length;
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
                name: null,
                status: 'typing'
            },
            { updateOn: 'blur' }
        );
    }

    private _createSegments(): FormGroup {
        return this.formBuilder.group({
            level: null,
            branches: this.formBuilder.array([])
        });
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                break;

            default:
                this._initForm();
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            segments: this.formBuilder.array([this._createSegments()])
        });
    }

    private _onSubmit(): void {}
}

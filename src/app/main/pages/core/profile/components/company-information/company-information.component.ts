import { Component, Input, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { HelperService } from 'app/shared/helpers';
import { ProfileSelectors } from '../../store/selectors';
import { fromProfile } from '../../store/reducers';


@Component({
  selector: 'company-information-component',
  templateUrl: './company-information.component.html',
  styleUrls: ['./company-information.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CompanyInformationComponent implements OnInit {

  @Input() isEdit: boolean;

  // tslint:disable-next-line: no-inferrable-types
  labelFlex: string = '20';
  // tslint:disable-next-line: no-inferrable-types
  imageUrl: boolean = false;

  selectedPhoto: string;
  dialogPreviewPhoto: ApplyDialogService;
  @ViewChild('previewPhoto', { static: false }) previewPhoto: TemplateRef<any>;

  profile$: Observable<any>;

  private unSubs$: Subject<any> = new Subject();

  constructor(
    private store: Store<fromProfile.FeatureState>,
    private applyDialogFactory$: ApplyDialogFactoryService,
  ) {}

  openPreviewPhoto(): void {
    this.dialogPreviewPhoto = this.applyDialogFactory$.open(
        {
            title: 'Supplier Image',
            template: this.previewPhoto,
            isApplyEnabled: false,
            showApplyButton: false,
        },
        {
            disableClose: false,
            width: '50vw',
            minWidth: '50vw',
            maxWidth: '50vw',
            panelClass: 'dialog-container-no-padding'
        }
    );
    this.dialogPreviewPhoto.closed$.subscribe({
        next: () => {
            HelperService.debug('DIALOG PREVIEW PHOTO CLOSED');
        },
    });
  }

  ngOnInit() {
    // Get selector profile
    this.profile$ = this.store.select(ProfileSelectors.getProfile)

    this.store
     .select(ProfileSelectors.getProfile)
     .pipe(takeUntil(this.unSubs$))
     .subscribe((payload) => {
       if (payload && payload.companyInfo) {
         this.selectedPhoto = payload.companyInfo.imageUrl;
       }
    });
  }

}

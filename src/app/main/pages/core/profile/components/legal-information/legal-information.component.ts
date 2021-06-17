import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileSelectors } from '../../store/selectors';
import { fromProfile } from '../../store/reducers';

@Component({
  selector: 'legal-information-component',
  templateUrl: './legal-information.component.html',
  styleUrls: ['./legal-information.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LegalInformationComponent implements OnInit {
  
  @Input() isEdit: boolean;

  // tslint:disable-next-line: no-inferrable-types
  labelFlex: string = '20';

  officialDocument : string;

  profile$: Observable<any>;

  private unSubs$: Subject<any> = new Subject();

  constructor(
    private store: Store<fromProfile.FeatureState>
  ) {}

  ngOnInit() {
    // Get selector profile
    this.profile$ = this.store.select(ProfileSelectors.getProfile);

    this.store
     .select(ProfileSelectors.getProfile)
     .pipe(takeUntil(this.unSubs$))
     .subscribe((payload) => {
       if (payload && payload.legalInfo) {
         this.officialDocument = payload.legalInfo.officialDocument;
       }
    });

  }

  onDownload(url : string): void {
    window.open(url,'_blank');
  }
}

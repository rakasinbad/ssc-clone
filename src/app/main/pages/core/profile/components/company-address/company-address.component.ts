import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ProfileSelectors } from '../../store/selectors';
import { fromProfile } from '../../store/reducers';

@Component({
  selector: 'company-address-component',
  templateUrl: './company-address.component.html',
  styleUrls: ['./company-address.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CompanyAddressComponent implements OnInit {

  // tslint:disable-next-line: no-inferrable-types
  labelFlex: string = '20';

  profile$: Observable<any>;

  constructor(
    private store: Store<fromProfile.FeatureState>
  ) {}

  ngOnInit() {
    // Get selector profile
    this.profile$ = this.store.select(ProfileSelectors.getProfile);
  }

}

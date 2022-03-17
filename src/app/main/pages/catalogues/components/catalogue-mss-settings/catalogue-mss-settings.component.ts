import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { BehaviorSubject, Subject, of, Observable } from 'rxjs';
import { takeUntil, tap, withLatestFrom, switchMap, take, catchError, } from 'rxjs/operators';
import { IQueryParams } from 'app/shared/models/query.model';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Store as NgRxStore } from '@ngrx/store';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { StoreSegmentationTypesApiService } from 'app/shared/components/dropdowns/store-segmentation/store-segmentation-types/services';
import { SelectionTree, } from 'app/shared/components/selection-tree/selection-tree/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
  selector: 'app-catalogue-mss-settings',
  templateUrl: './catalogue-mss-settings.component.html',
  styleUrls: ['./catalogue-mss-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueMssSettingsComponent implements OnInit, OnChanges, OnDestroy {

  ngOnInit(): void {
     
  }

  ngOnChanges(changes: SimpleChanges): void {
     
  }

  ngOnDestroy(): void {
     
  }
}

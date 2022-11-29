import { Component, Inject, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { fromImportProducts, fromImportProductsProgress } from '../../../store/reducers';
import { ImportProductsActions, ImportProductsProgressActions } from '../../../store/actions';
import { Store } from '@ngrx/store';
import { ImportProductSelectors, ImportProductsProgressSelectors } from '../../../store/selectors';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { IErrorImportProducts, IImportProductsProgress, IProductList } from '../../../models'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { OrderHelperService } from '../../../services';

export interface IOrderStoreAndShipmentInfo {
  date: string
  date_raw: string
  storeId: number
  storeExternalId: string
  ownerName: string
  storeName: string
  storeAddress: string
  urban: string
  deliveryAddress: string
  warehouse: string
  storeChannelId: string
  storeClusterId: string
  storeGroupId: string
  storeTypeId: string
}

@Component({
  selector: 'app-import-products',
  templateUrl: './import-products.component.html',
  styleUrls: ['./import-products.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ImportProductsComponent implements OnInit, OnDestroy {

  private _unSubs$: Subject<void> = new Subject<void>();

  file: File;
  fileName: string = '';
  alertMessage: string = 'Please keep this pop up open until the process is finished.';
  linkTemplate: string = 'https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/template_upload/Template-Manual-Order.zip';
  firstImport: boolean = true;
  orderStoreAndShipmentInfo: IOrderStoreAndShipmentInfo;
  errorCounter: number = 0;

  errorImport$: IErrorImportProducts;
  payloadImportProgress$: IImportProductsProgress;

  idImport$: Observable<string>;
  isLoadingImport$: Observable<boolean>;
  isLoadingImportProgress$: Observable<boolean>;
  errorImportProgress$: Observable<any>;

  importProgress: NodeJS.Timer = null;
  isAlive: boolean = true

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store<fromImportProducts.FeatureState>,
    private importProgressStore: Store<fromImportProductsProgress.FeatureState>,
    private matDialogRef: MatDialogRef<ImportProductsComponent>,
    private orderHelperService: OrderHelperService
  ) { }

  ngOnInit() {
    this.orderStoreAndShipmentInfo = this.orderHelperService.getOrderStoreAndShipmentInformation();

    this.idImport$ = this.store.select(ImportProductSelectors.getIdImportedFile)
    this.isLoadingImport$ = this.store.select(ImportProductSelectors.getIsLoadingImport)
    this.isLoadingImportProgress$ = this.importProgressStore.select(ImportProductsProgressSelectors.getIsLoading)

    this.store
      .select(ImportProductSelectors.getIdImportedFile)
      .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
      .subscribe(id => {
        if (id) {
          this.errorImport$ = null
          this.isAlive = true
          this.importProgress = setTimeout(() => this.getImportProgress(id), 500)
        }
      })

    this.store
      .select(ImportProductSelectors.getErrorImport)
      .pipe(takeUntil(this._unSubs$))
      .subscribe(error => {
        this.errorImport$ = error
      })

    this.importProgressStore
      .select(ImportProductsProgressSelectors.getPayload)
      .pipe(distinctUntilChanged(),takeUntil(this._unSubs$))
      .subscribe(payload => {
          this.payloadImportProgress$ = payload
          if (payload && payload.progress === 100) {
            if (this.file) {
              this.fileName = this.file.name
            }
            if (payload.status === 'failed') {
              this.alertMessage = payload.error
            }
            clearTimeout(this.importProgress)
            this.isAlive = false
          }
      });

    this.importProgressStore
      .select(ImportProductsProgressSelectors.getError)
      .pipe(distinctUntilChanged(),takeUntil(this._unSubs$))
      .subscribe(error => {
        this.errorImportProgress$ = error
          if (error) {
            this.errorCounter += 1
            if (this.errorCounter === 3) {
              clearTimeout(this.importProgress)
              this.isAlive = false
            }
          }
      });

  }

  getImportProgress(id: string) {
    const delay = 500
    let self = this;

    self.importProgressStore.dispatch(ImportProductsProgressActions.importProductsProgressRequest({
      payload: id
    }))
    if (this.isAlive) {
      setTimeout(() => this.getImportProgress(id), delay)
    }

  }

  calculateBackgroundColor(): { backgroundColor: string } {
    // if success
    if (this.payloadImportProgress$){
      if (this.payloadImportProgress$.status === 'success' && this.payloadImportProgress$.progress === 100){
        return {
          backgroundColor: '##EFFBF3'
        }
      }
    }
    // failed post & get progress
    if (this.errorImport$) {
      return {
        backgroundColor: '#FFF8EB'
      }
    }
    return {
      backgroundColor: '#F3F5F7'
    }
  }

  onFileBrowse(ev: Event): void {
    const inputEl = ev.target as HTMLInputElement;

    if (inputEl.files && inputEl.files.length > 0) {
      let re = /(?:\.([^.]+))?$/;
      this.file = inputEl.files[0];
      this.firstImport = false;
      
      // check extension
      const ext = re.exec(this.file.name)[1];
      
      this.payloadImportProgress$ = {
        progress: 0,
        results: [],
        status: 'progress'
      }
      this.alertMessage = 'Please keep this pop up open until the process is finished.'

      if (ext === 'csv') {
        let storePayload = {
          storeId: null,
          orderDate: null,
          storeChannelId: null,
          storeClusterId: null,
          storeGroupId: null,
          storeTypeId: null,
        }
        
        if (this.orderStoreAndShipmentInfo) {
          storePayload = {
          storeId: this.orderStoreAndShipmentInfo.storeId.toString(),
          orderDate: this.orderStoreAndShipmentInfo.date.replace(/-/g, '/'),
          storeChannelId: this.orderStoreAndShipmentInfo.storeChannelId,
          storeClusterId: this.orderStoreAndShipmentInfo.storeClusterId,
          storeGroupId: this.orderStoreAndShipmentInfo.storeGroupId,
          storeTypeId: this.orderStoreAndShipmentInfo.storeTypeId,
          }
        }
 
        this.store.dispatch(ImportProductsActions.importProductsRequest({
          payload: {
            file: this.file,
            ...storePayload
          }
        }))
      } else {
        this.fileName = this.file.name;
        this.alertMessage = ''
        this.errorImport$ = {
          name: null,
          className: null,
          code: null,
          errors: null,
          message: null,
          data: {
            errCode: 'invalid-mime',
            solve: null
          }
        }
      }

    }
    
  }

  applyResult(): void {
    let dataOrder = this.orderHelperService.getOrderDataList();
    let results = this.payloadImportProgress$.results

    if (dataOrder) {
      results.map(item => {
        dataOrder.map(value => {
          if (value.catalogueId === item.catalogueId) {
            value.orderQty = item.orderQty
            value.errorQty = null
            results = results.filter(data => data.catalogueId !== item.catalogueId)
          }
        })
      })
      let newResult = results.map((item) => Object.assign({}, item, {
        errorQty: null
      }))

      const data = [...dataOrder, ...newResult]
      this.matDialogRef.close(data)

      this.orderHelperService.setOrderDataList(data as IProductList[]);
    } else {
      let newResult = results.map((item) => Object.assign({}, item, {
        errorQty: null
      }))

      this.matDialogRef.close(newResult)

      this.orderHelperService.setOrderDataList(newResult as IProductList[]);
    }

  }

  ngOnDestroy(): void {
    this._unSubs$.next();
    this._unSubs$.complete();
    this.firstImport = true;
    clearTimeout(this.importProgress)
    this.isAlive = false

    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.

    this.store.dispatch(ImportProductsActions.importProductsClearState())
    this.store.dispatch(ImportProductsProgressActions.importProductsProgressClearState())
  }

}

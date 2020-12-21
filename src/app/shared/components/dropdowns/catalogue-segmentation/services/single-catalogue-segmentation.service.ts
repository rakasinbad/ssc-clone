import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CatalogueSegmentation } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SingleCatalogueSegmentationService implements OnDestroy {

    private message: BehaviorSubject<CatalogueSegmentation> = new BehaviorSubject<CatalogueSegmentation>(null);

    constructor() {}

    getSelectedCatalogueSegment(): Observable<CatalogueSegmentation> {
        return this.message.asObservable();
    }

    selectCatalogueSegment(catalogueSegment: CatalogueSegmentation): void {
        this.message.next(catalogueSegment);
    }

    ngOnDestroy(): void {
        this.message.next(null);
        this.message.complete();
    }
}
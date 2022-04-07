import { DataSource } from '@angular/cdk/collections';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { CatalogueMssSettingsFacadeService } from '../services';
import { CatalogueMssSettingsSegmentation } from '../models';

export class CatalogueMssSettingsSegmentationDataSource implements DataSource<any> {
    data: BehaviorSubject<any[]> = new BehaviorSubject([]);
    isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    total: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor(
        private catalogueMssSettingsFacade: CatalogueMssSettingsFacadeService,
	) {}

    getWithQuery(params: IQueryParams): void {
        this.catalogueMssSettingsFacade.getWithQuery(params);
    }

    connect(): Observable<any> {
		return this.catalogueMssSettingsFacade.segmentations$.pipe(
            map((segmentations) => {
                return segmentations.map((item) => new CatalogueMssSettingsSegmentation(item));
            }),
            tap((item) => this.data.next(item))
        );
    }

    disconnect(): void {
        this.data.next([]);
        this.data.complete();

        this.isLoading.next(false);
        this.isLoading.complete();

        this.total.next(0);
        this.total.complete();
    }
}

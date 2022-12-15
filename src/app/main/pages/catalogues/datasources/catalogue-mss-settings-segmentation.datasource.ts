import { DataSource } from '@angular/cdk/collections';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CatalogueMssSettingsFacadeService } from '../services';
import { CatalogueMssSettingsSegmentation } from '../models';

export class CatalogueMssSettingsSegmentationDataSource implements DataSource<any> {
    data: BehaviorSubject<any[]> = new BehaviorSubject([]);
    isLoading: Observable<boolean> = this.catalogueMssSettingsFacade.isLoading$;
    total: Observable<number> = this.catalogueMssSettingsFacade.totalSegmentations$;
    
    constructor(
        private catalogueMssSettingsFacade: CatalogueMssSettingsFacadeService,
	) {}

    getWithQuery(params: IQueryParams): void {
        this.catalogueMssSettingsFacade.getSegmentationsWithQuery(params);
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
    }
}

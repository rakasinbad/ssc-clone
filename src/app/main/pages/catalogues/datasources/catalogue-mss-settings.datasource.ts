import { DataSource } from '@angular/cdk/collections';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, BehaviorSubject,} from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CatalogueMssSettingsFacadeService } from '../services';
import { CatalogueMssSettings } from '../models';

export class CatalogueMssSettingsDataSource implements DataSource<any> {
    data: BehaviorSubject<any[]> = new BehaviorSubject([]);
    isLoading: Observable<boolean> = this.catalogueMssSettingsFacade.isLoading$;
    total: Observable<number> = this.catalogueMssSettingsFacade.totalMssSettings$;

    constructor(
        private catalogueMssSettingsFacade: CatalogueMssSettingsFacadeService,
	) {}

    getWithQuery(params: IQueryParams): void {
        this.catalogueMssSettingsFacade.getWithQuery(params);
    }

    connect(): Observable<any> {
		return this.catalogueMssSettingsFacade.mssSettings$.pipe(
            map((mssSettings) => {
                return mssSettings.map((item) => new CatalogueMssSettings(item));
            }),
            tap((item) => this.data.next(item))
        );
    }

    disconnect(): void {
        this.data.next([]);
        this.data.complete();
    }
}

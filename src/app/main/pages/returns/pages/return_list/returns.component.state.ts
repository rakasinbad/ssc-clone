import { isMoment } from 'moment';

export class ReturnsComponentState {
    _currentTab: null | string;
    _returnStartDate: null | string;
    _returnEndDate: null | string;

    setTab = (tab: string): void => {
        this._currentTab = tab;
    }

    getTab = () => this._currentTab;

    setDate = (startDate, endDate) => {
        this._returnStartDate = startDate && isMoment(startDate) ?
            startDate.format('YYYY-MM-DD') : null;

        this._returnEndDate = endDate && isMoment(endDate) ?
            endDate.format('YYYY-MM-DD') : null;
    }

    getStartDate = () => this._returnStartDate;
    getEndDate = () => this._returnEndDate;
}

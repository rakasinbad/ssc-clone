import { Store } from '@ngrx/store';
import { FuseNavigation } from '@fuse/types';
import { fromCatalogue } from './store/reducers';
import { UiActions } from 'app/shared/store/actions';

export const statusCatalogue: FuseNavigation[] = [
    {
        id: 'all-type',
        title: 'All',
        // translate: 'STATUS.CATALOGUE.ALL.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-type' }));
        }
    },
    {
        id: 'live',
        title: 'Live',
        // translate: 'STATUS.CATALOGUE.LIVE.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'live' }));
        }
    },
    {
        id: 'empty',
        title: 'Empty',
        // translate: 'STATUS.CATALOGUE.EMPTY.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'empty' }));
        }
    },
    {
        id: 'blocked',
        title: 'Blocked',
        // translate: 'STATUS.CATALOGUE.BLOCKED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'blocked' }));
        }
    },
    {
        id: 'inactive',
        title: 'inactive',
        // translate: 'STATUS.CATALOGUE.INACTIVE.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'inactive' }));
        }
    }
];

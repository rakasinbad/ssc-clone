import { FuseNavigation } from '@fuse/types';
import { UiActions } from 'app/shared/store/actions';

export const statusOrder: FuseNavigation[] = [
    {
        id: 'all-status',
        title: 'All',
        translate: 'STATUS.ORDER.ALL.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
        }
    },
    {
        id: 'new-order',
        title: 'New Order',
        translate: 'STATUS.ORDER.NEW_ORDER.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'new-order' }));
        }
    },
    {
        id: 'packing',
        title: 'Packing',
        translate: 'STATUS.ORDER.PACKING.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'packing' }));
        }
    },
    {
        id: 'to-be-shipped',
        title: 'To be shipped',
        translate: 'STATUS.ORDER.TO_BE_SHIPPED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'to-be-shipped' }));
        }
    },
    {
        id: 'shipped',
        title: 'Shipped',
        translate: 'STATUS.ORDER.SHIPPED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'shipped' }));
        }
    },
    {
        id: 'received',
        title: 'Received',
        translate: 'STATUS.ORDER.RECEIVED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'received' }));
        }
    },
    {
        id: 'completed',
        title: 'Completed',
        translate: 'STATUS.ORDER.COMPLETED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'completed' }));
        }
    }
];

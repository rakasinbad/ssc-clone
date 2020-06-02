import { FuseNavigation } from '@fuse/types';
import { UiActions } from 'app/shared/store/actions';

import { OrderActions } from './store/actions';

export const statusOrder: Array<FuseNavigation> = [
    {
        id: 'all-status',
        title: 'All (-)',
        // title: 'All',
        // translate: 'STATUS.ORDER.ALL.TITLE',
        type: 'item',
        function: (store) => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
            store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        },
    },
    {
        id: 'confirm',
        title: 'New Order (-)',
        // title: 'New Order',
        // translate: 'STATUS.ORDER.NEW_ORDER.TITLE',
        type: 'item',
        function: (store) => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'confirm' }));
            store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        },
    },
    {
        id: 'packing',
        title: 'Packed (-)',
        // title: 'Packing',
        // translate: 'STATUS.ORDER.PACKING.TITLE',
        type: 'item',
        function: (store) => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'packing' }));
            store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        },
    },
    // {
    //     id: 'confirm',
    //     title: 'Siap Dikirim',
    //     //    title: 'To be shipped',
    //     //    translate: 'STATUS.ORDER.TO_BE_SHIPPED.TITLE',
    //     type: 'item',
    //     function: store => {
    //         store.dispatch(UiActions.setCustomToolbarActive({ payload: 'confirm' }));
    //     }
    // },
    {
        id: 'shipping',
        title: 'Shipped (-)',
        //    title: 'Shipped',
        //    translate: 'STATUS.ORDER.SHIPPED.TITLE',
        type: 'item',
        function: (store) => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'shipping' }));
            store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        },
    },
    {
        id: 'delivered',
        title: 'Delivered (-)',
        //    title: 'Received',
        //    translate: 'STATUS.ORDER.RECEIVED.TITLE',
        type: 'item',
        function: (store) => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'delivered' }));
            store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        },
    },
    {
        id: 'done',
        title: 'Done (-)',
        // title: 'Completed',
        // translate: 'STATUS.ORDER.COMPLETED.TITLE',
        type: 'item',
        function: (store) => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'done' }));
            store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        },
    },
    {
        id: 'pending',
        title: 'Pending (-)',
        type: 'item',
        function: (store) => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'pending' }));
            store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        },
    },
    {
        id: 'cancel',
        title: 'Canceled (-)',
        // title: 'Completed',
        // translate: 'STATUS.ORDER.COMPLETED.TITLE',
        type: 'item',
        function: (store) => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'cancel' }));
            store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        },
    },
];

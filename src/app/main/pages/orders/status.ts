import { FuseNavigation } from '@fuse/types';
import { UiActions } from 'app/shared/store/actions';

export const statusOrder: Array<FuseNavigation> = [
    {
        id: 'all-status',
        title: 'Semua',
        // title: 'All',
        // translate: 'STATUS.ORDER.ALL.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
        }
    },
    {
        id: 'confirm',
        title: 'Order Baru',
        // title: 'New Order',
        // translate: 'STATUS.ORDER.NEW_ORDER.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'confirm' }));
        }
    },
    {
        id: 'packing',
        title: 'Dikemas',
        // title: 'Packing',
        // translate: 'STATUS.ORDER.PACKING.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'packing' }));
        }
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
        title: 'Dikirim',
        //    title: 'Shipped',
        //    translate: 'STATUS.ORDER.SHIPPED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'shipping' }));
        }
    },
    {
        id: 'delivered',
        title: 'Diterima',
        //    title: 'Received',
        //    translate: 'STATUS.ORDER.RECEIVED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'delivered' }));
        }
    },
    {
        id: 'done',
        title: 'Selesai',
        // title: 'Completed',
        // translate: 'STATUS.ORDER.COMPLETED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'done' }));
        }
    },
    {
        id: 'cancel',
        title: 'Batal',
        // title: 'Completed',
        // translate: 'STATUS.ORDER.COMPLETED.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'cancel' }));
        }
    }
];

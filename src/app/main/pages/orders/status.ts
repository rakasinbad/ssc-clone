import { FuseNavigation } from '@fuse/types';

export const statusOrder: FuseNavigation[] = [
    {
        id: 'all-status',
        title: 'All',
        translate: 'STATUS.ORDER.ALL.TITLE',
        type: 'item',
        url: '/pages/orders'
    },
    {
        id: 'new-order',
        title: 'New Order',
        translate: 'STATUS.ORDER.NEW_ORDER.TITLE',
        type: 'item',
        url: '/status/2'
    },
    {
        id: 'packing',
        title: 'Packing',
        translate: 'STATUS.ORDER.PACKING.TITLE',
        type: 'item',
        url: '/status/3'
    },
    {
        id: 'to-be-shipped',
        title: 'To be shipped',
        translate: 'STATUS.ORDER.TO_BE_SHIPPED.TITLE',
        type: 'item',
        url: '/status/4'
    },
    {
        id: 'shipped',
        title: 'Shipped',
        translate: 'STATUS.ORDER.SHIPPED.TITLE',
        type: 'item',
        url: '/status/5'
    },
    {
        id: 'received',
        title: 'Received',
        translate: 'STATUS.ORDER.RECEIVED.TITLE',
        type: 'item',
        url: '/status/6'
    },
    {
        id: 'completed',
        title: 'Completed',
        translate: 'STATUS.ORDER.COMPLETED.TITLE',
        type: 'item',
        url: '/status/7'
    }
];

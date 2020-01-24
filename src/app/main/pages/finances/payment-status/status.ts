import { FuseNavigation } from '@fuse/types';
import { UiActions } from 'app/shared/store/actions';

import { PaymentStatusActions } from './store/actions';

export const statusPayment: Array<FuseNavigation> = [
    {
        id: 'all-status',
        title: 'All (-)',
        // translate: 'STATUS.PAYMENT.ALL.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
            store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        }
    },
    {
        id: 'waiting_for_payment',
        title: 'Waiting for Payment (-)',
        // translate: 'STATUS.PAYMENT.WAITING_FOR_PAYMENT.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'waiting_for_payment' }));
            store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        }
    },
    // {
    //     id: 'temporary-paid',
    //     title: 'Temporary Paid',
    //     translate: 'STATUS.PAYMENT.TEMPORARY_PAID.TITLE',
    //     type: 'item',
    //     function: store => {
    //         store.dispatch(UiActions.setCustomToolbarActive({ payload: 'temporary-paid' }));
    //     }
    // },
    {
        id: 'paid',
        title: 'Paid (-)',
        // translate: 'STATUS.PAYMENT.PAID.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'paid' }));
            store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        }
    },
    {
        id: 'overdue',
        title: 'Overdue (-)',
        // translate: 'STATUS.PAYMENT.OVERDUE.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'overdue' }));
            store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        }
    },
    {
        id: 'd-7',
        title: 'D-7 (-)',
        // translate: 'STATUS.PAYMENT.D_7.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'd-7' }));
            store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        }
    },
    {
        id: 'd-3',
        title: 'D-3 (-)',
        // translate: 'STATUS.PAYMENT.D_3.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'd-3' }));
            store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        }
    },
    {
        id: 'd-0',
        title: 'D-0 (-)',
        // translate: 'STATUS.PAYMENT.D_0.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'd-0' }));
            store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        }
    },
    {
        id: 'payment_failed',
        title: 'Cancel (-)',
        //    translate: 'STATUS.PAYMENT.WAITING_FOR_PAYMENT.TITLE',
        type: 'item',
        function: store => {
            store.dispatch(UiActions.setCustomToolbarActive({ payload: 'payment_failed' }));
            store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        }
    }
];

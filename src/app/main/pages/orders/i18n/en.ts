import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        ORDER_DOCUMENT: 'Document Order',
        ORDER_LINES: 'Order Lines',
        ORDER_STATUS: 'Order Status',
        STATUS: {
            ORDER: {
                ALL: {
                    TITLE: 'All'
                },
                COMPLETED: {
                    TITLE: 'Completed'
                },
                NEW_ORDER: {
                    TITLE: 'New Order'
                },
                PACKING: {
                    TITLE: 'Packing'
                },
                RECEIVED: {
                    TITLE: 'Received'
                },
                SHIPPED: {
                    TITLE: 'Shipped'
                },
                TO_BE_SHIPPED: {
                    TITLE: 'To be shipped'
                }
            }
        }
    }
};

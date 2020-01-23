import { globalIdLang } from 'app/lang/i18n/id';

export const locale = {
    lang: 'id',
    data: {
        ...globalIdLang,
        ORDER_DOCUMENT: 'Order Dokumen',
        ORDER_LINES: 'Order Line',
        ORDER_STATUS: 'Status Order',
        STATUS: {
            ORDER: {
                ALL: {
                    TITLE: 'All'
                },
                COMPLETED: {
                    TITLE: 'Done'
                },
                NEW_ORDER: {
                    TITLE: 'New Order'
                },
                PACKING: {
                    TITLE: 'Packed'
                },
                RECEIVED: {
                    TITLE: 'Delivered'
                },
                SHIPPED: {
                    TITLE: 'Shipped'
                },
                TO_BE_SHIPPED: {
                    TITLE: 'Ready To Ship'
                }
            }
        }
    }
};

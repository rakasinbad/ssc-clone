import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        STATUS: {
            PAYMENT: {
                ALL: {
                    TITLE: 'All',
                    TITLE_PARAM: 'All {{ count }}'
                },
                D_0: {
                    TITLE: 'D-0'
                },
                D_1: {
                    TITLE: 'D-1'
                },
                D_3: {
                    TITLE: 'D-3'
                },
                D_7: {
                    TITLE: 'D-7'
                },
                OVERDUE: {
                    TITLE: 'Overdue'
                },
                PAID: {
                    TITLE: 'Paid'
                },
                TEMPORARY_PAID: {
                    TITLE: 'Temporary Paid'
                },
                WAITING_FOR_PAYMENT: {
                    TITLE: 'Waiting for Payment'
                },
                WAITING_FOR_REFUND: {
                    TITLE: 'Waiting for Refund'
                },
                REFUNDED: {
                    TITLE: 'Refunded'
                }
            }
        }
    }
};

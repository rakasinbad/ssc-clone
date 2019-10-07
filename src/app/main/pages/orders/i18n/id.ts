import { globalIdLang } from 'app/lang/i18n/id';

export const locale = {
    lang: 'id',
    data: {
        ...globalIdLang,
        STATUS: {
            ORDER: {
                ALL: {
                    TITLE: 'Semua'
                },
                COMPLETED: {
                    TITLE: 'Selesai'
                },
                NEW_ORDER: {
                    TITLE: 'Order Baru'
                },
                PACKING: {
                    TITLE: 'Dikemas'
                },
                RECEIVED: {
                    TITLE: 'Diterima'
                },
                SHIPPED: {
                    TITLE: 'Dikirim'
                },
                TO_BE_SHIPPED: {
                    TITLE: 'Siap Dikirim'
                }
            }
        }
    }
};

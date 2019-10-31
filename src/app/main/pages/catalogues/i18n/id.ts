import { globalIdLang } from 'app/lang/i18n/id';

export const locale = {
    lang: 'id',
    data: {
        ...globalIdLang,
        ORDER_DOCUMENT: 'Order Dokumen',
        ORDER_LINES: 'Order Line',
        ORDER_STATUS: 'Status Order',
        STATUS: {
            CATALOGUE: {
                ALL: {
                    TITLE: 'Semua'
                },
                ALL_PARAM: {
                    TITLE: 'Semua{{ allCount }}}'
                },
                LIVE: {
                    TITLE: 'Live'
                },
                LIVE_PARAM: {
                    TITLE: 'Live{{ liveCount }}'
                },
                EMPTY: {
                    TITLE: 'Habis'
                },
                EMPTY_PARAM: {
                    TITLE: 'Habis{{ emptyCount }}'
                },
                BLOCKED: {
                    TITLE: 'Diblokir'
                },
                BLOCKED_PARAM: {
                    TITLE: 'Diblokir{{ blockedCount }}'
                },
                ARCHIVED: {
                    TITLE: 'Diarsipkan'
                }
            }
        }
    }
};

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
                    TITLE: 'All'
                },
                ALL_PARAM: {
                    TITLE: 'All ({{ allCount }})'
                },
                LIVE: {
                    TITLE: 'Live'
                },
                LIVE_PARAM: {
                    TITLE: 'Live ({{ liveCount }})'
                },
                EMPTY: {
                    TITLE: 'Empty'
                },
                EMPTY_PARAM: {
                    TITLE: 'Empty ({{ emptyCount }})'
                },
                BLOCKED: {
                    TITLE: 'Banned'
                },
                BLOCKED_PARAM: {
                    TITLE: 'Banned ({{ blockedCount }})'
                },
                INACTIVE: {
                    TITLE: 'Inactive'
                }
            }
        }
    }
};

import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        ORDER_DOCUMENT: 'Document Order',
        ORDER_LINES: 'Order Lines',
        ORDER_STATUS: 'Order Status',
        STATUS: {
            CATALOGUE: {
                ALL: {
                    TITLE: 'All'
                },
                ALL_PARAM: {
                    TITLE: 'All{{ allCount }}'
                },
                LIVE: {
                    TITLE: 'Live'
                },
                LIVE_PARAM: {
                    TITLE: 'Live{{ liveCount }}'
                },
                EMPTY: {
                    TITLE: 'Empty'
                },
                EMPTY_PARAM: {
                    TITLE: 'Empty{{ emptyCount }}'
                },
                BLOCKED: {
                    TITLE: 'Blocked'
                },
                BLOCKED_PARAM: {
                    TITLE: 'Blocked{{ blockedCount }}'
                },
                ARCHIVED: {
                    TITLE: 'Archived'
                }
            }
        }
    }
};

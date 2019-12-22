import { globalEnLang } from 'app/lang/i18n/en';

export const locale = {
    lang: 'en',
    data: {
        ...globalEnLang,
        BREADCRUMBS: {
            ...globalEnLang.BREADCRUMBS,
            PORTFOLIO: 'Portfolio'
        }
    }
};

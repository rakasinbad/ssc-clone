import {t} from 'testcafe';

import element from '../../element/store/store_list_element.js'

class storeListPage{

    async clickStoreDetail() {
        await t
            .click(element.storeRow)
    }

    async clickVerifTab() {
        await t
            .click(element.storeTabVerif)
    }

}

export default new storeListPage();
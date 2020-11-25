import {t} from 'testcafe';

import element from '../element/oms_element.js'

class omsPage{

    async clickOMSPage() {
        await t
            .click(element.omsSection)
    }

    async clickPendingPaymentSection() {
        this.clickOMSPage()
        await t
            .click(element.omsPendingPaymentTab)
    }

    async clickOMSDetail() {
        await t
            .click(element.omsStoreNameRow)
    }

}

export default new omsPage();
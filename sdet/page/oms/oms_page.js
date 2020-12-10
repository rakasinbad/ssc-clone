import {t} from 'testcafe';

import element from '../../element/oms_element.js'

class omsPage{
    async omsTableLoaded() {
        await (element.omsRowTableData).with({ visibilityCheck: true })();
    }

    async clickOMSPage() {
        await t
            .click(element.omsSection)
    }

    async clickOrderStatusSection(statusOrder) {
        this.omsTableLoaded()
        let elementData = element.omsPendingPaymentTab;
        switch (statusOrder.toLowerCase()) {
            case 'pending':
                elementData = element.omsPendingTab;
            break;
            case 'pending_payment':
                elementData = element.omsPendingPaymentTab;
            break;
            case 'new_order':
                elementData = element.omsNewOrderTab;
            break;
            case 'packed':
                elementData = element.omsPackedTab;
            break;
            case 'shipped':
                elementData = element.omsShippedTab;
            break;
            case 'delivered':
                elementData = element.omsDeliveredTab;
            break;
            case 'done':
                elementData = element.omsDoneTab;
            break;
            case 'canceled':
                elementData = element.omsCancelledTab;
            break;
            default:
                elementData = element.omsPendingTab;
        }
        await t
            .click(elementData)
    }

    async clickOMSDetail() {
        this.omsTableLoaded()
        await t
            .click(element.omsStoreNameRow)
    }

}

export default new omsPage();
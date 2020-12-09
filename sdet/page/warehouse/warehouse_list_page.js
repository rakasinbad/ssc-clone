import {t} from 'testcafe';

import element from '../../element/warehouse_element.js'

class warehouseListPage{

    async warehouseListTableLoaded() {
        await (element.warehouseRow).with({ visibilityCheck: true })();
    }

    async clickWarehouseMenu() {
        await t
            .click(element.warehouseSection)
    }

    async clickWarehouseListSection() {
        this.clickWarehouseMenu()
        await t
            .click(element.warehouseListSection)
    }

    async clickWarehouseDetail() {
        this.warehouseListTableLoaded()
        await t
            .click(element.warehouseRow)
    }

    async clickAddWarehouseButton() {
        this.warehouseListTableLoaded()
        await t
            .click(element.warehouseAddButton)
    }

}

export default new warehouseListPage();
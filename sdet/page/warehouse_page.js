import {t} from 'testcafe';

import element from '../element/warehouse_element.js'

class warehousePage{

    async warehouseListTableLoaded() {
        await (element.warehouseRow).exists
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

    async clickWarehouseLocationTab() {
        this.clickWarehouseDetail()
        await t
            .click(element.warehouseLocationTab)
    }

    async clickWarehouseCoverageTab() {
        this.clickWarehouseDetail()
        await t
            .click(element.warehouseCoverageTab)
    }

    async clickWarehouseSKUTab() {
        this.clickWarehouseDetail()
        await t
            .click(element.warehouseSKUTab)
    }

    async clickWarehouseEditButton() {
        this.clickWarehouseDetail()
        await t
            .click(element.warehouseEditButton)
    }

    async clickAddWarehouseButton() {
        this.warehouseListTableLoaded()
        await t
            .click(element.warehouseAddButton)
    }

}

export default new warehousePage();
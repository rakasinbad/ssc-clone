import {t} from 'testcafe';

import element from '../../element/warehouse_element.js'

class warehouseDetailPage{

    async clickWarehouseLocationTab() {
        await t
            .click(element.warehouseLocationTab)
    }
    
    async clickWarehouseCoverageTab() {
        await t
            .click(element.warehouseCoverageTab)
    }
    
    async clickWarehouseSKUTab() {
        await t
            .click(element.warehouseSKUTab)
    }
    
    async clickWarehouseEditButton() {
        await t
            .click(element.warehouseEditButton)
    }

}

export default new warehouseDetailPage();
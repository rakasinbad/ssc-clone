import page from '../../page/warehouse_page.js'
import roles from '../../helper/supplier_account.js'
import element from '../../element/warehouse_element.js'

const tc = require('../../test_case/warehouse/tc_warehouse_list.js')
const env = require('dotenv').config(); 

fixture(`${tc.testCase.describe}`)
    .before(async ctx  => {
        ctx.alreadyLoggedIn = false;
    })

    .beforeEach(async t => {
        if ( t.fixtureCtx.alreadyLoggedIn === false ) {
            await t
            .maximizeWindow()
            .useRole(roles.adminTRS)
            
            t.fixtureCtx.alreadyLoggedIn = true;
        }
    })

    .page `${process.env.SSC_BASE_URL}/pages/account/stores`

test(`@test ${tc.testCase.positive.getWarehouseListPage}`, async t => {
    await page.clickWarehouseListSection()

    await t.expect((element.warehouseListTitle).exists).ok()
});

test(`@test ${tc.testCase.positive.getWarehouseDetail}`, async t => {
    await page.clickWarehouseListSection()
    const warehouseName = await (element.warehouseNameRow).innerText;
    
    await page.clickWarehouseDetail()
    const warehouseDetailName = await (element.warehouseDetailName).innerText;

    await t
        .expect((element.warehouseDetailName).exists).ok()
        .expect(warehouseDetailName).eql(warehouseName)
});

test(`@test ${tc.testCase.positive.getWarehouseDetailLocation}`, async t => {
    await page.clickWarehouseListSection()
    await page.clickWarehouseLocationTab()

    const warehouseLocationTabText = await (element.warehouseLocationTitle).innerText;

    await t
        .expect((element.warehouseLocationTitle).exists).ok()
        .expect(warehouseLocationTabText).eql("Warehouse Location")
});

test(`@test ${tc.testCase.positive.getWarehouseDetailCoverage}`, async t => {
    await page.clickWarehouseListSection()
    await page.clickWarehouseCoverageTab()

    const warehouseCoverageTabText = await (element.warehouseTabsTitle).innerText;

    await t
        .expect((element.warehouseTabsTitle).exists).ok()
        .expect(warehouseCoverageTabText).eql("Warehouse Coverage Information")
});

test(`@test ${tc.testCase.positive.getWarehouseDetailSKU}`, async t => {
    await page.clickWarehouseListSection()
    await page.clickWarehouseSKUTab()

    const warehouseSKUTabText = await (element.warehouseTabsTitle).innerText;

    await t
        .expect((element.warehouseTabsTitle).exists).ok()
        .expect(warehouseSKUTabText).eql("List SKU and Stock")
});

test(`@test ${tc.testCase.positive.getWarehouseEditPage}`, async t => {
    await page.clickWarehouseListSection()
    await page.clickWarehouseEditButton()

    const warehouseEditText = await (element.warehouseEditText).innerText;

    await t
        .expect((element.warehouseEditText).exists).ok()
        .expect(warehouseEditText).eql("Warehouse Information")
});

test(`@test ${tc.testCase.positive.getWarehouseAddPage}`, async t => {
    await page.clickAddWarehouseButton()

    const warehouseAddText = await (element.warehouseEditText).innerText;

    await t
        .expect((element.warehouseEditText).exists).ok()
        .expect(warehouseAddText).eql("Warehouse Information")
});
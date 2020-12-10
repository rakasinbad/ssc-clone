import page from '../../page/oms/oms_page.js'
import roles from '../../helper/supplier_account.js'
import element from '../../element/oms_element.js'

const tc = require('../../test_case/oms/tc_oms.js')
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

    .page `${process.env.SSC_BASE_URL}/pages/orders`

test(`@sanity ${tc.testCase.positive.getOMSPage}`, async t => {
    await t
        .expect((element.omsTitlePage).exists).ok("No Records Found")
});

test(`@sanity ${tc.testCase.positive.getOMSDetail}`, async t => {
    const storeName = await (element.omsStoreNameRow).innerText; 
    const storeValue = await (element.omsOrderValueRow).innerText;
    const storeStatus = await (element.omsStatusValueRow).innerText;

    await page
        .clickOMSDetail()
    const storeNameDetail = await (element.omsDetailStoreName).innerText;
    const storeValueDetail = await (element.omsDetailOrderValue).innerText;
    const storeStatusDetail = await (element.omsDetailStatuValue).innerText;

    await t
        .expect(storeNameDetail).eql(storeName, "No Records Found")
        .expect(storeValueDetail).eql(storeValue, "No Records Found")
        .expect(storeStatusDetail).eql(storeStatus, "No Records Found")
});

test(`@sanity ${tc.testCase.positive.getPendingTab}`, async t => {
    await page
        .clickOrderStatusSection('pending')
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("-")
});

test(`@sanity ${tc.testCase.positive.getPendingPaymentTab}`, async t => {
    await page
        .clickOrderStatusSection('pending_payment')
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("Pending Payment", "No Record Found")
});

test(`@sanity ${tc.testCase.positive.getNewOrderTab}`, async t => {
    await page
        .clickOrderStatusSection('new_order')
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("New Order")
});

test(`@sanity ${tc.testCase.positive.getPackedTab}`, async t => {
    await page
        .clickOrderStatusSection('packed')
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("Packed")
});

test(`@sanity ${tc.testCase.positive.getShippedTab}`, async t => {
    await page
        .clickOrderStatusSection('shipped')
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("Shipped")
});

test(`@sanity ${tc.testCase.positive.getDeliveredTab}`, async t => {
    await page
        .clickOrderStatusSection('delivered')
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("Delivered")
});

test(`@sanity ${tc.testCase.positive.getDoneTab}`, async t => {
    await page
        .clickOrderStatusSection('done')
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("Done")
});

test(`@sanity ${tc.testCase.positive.getCancelledTab}`, async t => {
    await page
        .clickOrderStatusSection('canceled')
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("Canceled")
});
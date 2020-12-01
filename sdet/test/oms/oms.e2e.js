import page from '../../page/oms_page.js'
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

    .page `${process.env.SSC_BASE_URL}/pages/account/stores`

test(`@sanity ${tc.testCase.positive.getOMSPage}`, async t => {
    await page
        .clickOMSPage()
    await t
        .expect((element.omsTitlePage).exists).ok("No Records Found")
});

test(`@sanity ${tc.testCase.positive.getOMSDetail}`, async t => {
    await page
        .clickOMSPage()
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

test(`@sanity ${tc.testCase.positive.getPendingPaymentTab}`, async t => {
    await page
        .clickPendingPaymentSection()
    const storeStatus = await (element.omsStatusValueRow).innerText;
    await t
        .expect(storeStatus).eql("Pending Payment", "No Records Found")
});
import page from '../../page/store/store_list_page.js'
import roles from '../../helper/supplier_account.js'
import element from '../../element/store/store_list_element.js'

const tc = require('../../test_case/store/store_list/tc_store_list.js')
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

test(`@sanity ${tc.testCase.positive.getStoreList}`, async t => {
    await t
        .expect((element.titlePage).exists).ok()
});

test(`@sanity ${tc.testCase.positive.getStoreDetail}`, async t => {
    const storeName = await (element.storeNameTitle).innerText;
    await page
        .clickStoreDetail()
    
    const storeNameDetail = await (element.storeNameDetailTitle).innerText;
    await t
        .expect(storeNameDetail.toUpperCase()).eql(storeName.toUpperCase())
});

test(`@sanity ${tc.testCase.positive.getVerifTab}`, async t => {
    await page
        .clickVerifTab()
    const storeStatus = await (element.storeStatusTitle).innerText;
    await t
        .expect(storeStatus).eql('Verified')
});
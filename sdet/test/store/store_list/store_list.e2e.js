import page from '../../../page/store/store_list_page.js'
import roles from '../../../helper/supplier_account.js'
import element from '../../../element/login_element.js'

const tc = require('../../../test_case/store/store_list/tc_store_list.js')
const env = require('dotenv').config(); 

fixture(`${tc.testCase.describe}`)
    .page `${process.env.SSC_BASE_URL}`
    .beforeEach(async t =>{
        await t
            .maximizeWindow()
            .useRole(roles.adminTRS)
    });

test(`@sanity ${tc.testCase.positive.getStoreList}`, async t => {
    
});
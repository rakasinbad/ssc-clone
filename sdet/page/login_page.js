import {t} from 'testcafe';

import loginElement from '../element/login_element.js'
import homeElement from '../element/homepage_element.js'

class loginPage{
    async loginSupplier(supplierUsername, supplierPassword) {
        await t
            .typeText(loginElement.inputUsername, supplierUsername)
            .typeText(loginElement.inputPassword, supplierPassword)
            .click(loginElement.submitButton)
            .expect((homeElement.titlePage).exists).ok()
    }
}

export default new loginPage();
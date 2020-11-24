import { Role } from 'testcafe';
import page from '../page/login_page.js'

const env = require('dotenv').config(); 

const supplier_staging = process.env.SSC_BASE_URL
const supplierUsername = process.env.SSC_USERNAME_TRS;
const supplierPassword = process.env.SSC_PASSWORD;

const adminTRS = Role(supplier_staging, async t => {
    await page
        .loginSupplier(supplierUsername, supplierPassword)
});

module.exports = {
    adminTRS
};

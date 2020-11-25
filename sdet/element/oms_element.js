import {Selector } from 'testcafe';

const omsSection = Selector('.nav-link.ng-star-inserted').withExactText('OMS')
const omsTitlePage = Selector('.m-0')
const omsPendingPaymentTab = Selector('.mat-tab-label:nth-child(3)')
const omsStoreNameRow = Selector('.mat-row:nth-child(2) mat-cell:nth-child(4)')
const omsOrderValueRow = Selector('.mat-row:nth-child(2) mat-cell:nth-child(5)')
const omsStatusValueRow = Selector('.mat-row:nth-child(2) mat-cell:nth-child(8)')
const omsDetailStoreName = Selector('.box-content .form-field .field:nth-child(2) .label+div')
const omsDetailOrderValue = Selector('.box-content .form-field .field:nth-child(6) .delimiter+div')
const omsDetailStatuValue = Selector('.mat-subheading-2')

module.exports = {
    omsSection,
    omsTitlePage,
    omsPendingPaymentTab,
    omsStoreNameRow,
    omsOrderValueRow,
    omsStatusValueRow,
    omsDetailStoreName,
    omsDetailOrderValue,
    omsDetailStatuValue
};
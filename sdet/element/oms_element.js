import {Selector } from 'testcafe';

const omsSection = Selector('.nav-link.ng-star-inserted').withExactText('OMS')
const omsTitlePage = Selector('.m-0')
const omsRowTableData = Selector('.orders-table .mat-row')
const omsPendingTab = Selector('.mat-tab-label:nth-child(2)')
const omsPendingPaymentTab = Selector('.mat-tab-label:nth-child(3)')
const omsNewOrderTab = Selector('.mat-tab-label:nth-child(4)')
const omsPackedTab = Selector('.mat-tab-label:nth-child(5)')
const omsShippedTab = Selector('.mat-tab-label:nth-child(6)')
const omsDeliveredTab = Selector('.mat-tab-label:nth-child(7)')
const omsDoneTab = Selector('.mat-tab-label:nth-child(8)')
const omsCancelledTab = Selector('.mat-tab-label:nth-child(9)')
const omsStoreNameRow = Selector('.mat-row:nth-child(2) mat-cell:nth-child(4)')
const omsOrderValueRow = Selector('.mat-row:nth-child(2) mat-cell:nth-child(5)')
const omsStatusValueRow = Selector('.mat-row:nth-child(2) mat-cell:nth-child(8)')
const omsDetailStoreName = Selector('.box-content .form-field .field:nth-child(2) .label+div')
const omsDetailOrderValue = Selector('.box-content .form-field .field:nth-child(6) .delimiter+div')
const omsDetailStatuValue = Selector('.mat-subheading-2')

module.exports = {
    omsSection,
    omsTitlePage,
    omsRowTableData,
    omsPendingTab,
    omsPendingPaymentTab,
    omsNewOrderTab,
    omsPackedTab,
    omsShippedTab,
    omsDeliveredTab,
    omsDoneTab,
    omsCancelledTab,
    omsStoreNameRow,
    omsOrderValueRow,
    omsStatusValueRow,
    omsDetailStoreName,
    omsDetailOrderValue,
    omsDetailStatuValue
};
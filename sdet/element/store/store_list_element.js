import {Selector } from 'testcafe';

const titlePage = Selector('span[class="username mr-12"]')
const storeRow = Selector('.mat-row:nth-child(2)')
const storeTabVerif = Selector('.mat-tab-label:nth-child(2)')
const storeNameTitle = Selector('.mat-row:nth-child(2) .mat-cell:nth-child(2)')
const storeStatusTitle = Selector('.mat-cell.mat-column-supplier-status')
const storeNameDetailTitle = Selector('div.h2')

module.exports = {
    titlePage,
    storeRow,
    storeTabVerif,
    storeNameTitle,
    storeStatusTitle,
    storeNameDetailTitle
};
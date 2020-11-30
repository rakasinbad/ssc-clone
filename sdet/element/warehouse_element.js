import {Selector } from 'testcafe';

const warehouseSection = Selector('.nav-item:nth-child(9) .nav-link')
const warehouseListSection = Selector('.nav-item:nth-child(9) .ng-trigger-slideInOut .ng-star-inserted:nth-child(1) .nav-link')
const warehouseListTitle = Selector('.m-0')
const warehouseRow = Selector('.mat-row:nth-child(2)')
const warehouseNameRow = Selector('.mat-row:nth-child(2) .mat-cell:nth-child(2)')
const warehouseDetailName = Selector('div.h2')
const warehouseLocationTab = Selector('.mat-tab-label:nth-child(2)')
const warehouseLocationTitle = Selector('.mat-headline')
const warehouseCoverageTab = Selector('.mat-tab-label:nth-child(3)')
const warehouseTabsTitle = Selector('.font-weight-600')
const warehouseSKUTab = Selector('.mat-tab-label:nth-child(4)')
const warehouseEditButton = Selector('.mat-raised-button')
const warehouseEditText = Selector('.mat-headline')
const warehouseAddButton = Selector('.mat-flat-button')

module.exports = {
    warehouseSection,
    warehouseListSection,
    warehouseListTitle,
    warehouseRow,
    warehouseNameRow,
    warehouseDetailName,
    warehouseLocationTab,
    warehouseLocationTitle,
    warehouseCoverageTab,
    warehouseTabsTitle,
    warehouseSKUTab,
    warehouseEditButton,
    warehouseEditText,
    warehouseAddButton
};
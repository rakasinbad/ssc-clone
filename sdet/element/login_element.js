import {Selector } from 'testcafe';

const inputUsername = Selector('#mat-input-0')
const inputPassword = Selector('#mat-input-1')
const submitButton = Selector('button').withText("LOGIN")

module.exports = {
    inputUsername,
    inputPassword,
    submitButton
};
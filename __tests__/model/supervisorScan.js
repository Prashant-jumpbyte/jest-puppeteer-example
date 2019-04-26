const path = require('path');

async function supervisorScan(page, supId, password) {
    //Superviso Confirmation modal
    await page.waitForSelector('.ng-isolate-scope > #modal-body > .row > .form-group > #sup-id')
    let txtsupID = await page.$('.ng-isolate-scope > #modal-body > .row > .form-group > #sup-id');
    await txtsupID.click({
        clickCount: 3
    })
    await txtsupID.type(supId, {
        delay: 0
    });
    await page.waitForSelector('.ng-isolate-scope > #modal-body > .row > .form-group > #sup-password')
    let txtsupPassword = await page.$('.ng-isolate-scope > #modal-body > .row > .form-group > #sup-password');
    await txtsupPassword.click({
        clickCount: 3
    })
    await txtsupPassword.type(password, {
        delay: 0
    });
    await page.waitForSelector('.modal-dialog > .modal-content > .form-validate > .ng-isolate-scope > .btn')
    await page.click('.modal-dialog > .modal-content > .form-validate > .ng-isolate-scope > .btn')
}
module.exports = { supervisorScan }
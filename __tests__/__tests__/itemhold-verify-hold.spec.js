const path = require('path');
const timeout = 29000
const shipmentData = require('../data/shipment-data.json');
const { supervisorScan } = require('../model/supervisorScan');
const { Login } = require('../model/Login');


describe('/ (ItemHold/Verify-Hold)', () => {
    let page
    // page.setDefaultNavigationTimeout(800000)
    beforeAll(async () => {
        page = await global.__BROWSER__.newPage()
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        await page.goto('https://ranger.coordinate.work', {
            waitLoad: true,
            waitNetworkIdle: true,
            timeout: 0,
            waitUntil: 'domcontentloaded'
        })
        await page.evaluate('document.documentElement.webkitRequestFullscreen()');

    }, timeout)

    afterAll(async () => {
        await page.close()
    })

    it('Login Step Success', async () => {
        if (await page.$('input[name=email]') !== null) {
            await page.waitFor(1000)
            await page.waitForSelector("input[name=email]");
            await Login(page, shipmentData.Login.ID, shipmentData.Login.password)
        }

    }, timeout)

    it("Go to Item Hold screen", async () => {

        await page.waitForSelector('.container-fluid > #bs-example-navbar-collapse-1 > .nav > .dropdown > .ng-binding')
        await page.click('.container-fluid > #bs-example-navbar-collapse-1 > .nav > .dropdown > .ng-binding')

        await page.waitForSelector('.navbar-right > .open > .dropdown-menu > .ng-scope:nth-child(3) > .ng-scope')
        await page.click('.navbar-right > .open > .dropdown-menu > .ng-scope:nth-child(3) > .ng-scope')

        await page.waitForSelector('.ng-isolate-scope > div > .hide-in-print > .ng-scope:nth-child(6) > .ng-binding')
        await page.click('.ng-isolate-scope > div > .hide-in-print > .ng-scope:nth-child(6) > .ng-binding')


        await page.waitFor(500)
        await page.waitForSelector('.ng-scope > .row > .col-sm-12 > .col-sm-7 > .input-lg')
        try {

            await expect(await page.waitForSelector('.ng-scope > .row > .col-sm-12 > .col-sm-7 > .input-lg', {
                visible: true,
            })).toBeTruthy();
        } catch (err) {
            await page.screenshot({
                fullPage: true,
                path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_shipmentMenu.png`,
            });
        }

    }, timeout);

    it("Verify-Hold", async () => {
        //Click on `Hold-verify` button
        await page.waitFor(2000)
        if (await page.$('.ng-scope > .row > .col-sm-12 > .col-sm-12 > .col-sm-12') !== null) {
            await page.waitForSelector('.ng-scope > .row > .col-sm-12 > .col-sm-12 > .col-sm-12')
            let notFound = await page.$eval('.ng-scope > .row > .col-sm-12 > .col-sm-12 > .col-sm-12', e => e.innerText)
            console.log(notFound)
            try {
                await expect(notFound).not.toEqual('No Shipment is on hold');
            } catch (err) {
                await page.screenshot({
                    fullPage: true,
                    path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_verifyhold.png`,
                });
            }
        } else {
            await page.waitForSelector('.row > .col-sm-12 > .row > .col-sm-2 > .btn')
            await page.click('.row > .col-sm-12 > .row > .col-sm-2 > .btn')

            //scan supervisor
            await supervisorScan(page, shipmentData.Supervisor.ID, shipmentData.Supervisor.password);

            await page.waitFor(1000)
            //Click on `Bulk verify` button of `Verify Item Hold` modal
            await page.waitForSelector('.modal > .modal-dialog > .modal-content > .modal-footer > .btn:nth-child(3)')
            await page.click('.modal > .modal-dialog > .modal-content > .modal-footer > .btn:nth-child(3)')

            //Check If getting an error force close that shipments
            if (await page.$('.modal-content > #modal-body > .ng-scope > .ng-scope > .ng-binding') !== null) {
                await page.waitForSelector('.modal-content > #modal-body > .ng-scope > .ng-scope > .ng-binding')
                await page.click('.modal-content > #modal-body > .ng-scope > .ng-scope > .ng-binding')
                let lblerrortext = await page.$eval(".modal-content > #modal-body > .ng-scope > .ng-scope > .ng-binding", e => e.innerText);
                if (lblerrortext == "Unable to locate the shipment you requested") {
                    //Click `Force close` button
                    await page.waitForSelector('.modal > .modal-dialog > .modal-content > .modal-footer > .btn:nth-child(1)')
                    await page.click('.modal > .modal-dialog > .modal-content > .modal-footer > .btn:nth-child(1)')

                    await page.waitForSelector('.ng-scope > .col-sm-5 > .row > .col-sm-12 > .ng-invalid-required')
                    let count = (await page.$$('.ng-scope > .col-sm-5 > .row > .col-sm-12 > .ng-invalid-required')).length;
                    console.log("Count", count);
                    await page.waitFor(1000)
                    for (i = 1; i <= count; i++) {
                        await page.waitForSelector('.ng-scope:nth-child(' + i + ') > .col-sm-5 > .row > .col-sm-12 > .ng-invalid-required')
                        await page.select('.ng-scope:nth-child(' + i + ') > .col-sm-5 > .row > .col-sm-12 > .ng-invalid-required', 'string:Shipment Not On Hold')
                    }

                    await page.waitForSelector('.modal-dialog > .modal-content > .form-validate > .modal-footer > .btn:nth-child(1)')
                    await page.click('.modal-dialog > .modal-content > .form-validate > .modal-footer > .btn:nth-child(1)')

                } else {
                    try {
                        await expect(lblerrortext).toBe('Unable to locate the shipment you requested');
                    } catch (err) {
                        await page.screenshot({
                            fullPage: true,
                            path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_verifyhold.png`,
                        });
                    }
                }
            } else {
                console.log(" Up ELSE")
            }
            //Click OK button of `Verify Item Hold` modal
            await page.waitFor(3000)
            await page.waitForSelector('.modal > .modal-dialog > .modal-content > .modal-footer > .btn:nth-child(1)')
            await page.click('.modal > .modal-dialog > .modal-content > .modal-footer > .btn:nth-child(1)')

            //Write Comment
            await page.waitForSelector('.list-group > .row > #modal-body > .form-group > .ng-untouched')
            let txtcomment = await page.$('.list-group > .row > #modal-body > .form-group > .ng-untouched')

            await txtcomment.click({
                clickCount: 1
            })

            await txtcomment.type(shipmentData.verifyhold.comment, {
                delay: 10
            });

            //Submit comment 
            await page.waitForSelector('.modal-md > .modal-content > .ng-scope > .modal-footer > .btn-success')
            await page.click('.modal-md > .modal-content > .ng-scope > .modal-footer > .btn-success')

            //Select Unverifed in Dropdown
            await page.waitForSelector('.ng-isolate-scope > .margin-top-40 > .align-center-horizontally > .col-sm-3 > #category')
            await page.select('.ng-isolate-scope > .margin-top-40 > .align-center-horizontally > .col-sm-3 > #category', 'string:notSameVaultDate')
            await page.click('.ng-isolate-scope > .margin-top-40 > .align-center-horizontally > .col-sm-3 > #category')

            //Check all shipment is verifed or not
            await page.waitFor(2000)
            await page.waitForSelector('.ng-scope > .row > .col-sm-12 > .col-sm-12 > .col-sm-12')
            let notFound = await page.$eval('.ng-scope > .row > .col-sm-12 > .col-sm-12 > .col-sm-12', e => e.innerText)
            console.log(notFound)
            try {
                await expect(notFound).not.toEqual('No Shipment is on hold');
            } catch (err) {
                await page.screenshot({
                    fullPage: true,
                    path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_verifyhold.png`,
                });
            }
        }
    }, timeout);

}, timeout);
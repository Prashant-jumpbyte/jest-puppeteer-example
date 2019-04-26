const path = require('path');
const timeout = 30000
const shipmentData = require('../data/shipment-data.json');
const { supervisorScan } = require('../model/supervisorScan');
const { Login } = require('../model/Login');


describe('/ (ItemHold/Release-Item)', () => {
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
        await page.waitFor(1000)
        if (await page.$('input[name=email]') !== null) {

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

    it("Relaese-Item", async () => {

        //Select All in status Dropdown
        await page.select('.ng-isolate-scope > .margin-top-40 > .align-center-horizontally > .col-sm-3 > #category', 'string:')

        // await page.waitForSelector('.ng-isolate-scope > .margin-top-40 > .align-center-horizontally > .col-sm-3 > #category')
        // await page.click('.ng-isolate-scope > .margin-top-40 > .align-center-horizontally > .col-sm-3 > #category')
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
            console.log("DATA in")
            //Count total row of table
            await page.waitForSelector('.table > .table > tbody > .ng-scope > .remove-white-space')
            console.log((await page.$$('.table > .table > tbody > .ng-scope > .remove-white-space')).length)
            let rowCount = (await page.$$('.table > .table > tbody > .ng-scope > .remove-white-space')).length;
            let pageCount = ((await page.$$('.ng-scope > .col-sm-12 > .ng-not-empty > .ng-scope > .ng-binding')).length - 2);
            console.log("page ", pageCount)
            let pageC = 2;
            for (i = 1; i <= rowCount; i++) {

                await page.waitForSelector(".table > .table > tbody > .ng-scope:nth-child(" + i + ") > .remove-white-space")
                let trackingID = await page.$eval(".table > .table > tbody > .ng-scope:nth-child(" + i + ") > .remove-white-space", e => e.innerText)

                await page.waitForSelector(".table > .table-pad-3 > tbody > .ng-scope:nth-child(" + i + ") > .ng-scope:nth-child(3)")
                let fromLocation = await page.$eval(".table > .table-pad-3 > tbody > .ng-scope:nth-child(" + i + ") > .ng-scope:nth-child(3)", e => e.innerText)

                await page.waitForSelector(".table > .table-pad-3 > tbody > .ng-scope:nth-child(" + i + ") > .ng-scope:nth-child(4)")
                let toLocation = await page.$eval(".table > .table-pad-3 > tbody > .ng-scope:nth-child(" + i + ") > .ng-scope:nth-child(4)", e => e.innerText)

                console.log(trackingID, fromLocation, toLocation);
                if (fromLocation != "N/A" || toLocation != "N/A") {
                    //Click release button
                    await page.waitForSelector(".ng-scope:nth-child(" + i + ") > .td-vertical-align > .ng-scope > .btn-group > .btn-success > .glyphicon-repeat")
                    await page.click(".ng-scope:nth-child(" + i + ") > .td-vertical-align > .ng-scope > .btn-group > .btn-success > .glyphicon-repeat")

                    //Select release Route
                    await page.waitForSelector('.table > tbody > tr > .col-xs-4 > .form-control')
                    await page.select('.table > tbody > tr > .col-xs-4 > .form-control', 'string:005')
                    await page.waitFor(2000)

                    //Click on Release button
                    await page.waitForSelector('.modal-dialog > .modal-content > .form-validate > .modal-footer > .btn:nth-child(2)')
                    await page.click('.modal-dialog > .modal-content > .form-validate > .modal-footer > .btn:nth-child(2)')

                    //Supervisor scan
                    await supervisorScan(page, shipmentData.Supervisor.ID, shipmentData.Supervisor.password);
                    await page.waitFor(2000)

                    await page.waitForSelector('.table > .table > tbody > .ng-scope > .remove-white-space')
                    console.log((await page.$$('.table > .table > tbody > .ng-scope > .remove-white-space')).length)
                    let afterrowCount = (await page.$$('.table > .table > tbody > .ng-scope > .remove-white-space')).length;
                    let afterpageCount = ((await page.$$('.ng-scope > .col-sm-12 > .ng-not-empty > .ng-scope > .ng-binding')).length - 2);
                    console.log("page ", pageCount)
                    let afterpageC = 2;

                    for (j = 1; j <= afterrowCount; j++) {
                        try {
                            //Check after realse shipment should be not displayed
                            await expect(await page.$eval(".table > .table > tbody > .ng-scope:nth-child(" + j + ") > .remove-white-space", e => e.innerText)).not.toBe(trackingID);
                            console.log("Release success.!")
                        } catch (err) {
                            await page.screenshot({
                                fullPage: true,
                                path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_relaese_Item.png`,
                            });
                        }

                        if (j <= afterrowCount) {

                            if (afterpageC <= afterpageCount) {
                                afterpageC++;
                                //Click on next page
                                console.log("page count", afterpageC)
                                await page.waitForSelector('.ng-scope > .col-sm-12 > .ng-not-empty > .ng-scope:nth-child(' + afterpageC + ') > .ng-binding')
                                await page.click('.ng-scope > .col-sm-12 > .ng-not-empty > .ng-scope:nth-child(' + afterpageC + ') > .ng-binding')
                            } else {
                                break;
                            }

                            await page.waitFor(2000)
                            await page.waitForSelector('.table > .table > tbody > .ng-scope > .remove-white-space')
                            afterrowCount = (await page.$$('.table > .table > tbody > .ng-scope > .remove-white-space')).length;
                            console.log("Row count", afterrowCount)
                            j = 1;
                        }
                    }

                    break;
                } else {
                    if (i <= rowCount) {

                        if (pageC <= pageCount) {
                            pageC++;
                            //Click on next page
                            console.log("page count", pageC)
                            await page.waitForSelector('.ng-scope > .col-sm-12 > .ng-not-empty > .ng-scope:nth-child(' + pageC + ') > .ng-binding')
                            await page.click('.ng-scope > .col-sm-12 > .ng-not-empty > .ng-scope:nth-child(' + pageC + ') > .ng-binding')
                        } else {
                            console.log("Else")
                            break;
                        }

                        await page.waitFor(2000)
                        await page.waitForSelector('.table > .table > tbody > .ng-scope > .remove-white-space')
                        rowCount = (await page.$$('.table > .table > tbody > .ng-scope > .remove-white-space')).length;
                        console.log("Row count", rowCount)
                        i = 1;
                    } else {

                    }
                }
            }
        }
    }, timeout);

}, timeout);
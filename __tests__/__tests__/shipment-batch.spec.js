const path = require('path');
const timeout = 30000
const shipmentData = require('../data/shipment-data.json');
const { supervisorScan } = require('../model/supervisorScan');
const { Login } = require('../model/Login');


describe('/ (ItemHold/Shipment-batch)', () => {
    let page
    // page.setDefaultNavigationTimeout(800000)
    beforeAll(async () => {
        page = await global.__BROWSER__.newPage()
        await page.setViewport({
            width: 1920,
            height: 1080
        });
        console.log("Before -")
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

    it("Go to Shipment batch screen", async () => {
        await page.waitForSelector('.container-fluid > #bs-example-navbar-collapse-1 > .nav > .dropdown > .ng-binding')
        await page.click('.container-fluid > #bs-example-navbar-collapse-1 > .nav > .dropdown > .ng-binding')

        await page.waitForSelector('.dropdown > .dropdown-menu > .ng-scope:nth-child(7) > .ng-scope > .ng-scope')
        await page.click('.dropdown > .dropdown-menu > .ng-scope:nth-child(7) > .ng-scope > .ng-scope')

        await page.waitFor(500)
        await page.waitForSelector('.col-sm-3 > .searchandselect > .header > .caption > span')
        let headertxt = await page.$eval('.navbar-default > .container-fluid > .navbar-center > strong > .ng-scope', e => e.innerText);
        try {
            await expect(headertxt).toBe('Shipment Batch');
        } catch (err) {
            await page.screenshot({
                fullPage: true,
                path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_shipmentMenu.png`,
            });
        }

    }, timeout);

    it("Add shipment batch / Error Tracking Id already exist", async () => {

        await page.waitForSelector('.col-sm-3 > .searchandselect > .header > .caption > span')
        await page.click('.col-sm-3 > .searchandselect > .header > .caption > span')

        await page.waitForSelector('.dropdownone > .inner-item > .child:nth-child(2) > .width-per95 > .ng-binding')
        await page.click('.dropdownone > .inner-item > .child:nth-child(2) > .width-per95 > .ng-binding')

        let count = 0;
        let txtLocationID, txtTrackingID, txtAmountLoc

        for (i in shipmentData.shipment.invalid) {
            count++
            txtLocationID = '.scroll-content > .ng-isolate-scope:nth-child(' + count + ') > .col-width-100 > div > .ng-invalid-required'
            txtTrackingID = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .col-width-100:nth-child(2) > .form-control'
            txtAmountLoc = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .col-width-100:nth-child(3) > .form-control'
            txtLast = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .coin-entry:nth-child(10) > .form-control'

            await page.waitForSelector(txtLocationID)
            let txtId = await page.$(txtLocationID)
            await txtId.click({
                clickCount: 1
            })
            await txtId.type(shipmentData.shipment.invalid[count - 1].ID, {
                delay: 10
            });

            await page.waitForSelector(txtTrackingID)
            let txtTrackingId = await page.$(txtTrackingID)

            await txtTrackingId.click({
                clickCount: 1
            })

            await txtTrackingId.type(shipmentData.shipment.invalid[count - 1].trackingId, {
                delay: 10
            });

            await page.waitForSelector(txtAmountLoc)
            let txtAmountfieldLoc = await page.$(txtAmountLoc)
            await txtAmountfieldLoc.click({
                clickCount: 1
            })
            await txtAmountfieldLoc.type(shipmentData.shipment.invalid[count - 1].amount.toString(), {
                delay: 10
            });

            if (count != shipmentData.shipment.invalid.length) {

                await page.focus(txtLast);
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
            }
        }

        let btnRout = await page.$('.form-validate > .row > .col-sm-3 > .btn-group > .btn:nth-child(1)')
        await btnRout.click();
        dpRoute = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .col-width-100:nth-child(12) > .form-control'
        await page.waitForSelector(dpRoute)
        await page.waitFor(1500)
        count = 0;
        Flaghold = 0
        for (i in shipmentData.shipment.invalid) {
            count++
            dpRoute = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .col-width-100:nth-child(12) > .form-control'
            await page.waitForSelector(dpRoute)
            await page.select(dpRoute, 'string:' + shipmentData.shipment.invalid[count - 1].Route)
            if (shipmentData.shipment.invalid[count - 1].Route == "HOLD") {
                Flaghold = 1;
            }
        }

        let btnCommit1 = await page.$('.form-validate > .row > .col-sm-3 > .btn-group > .btn:nth-child(2)')
        await btnCommit1.click();
        await page.waitFor(3000)

        if (Flaghold == 1) {
            //scan supervisor
            await supervisorScan(page, shipmentData.Supervisor.ID, shipmentData.Supervisor.password);

        }


        btnerror = '.modal > .modal-dialog > .modal-content > .bg-danger > #modal-title'
        if (await page.waitForSelector(btnerror) !== null) {

            await page.waitForSelector(".modal-open > .modal > .modal-md > .modal-content > #modal-body");
            let lblshiperror = await page.$eval(".modal-open > .modal > .modal-md > .modal-content > #modal-body", e => e.innerText);
            try {
                console.log(lblshiperror);
                await expect(lblshiperror).toBe('Shipment Tracking ID Must Be Unique');
            } catch (err) {
                await page.screenshot({
                    fullPage: true,
                    path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_shipment_already_available.png`,
                });
            }

            await page.waitForSelector(btnerror)
            await page.click(btnerror)

            await page.waitForSelector('.modal > .modal-dialog > .modal-content > .modal-footer > .btn')
            await page.click('.modal > .modal-dialog > .modal-content > .modal-footer > .btn')
        } else {
            let btnCommit = await page.$('.form-validate > .row > .col-sm-3 > .btn-group > .btn:nth-child(2)')
            await btnCommit.click();
        }

        await page.waitFor(2000)

    }, timeout)

    it("Add shipment batch / Valid Shipment", async () => {

        //Reset shipment data
        let VbtnReset = "";
        if (await page.waitForSelector('.form-validate > .row > .col-sm-3 > .btn-group > .btn:nth-child(3)', {
            visible: true
        })) {
            VbtnReset = '.form-validate > .row > .col-sm-3 > .btn-group > .btn:nth-child(3)'
        } else {
            VbtnReset = '.form-validate > .row > .col-sm-3 > .btn-group > .btn:nth-child(4)'
        }

        await page.waitForSelector(VbtnReset)
        await page.click(VbtnReset, {
            clickCount: 3
        })
        await page.waitFor(1000)
        let VbtnModalError = '.modal > .modal-dialog > .modal-content > .modal-footer > .btn-danger'
        try {
            await page.waitForSelector(VbtnModalError)
            await page.click(VbtnModalError)
        } catch (e) {
            await page.screenshot({
                fullPage: true,
                path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_shipmentBatch.png`,
            });
        }
        await page.waitFor(1000)

        //Select FROM location,
        await page.waitForSelector('.form-validate > .row > .col-sm-3 > .searchandselect > .selected-text-width')
        await page.click('.form-validate > .row > .col-sm-3 > .searchandselect > .selected-text-width')
        await page.waitFor(1000)
        await page.waitForSelector('.col-sm-3 > .searchandselect > .header > .caption > span')
        await page.click('.col-sm-3 > .searchandselect > .header > .caption > span')
        await page.waitFor(1000)
        await page.waitForSelector('.dropdownone > .inner-item > .child:nth-child(2) > .width-per95 > .ng-binding')
        await page.click('.dropdownone > .inner-item > .child:nth-child(2) > .width-per95 > .ng-binding')

        let count = 0;
        let txtLocationID, txtTrackingID, txtAmountLoc

        for (i in shipmentData.shipment.valid) {
            count++
            txtLocationID = '.scroll-content > .ng-isolate-scope:nth-child(' + count + ') > .col-width-100 > div > .ng-invalid-required'
            txtTrackingID = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .col-width-100:nth-child(2) > .form-control'
            txtAmountLoc = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .col-width-100:nth-child(3) > .form-control'
            txtLast = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .coin-entry:nth-child(10) > .form-control'

            await page.waitForSelector(txtLocationID)
            let txtId = await page.$(txtLocationID)
            await txtId.click({
                clickCount: 1
            })
            await txtId.type(shipmentData.shipment.valid[count - 1].ID, {
                delay: 10
            });

            await page.waitForSelector(txtTrackingID)
            let txtTrackingId = await page.$(txtTrackingID)

            await txtTrackingId.click({
                clickCount: 1
            })

            await txtTrackingId.type(shipmentData.shipment.valid[count - 1].trackingId, {
                delay: 10
            });

            await page.waitForSelector(txtAmountLoc)
            let txtAmountfieldLoc = await page.$(txtAmountLoc)
            await txtAmountfieldLoc.click({
                clickCount: 1
            })
            await txtAmountfieldLoc.type(shipmentData.shipment.valid[count - 1].amount.toString(), {
                delay: 10
            });

            if (count != shipmentData.shipment.valid.length) {

                await page.focus(txtLast);
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');

            }
        }

        let btnRout = await page.$('.form-validate > .row > .col-sm-3 > .btn-group > .btn:nth-child(1)')
        await btnRout.click();
        dpRoute = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .col-width-100:nth-child(12) > .form-control'
        await page.waitForSelector(dpRoute)
        await page.waitFor(1500)
        count = 0;
        Flaghold = 0
        for (i in shipmentData.shipment.valid) {
            count++
            dpRoute = '.table > .scroll-content > .shipment-record:nth-child(' + count + ') > .col-width-100:nth-child(12) > .form-control'
            await page.waitForSelector(dpRoute)
            await page.select(dpRoute, 'string:' + shipmentData.shipment.valid[count - 1].Route)
            if (shipmentData.shipment.valid[count - 1].Route == "HOLD") {
                Flaghold = 1;
            }
        }

        let btnCommit1 = await page.$('.form-validate > .row > .col-sm-3 > .btn-group > .btn:nth-child(2)')
        await btnCommit1.click();
        await page.waitFor(1000)
        if (Flaghold == 1) {
            //scan supervisor
            await supervisorScan(page, shipmentData.Supervisor.ID, shipmentData.Supervisor.password);
        }

        //Click Success > OK button
        try {
            await page.waitForSelector('.modal-sm > .modal-content > .ng-pristine > .modal-footer > .ng-binding')
            await page.waitFor(1000)
            await page.click('.modal-sm > .modal-content > .ng-pristine > .modal-footer > .ng-binding')
            await expect(await page.$evl('.modal-sm > .modal-content > .ng-pristine > .modal-footer > .ng-binding')).not(null);
        } catch (err) {
            await page.screenshot({
                fullPage: true,
                path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_shipmentBatch_2.png`,
            });
        }

    }, timeout)


}, timeout);
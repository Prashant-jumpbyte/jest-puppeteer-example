const path = require('path');

async function Login(page, emailId, password) {
    await page.waitForSelector("input[name=email]");
    let emailtxt = await page.$("input[name=email]");
    await emailtxt.click({
        clickCount: 3
    })
    await emailtxt.type(emailId, {
        delay: 10
    });

    let passwordtxt = await page.$("input[name=password]");
    await passwordtxt.click({
        clickCount: 3
    })

    await passwordtxt.type(password, {
        delay: 10
    });

    let submitbtn = await page.$("button[type='submit']");

    await submitbtn.click();
    page.waitForNavigation({
        waitUntil: 'networkidle0'
    });
    await page.waitFor(1000);
    const url = await page.evaluate(() => location.href);

    try {
        console.log(url);
        await expect(url).toEqual("https://ranger.coordinate.work/app/home");
    } catch (err) {
        await page.screenshot({
            fullPage: true,
            path: `${path.resolve(__dirname, '..', '..', 'results')}/${new Date().toISOString()}_Login.png`,
        });
    }
}
module.exports = { Login }
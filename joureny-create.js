const puppeteer = require('puppeteer-core');

require('dotenv').config();
const chromePath = process.env.CHROME_PATH;
const CDPUrl = process.env.CDP_URL;
const CDPUser = process.env.CDP_USER;
const CDPPassword = process.env.CDP_PASSWORD;

(async () => {
    let journeyName = (Math.random() + 1).toString(36).substring(7);

    const browser = await openBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(8000);
    await page.goto(CDPUrl + '/login/');
    await login();
    await goToJourneyList();
    await createJourney();
    await drawJourney();

    await delay(30000);
    await logout()

    async function testStartPointGoRight() {
        let startX = 90;
        let startY = 200;
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(
            startX + 200,
            startY,
        );
        await page.mouse.up();

        await delay(500);
        await page.mouse.click(
            startX + 200,
            startY,
        );
    }

    async function drawJourney() {
        await delay(2000);
        const xpath = '//div[contains(., "結束") and contains(@class, "tw-my-2") and not(contains(., "時間等待"))]//div[@draggable="true" and contains(@class, "el-popover__reference")]';
        const elements = await page.$x(xpath);
        const endNode = elements[0];
        await endNode.scrollIntoView();
        await delay(500);
        await testStartPointGoRight();
    }

    async function createJourney() {
        // wait for vue
        await delay(2000);
        await clickJourneyCreateButton();
        await typeJourneyName();
        await setJourneyStartDate();
        await clickCreatJourneySubmitButton();
    }

    async function setJourneyStartDate() {
        const xpath = '//label[contains(., "旅程時間起")]/following-sibling::div';
        await page.waitForXPath(xpath);
        const elements = await page.$x(xpath);
        await elements[0].click();

        await delay(500);
        const selector = 'td.today.available';
        await page.waitForSelector(selector);
        await page.click(selector);
    }

    async function clickCreatJourneySubmitButton() {
        const xpath = '//div[@role="dialog"]//button[contains(., "確定")]';
        await page.waitForXPath(xpath);
        const elements = await page.$x(xpath);
        await elements[0].click();
    }

    async function typeJourneyName() {
        const xpath = '//label[contains(., "旅程名稱")]/following-sibling::div/input';
        await page.waitForXPath(xpath);
        const elements = await page.$x(xpath);
        await elements[0].type(journeyName);
    }

    async function clickJourneyCreateButton() {
        await delay(500)
        const xpath = '//button[contains(., "新增旅程")]';
        await page.waitForXPath(xpath);
        const elements = await page.$x(xpath);
        await elements[0].click();
    }

    async function goToJourneyList() {
        await clickMainMenu();
        await clickJourneySubMenu();
    }

    async function clickJourneySubMenu() {
        const xpath = '//div[contains(text(), "自動化行銷旅程")]';
        await page.waitForXPath(xpath);
        const elements = await page.$x(xpath);
        await elements[0].click();
    }

    async function clickLogoutButton() {
        await delay(1000);
        const logoutButtonSelector = 'ul.el-dropdown-menu li:nth-child(3)';
        await page.waitForSelector(logoutButtonSelector);
        await page.click(logoutButtonSelector);
    }

    // delayTime 是怕 vue 沒有 render 出來, 如果不需要 delay 的地方, 可以把 delayTime 設為 0
    async function clickUserMenu(delayTime = 5000) {
        await delay(delayTime);
        const userMenuSelector = '#app > main > div > header > div:nth-child(2) > div.tw-p-2.el-dropdown > span > div';
        await page.waitForSelector(userMenuSelector);
        await page.click(userMenuSelector);
    }

    function delay(time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time)
        });
    }

    async function clickMainMenu() {
        const mainMenuSelector = '#app > main > div > div.tw-flex > div > div > ul > li:nth-child(4) > div > div';
        await page.waitForSelector(mainMenuSelector);
        await page.click(mainMenuSelector);
    }

    async function enterAccount() {
        const userInputSelector = '#username';
        const passwordInputSelector = '#password';
        await page.waitForSelector(userInputSelector);
        await page.type(userInputSelector, CDPUser);
        await page.waitForSelector(passwordInputSelector);
        await page.type(passwordInputSelector, CDPPassword);
    }

    async function clickLoginButton() {
        const loginButtonSelector = 'button[type="submit"]';
        await page.waitForSelector(loginButtonSelector);
        await page.click(loginButtonSelector);
    }

    async function login() {
        await enterAccount();
        await clickLoginButton();
    }

    async function logout() {
        await clickUserMenu();
        await clickLogoutButton();
    }

    async function alert(alertPage) {
        await alertPage.evaluate(() => {
            alert('alert');
        });
    }

    async function openBrowser() {
        return puppeteer.launch({
            timeout: 2000,
            executablePath:
            chromePath,
            headless: false,
            defaultViewport: {
                width: 1618,
                height: 787
            },
            args: [
                '--start-maximized'
            ]
        });
    }
})();
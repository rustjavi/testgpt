const { config } = require('dotenv');
const fs = require('fs');
const os = require('os');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { Options } = require('selenium-webdriver/chrome');
const { NoSuchElementError, TimeoutError } = require('selenium-webdriver/lib/error');
const { sleep } = require('sleep');
const { randomBytes } = require('crypto');
const warnings = require('process');

class GoogleBardAutoLogin {
    constructor(googleAccount, googlePassword, chromeVersion) {
        console.log('Initializing auto login for Google Bard ...');
        this.googleAccount = googleAccount;
        this.googlePassword = googlePassword;
        this.chromeVersion = chromeVersion;
        warnings.emitWarning = () => {}; // Ignore deprecation and resource warnings

        let options = new Options();
        options.addArguments('--headless'); // comment this if you want to see the chrome window
        this.driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

        const googleBardUrl = 'https://bard.google.com/';
        console.log(`Visiting ${googleBardUrl} ...`);
        this.driver.get(googleBardUrl);
        this.driver.manage().window().maximize();
    }

    async findSignInButton() {
        console.log('Finding sign-in button ...');
        let spans = await this.driver.findElements(By.tagName('span'));
        for (let span of spans) {
            let text = await span.getText();
            if (text.trim() === 'Sign in') {
                return span;
            }
        }
        throw new NoSuchElementError('No element has inner text value - "Sign in"');
    }

    async findAccountInput() {
        await (await this.findSignInButton()).click();
        console.log('Clicking sign-in button ...');
        console.log('Finding account input ...');
        return this.driver.findElement(By.name('identifier'));
    }

    async findPasswordInput() {
        try {
            await (await this.findAccountInput()).sendKeys(this.googleAccount, Key.RETURN);
            console.log('Entering account ...');
            await this.driver.wait(until.elementLocated(By.name('Passwd')), 15000);
            console.log('Finding password input ...');
            return this.driver.findElement(By.name('Passwd'));
        } catch (error) {
            if (error instanceof TimeoutError) {
                console.log('Login timeout for network connection. Please try again.');
                return null;
            }
            throw error;
        }
    }

    async getCookieList() {
        try {
            let passwordInput = await this.findPasswordInput();
            if (passwordInput !== null) {
                console.log('Entering password ...');
                await passwordInput.sendKeys(this.googlePassword, Key.RETURN);
                await this.driver.wait(until.elementLocated(By.className('mdc-button__label')), 15000);
                console.log('Finding application cookies ...');
                return this.driver.manage().getCookies();
            } else {
                return null;
            }
        } catch (error) {
            if (error instanceof TimeoutError) {
                console.log('Login timeout for network connection. Please try again.');
                return null;
            }
            throw error;
        }
    }

    async getCookie() {
        let cookieList = await this.getCookieList();
        if (cookieList !== null) {
            console.log('Finding "__Secure-1PSID" cookie ...');
            for (let cookie of cookieList) {
                if (cookie.name === '__Secure-1PSID') {
                    return cookie.value;
                }
            }
            throw new NoSuchElementError('No element has "__Secure-1PSID" value on its "name" key.');
        } else {
            return null;
        }
    }
}

class MicrosoftBingAutoLogin {
    constructor(bingAccount, bingPassword, chromeVersion) {
        console.log('Initializing auto login for Microsoft Bing ...');
        this.bingAccount = bingAccount;
        this.bingPassword = bingPassword;
        this.chromeVersion = chromeVersion;
        warnings.emitWarning = () => {}; // Ignore deprecation and resource warnings

        let options = new Options();
        options.addArguments('--headless'); // comment this if you want to see the chrome window
        this.driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

        console.log('Generating random sig and CSRFToken for requested url ...');
        const sig = randomBytes(16).toString('hex').toUpperCase();
        const CSRFToken = randomBytes(16).toString('hex').toUpperCase();

        console.log('Visiting Microsoft Bing login page ...');
        this.driver.get(`https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&id=264960&wreply=https%3a%2f%2fwww.bing.com%2fsecure%2fPassport.aspx%3fedge_suppress_profile_switch%3d1%26requrl%3dhttps%253a%252f%252fwww.bing.com%252fsearch%253ftoWww%253d1%2526redig%253d9220EACAFFCA40508E4E7BD52023921B%2526q%253dBing%252bAI%2526showconv%253d1%2526wlexpsignin%253d1%26sig%3d${sig}&wp=MBI_SSL&lc=1028&CSRFToken=${CSRFToken}&aadredir=1`);
        this.driver.manage().window().maximize();
    }

    async findAccountInput() {
        console.log('Finding account input ...');
        return this.driver.findElement(By.name('loginfmt'));
    }

    async findPasswordInput() {
        await (await this.findAccountInput()).sendKeys(this.bingAccount, Key.RETURN);
        console.log('Entering account ...');
        await this.driver.wait(until.elementLocated(By.name('passwd')), 15000);
        console.log('Finding password input ...');
        return this.driver.findElement(By.name('passwd'));
    }

    async getCookies() {
        await (await this.findPasswordInput()).sendKeys(this.bingPassword, Key.RETURN);
        console.log('Entering password ...');
        const bingChatUrl = 'https://bing.com/chat';
        console.log(`Visiting ${bingChatUrl} ...`);
        this.driver.get(bingChatUrl);
        await sleep(2);
        console.log('Finding application cookies ...');
        return this.driver.manage().getCookies();
    }

    async dumpCookies() {
        let cookies = await this.getCookies();
        const jsonFile = 'cookies.json';
        console.log(`Dump ${jsonFile} ...`);
        fs.writeFileSync(jsonFile, JSON.stringify(cookies, null, 2));
    }
}



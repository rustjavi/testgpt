const { GoogleBardAutoLogin, MicrosoftBingAutoLogin } = require('AutoLogin');
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const { sleep } = require('sleep');
const assert = require('assert');

const google_account = process.env.google_account;
const google_password = process.env.google_password;
const bing_account = process.env.bing_account;
const bing_password = process.env.bing_password;
const chrome_version = parseInt(process.env.chrome_version);

describe('GoogleBardTest', function() {
    it('test_find_sign_in_button', function() {
        console.log('\n==== Testing for find_sign_in_button() ====');
        const auto_login = new GoogleBardAutoLogin(google_account, google_password, chrome_version);
        const sign_in_button = auto_login.find_sign_in_button();
        assert.strictEqual(sign_in_button.tagName, 'span');
        assert.notStrictEqual(sign_in_button.getAttribute('class'), null);
        assert.strictEqual(sign_in_button.textContent.trim(), 'Sign in');
        //sleep(100);
        auto_login.driver.close();
    });

    it('test_find_account_input', function() {
        console.log('\n==== Testing for find_account_input() ====');
        const auto_login = new GoogleBardAutoLogin(google_account, google_password, chrome_version);
        const account_input = auto_login.find_account_input();
        assert.strictEqual(account_input.tagName, 'input');
        assert.strictEqual(account_input.getAttribute('type'), 'email');
        assert.notStrictEqual(account_input.getAttribute('class'), null);
        assert.strictEqual(account_input.getAttribute('aria-label'), 'Email or phone');
        assert.strictEqual(account_input.getAttribute('name'), 'identifier');
        //sleep(100);
        auto_login.driver.close();
    });

    it('test_find_password_input', function() {
        console.log('\n==== Testing for find_password_input() ====');
        const auto_login = new GoogleBardAutoLogin(google_account, google_password, chrome_version);
        const password_input = auto_login.find_password_input();
        if (password_input !== null) {
            assert.strictEqual(password_input.tagName, 'input');
            assert.strictEqual(password_input.getAttribute('type'), 'password');
            assert.notStrictEqual(password_input.getAttribute('class'), null);
            assert.strictEqual(password_input.getAttribute('aria-label'), 'Enter your password');
            assert.strictEqual(password_input.getAttribute('name'), 'Passwd');
        }
        //sleep(100);
        auto_login.driver.close();
    });

    it('test_get_cookie_list', function() {
        console.log('\n==== Testing for get_cookie_list() ====');
        const auto_login = new GoogleBardAutoLogin(google_account, google_password, chrome_version);
        const cookie_list = auto_login.get_cookie_list();
        if (cookie_list !== null) {
            assert(Array.isArray(cookie_list));
            let exist_name = false;
            for (const cookie_dict of cookie_list) {
                assert(typeof cookie_dict === 'object');
                assert('domain' in cookie_dict);
                assert(typeof cookie_dict['domain'] === 'string');
                assert.notStrictEqual(cookie_dict['domain'], '');
                assert('expiry' in cookie_dict);
                assert(typeof cookie_dict['expiry'] === 'number');
                assert(cookie_dict['expiry'] >= 0);
                assert('name' in cookie_dict);
                assert(typeof cookie_dict['name'] === 'string');
                assert.notStrictEqual(cookie_dict['name'], '');
                assert('value' in cookie_dict);
                assert(typeof cookie_dict['value'] === 'string');
                assert.notStrictEqual(cookie_dict['value'], '');
                if (cookie_dict['name'] === '__Secure-1PSID') {
                    exist_name = true;
                }
            }
            assert.strictEqual(exist_name, true);
        }
        //sleep(100);
        auto_login.driver.close();
    });

    it('test_get_cookie', function() {
        console.log('\n==== Testing for get_cookie() ====');
        const auto_login = new GoogleBardAutoLogin(google_account, google_password, chrome_version);
        const cookie = auto_login.get_cookie();
        if (cookie !== null) {
            assert(typeof cookie === 'string');
            assert.notStrictEqual(cookie, '');
        }
        //sleep(100);
        auto_login.driver.close();
    });
});

describe('MicrosoftBingAutoLoginTest', function() {
    it('test_find_account_input', function() {
        console.log('\n==== Testing for find_account_input() ====');
        const auto_login = new MicrosoftBingAutoLogin(bing_account, bing_password, chrome_version);
        const account_input = auto_login.find_account_input();
        assert.strictEqual(account_input.tagName, 'input');
        assert.strictEqual(account_input.getAttribute('type'), 'email');
        assert.strictEqual(account_input.getAttribute('name'), 'loginfmt');
        assert.notStrictEqual(account_input.getAttribute('id'), null);
        assert.notStrictEqual(account_input.getAttribute('class'), null);
        assert.notStrictEqual(account_input.getAttribute('aria-label'), null);
        assert.notStrictEqual(account_input.getAttribute('placeholder'), null);
        //sleep(100);
        auto_login.driver.close();
    });

    it('test_find_password_input', function() {
        console.log('\n==== Testing for find_password_input() ====');
        const auto_login = new MicrosoftBingAutoLogin(bing_account, bing_password, chrome_version);
        const password_input = auto_login.find_password_input();
        assert.strictEqual(password_input.tagName, 'input');
        assert.strictEqual(password_input.getAttribute('name'), 'passwd');
        assert.notStrictEqual(password_input.getAttribute('id'), null);
        assert.notStrictEqual(password_input.getAttribute('class'), null);
        assert.notStrictEqual(password_input.getAttribute('placeholder'), null);
        assert.notStrictEqual(password_input.getAttribute('aria-label'), null);
        //sleep(100);
        auto_login.driver.close();
    });

    it('test_get_cookies', function() {
        console.log('\n==== Testing for test_get_cookies() ====');
        const auto_login = new MicrosoftBingAutoLogin(bing_account, bing_password, chrome_version);
        const cookies = auto_login.get_cookies();
        assert(Array.isArray(cookies));
        for (const cookie_dict of cookies) {
            assert(typeof cookie_dict === 'object');
            assert('domain' in cookie_dict);
            assert(typeof cookie_dict['domain'] === 'string');
            assert.notStrictEqual(cookie_dict['domain'], '');
            assert('name' in cookie_dict);
            assert(typeof cookie_dict['name'] === 'string');
            assert.notStrictEqual(cookie_dict['name'], '');
            assert('value' in cookie_dict);
            assert(typeof cookie_dict['value'] === 'string');
            assert.notStrictEqual(cookie_dict['value'], '');
        }
        //sleep(100);
        auto_login.driver.close();
    });

    it('test_dump_cookies', function() {
        console.log('\n==== Testing for test_dump_cookies() ====');
        const auto_login = new MicrosoftBingAutoLogin(bing_account, bing_password, chrome_version);
        auto_login.dump_cookies();
        assert.strictEqual(fs.existsSync('cookies.json'), true);
        //sleep(100);
        auto_login.driver.close();
    });
});



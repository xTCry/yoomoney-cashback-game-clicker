import puppeteer from 'puppeteer';
import { questionAsync } from '../../utils/other.utils';
import * as sniffDetector from '../../utils/detect-sniff.utils';
import { createLogger } from '../../logger';

const SPIN_DRUM_TEXT = 'Крутить барабан';
const IN_CASHBACK_AND_PROMO_TEXT = 'В «Кэшбэк и акции»';

export async function startauthOrSkip(page: puppeteer.Page, login: string, password: string) {
    const logger = createLogger('Yoomoney Auth');

    // await page.setViewport({ width: 960, height: 800 });
    await sniffDetector.inject(page);

    await page.goto('https://yoomoney.ru');

    const AUTH_LINK_SELECTOR = '[href*="/yooid/login"]';
    const PREPAID_LINK_SELECTOR = '[href*="/prepaid"]';

    const authLinkElem = await page.$(AUTH_LINK_SELECTOR);
    if (authLinkElem === null) {
        if ((await page.$(PREPAID_LINK_SELECTOR)) !== null) {
            logger.info('Already auth');
            return true;
        }
        logger.info('FTW');
        return false;
    }

    logger.info('Try auth');
    await authLinkElem.click({ delay: 90 });
    await page.waitForNavigation();

    // Auth
    await page.waitForSelector('.qa-auth-login-page');
    await page.type('form input[name="login"]', login, { delay: 30 });

    logger.debug('Click Next');
    await page.click('form button[type="submit"]');
    await page.waitForNavigation();

    await page.waitForSelector('.qa-auth-password-page');
    await page.type('form input[name="password"]', password, { delay: 50 });

    await page.click('form button[type="submit"]');
    await page.waitForNavigation();

    try {
        const confirmationPageElem = await page.$('.qa-auth-confirmation-page');
        if (confirmationPageElem !== null) {
            const code = await questionAsync('Enter SMS code: ');
            await page.type('.qa-auth-confirmation-page input[type="tel"]', code, { delay: 50 });

            logger.debug('Waiting auth...');
            await page.waitForNavigation();
        }
    } catch (err) {}

    // TODO: safe checking success auth

    // const TOKEN_INPUT = 'input#token';
    // let inputElem = await page.$(TOKEN_INPUT);
    // let token = await page.evaluate((x) => x.value, inputElem);

    const isSniffDetected = await sniffDetector.check(page);
    logger.info({ message: 'Done', isSniffDetected });

    return true;
}

export async function prepareClicker(page: puppeteer.Page) {
    const logger = createLogger('Clicker Prepare');
    const SPIN_DRUM_BTN_SELECTOR = '#root > div > section > div > a';
    const HOW_MUCH_BTN_SELECTOR = '#root > div > section > div > div > a';

    await page.goto('https://yoomoney.ru/cashback-game');

    let spinDrumBtnText = await page.evaluate(
        (selector) => document.querySelector<HTMLElement>(selector).innerText,
        SPIN_DRUM_BTN_SELECTOR
    );
    if (spinDrumBtnText !== SPIN_DRUM_TEXT) {
        // else IN_CASHBACK_AND_PROMO_TEXT;
        return false;
    }

    // Don't worked
    // /* await page.click(WHEEL_BTN_SELECTOR); */

    logger.info('CLICK > "Крутить барабан"');
    await page.waitForSelector(SPIN_DRUM_BTN_SELECTOR, { timeout: 5e3 });
    await page.waitForTimeout(500);
    await page.$eval(SPIN_DRUM_BTN_SELECTOR, (elem: any) => elem.click());

    await page.waitForTimeout(4e3);

    logger.info('CLICK > "Сколько это в баллах?"');
    await page.waitForSelector(HOW_MUCH_BTN_SELECTOR, { timeout: 10e3 });
    await page.waitForTimeout(500);
    await page.$eval(HOW_MUCH_BTN_SELECTOR, (elem: any) => elem.click());
    await page.waitForTimeout(2e3);

    await page?.screenshot({ path: `screenshots/screen.${(Date.now() / 1e3) | 0}.prepare.png` });

    logger.info('CLICK > "Следующий платеж"');
    await page.waitForSelector(SPIN_DRUM_BTN_SELECTOR, { timeout: 5e3 });
    await page.waitForTimeout(500);
    await page.$eval(SPIN_DRUM_BTN_SELECTOR, (elem: any) => elem.click());
    await page.waitForTimeout(1e3);

    // Next Run loop...

    spinDrumBtnText = await page.evaluate(
        (selector) => document.querySelector<HTMLElement>(selector).innerText,
        SPIN_DRUM_BTN_SELECTOR
    );

    return spinDrumBtnText === SPIN_DRUM_TEXT; // else IN_CASHBACK_AND_PROMO_TEXT;
}

export async function runClicker(page: puppeteer.Page) {
    const logger = createLogger('Clicker Run');
    const SPIN_DRUM_BTN_SELECTOR = '#root > div > section > div > a';
    const HOW_MUCH_BTN_SELECTOR = '#root > div > section > div > div > a';

    let soGood = true;
    do {
        try {
            logger.info('CLICK > "Крутить барабан"');
            await page.waitForSelector(SPIN_DRUM_BTN_SELECTOR, { timeout: 5e3 });
            await page.waitForTimeout(500);
            await page.$eval(SPIN_DRUM_BTN_SELECTOR, (elem: any) => elem.click());
            await page.waitForTimeout(4e3);

            logger.info('CLICK > "Сколько это в баллах?"');
            await page.waitForSelector(HOW_MUCH_BTN_SELECTOR, { timeout: 10e3 });
            await page.waitForTimeout(500);
            await page.$eval(HOW_MUCH_BTN_SELECTOR, (elem: any) => elem.click());
            await page.waitForTimeout(2e3);

            await page?.screenshot({ path: `screenshots/screen.${(Date.now() / 1e3) | 0}.run.png` });

            logger.info('CLICK > "Следующий платеж"');
            await page.waitForSelector(SPIN_DRUM_BTN_SELECTOR, { timeout: 5e3 });
            await page.waitForTimeout(500);
            await page.$eval(SPIN_DRUM_BTN_SELECTOR, (elem: any) => elem.click());
            await page.waitForTimeout(1e3);

            // await questionAsync('Press [Enter] to Next Clicker stage...');

            const spinDrumBtnText = await page.evaluate(
                (selector) => document.querySelector<HTMLElement>(selector).innerText,
                SPIN_DRUM_BTN_SELECTOR
            );
            soGood = spinDrumBtnText === SPIN_DRUM_TEXT; // else IN_CASHBACK_AND_PROMO_TEXT;
            logger.debug(`soGood: ${soGood}`);
        } catch (err) {
            soGood = false;
            console.error(err);
        }
    } while (soGood);
}

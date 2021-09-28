import puppeteer from 'puppeteer';
import { questionAsync } from '../utils/other.utils';
import * as methods from '../methods/puppeteer';
import { config } from '../config';
import { logger } from '../logger';

const STEP_ASK = !true;

export async function main() {
    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false,
    });

    let pageYoomoney: puppeteer.Page = await browser.newPage();

    const pages = await browser.pages();
    // Close the new tab that chromium always opens first.
    await pages[0].close();

    try {
        // TODO: try set saved cookies

        STEP_ASK && (await questionAsync('Press [Enter] to START...'));

        try {
            await pageYoomoney.bringToFront();

            const { login, password, cookies } = config.get('yoomoney');
            await pageYoomoney.goto('https://yoomoney.ru');

            if (cookies && Object.keys(cookies).length > 0) {
                await pageYoomoney.setCookie({ name: 'SessionToken', value: cookies.SessionToken });
            }

            STEP_ASK && (await questionAsync('Press [Enter] to try Start Check/Auth...'));
            await methods.yoomoney.startauthOrSkip(pageYoomoney, login, password);

            STEP_ASK && (await questionAsync('Press [Enter] to Prepare Clicker...'));
            const drumFull = await methods.yoomoney.prepareClicker(pageYoomoney);

            if (drumFull) {
                STEP_ASK && (await questionAsync('Press [Enter] to Run Clicker...'));
                await methods.yoomoney.runClicker(pageYoomoney);
            } else {
                logger.warn('Drum is empty');
            }
        } catch (err) {
            console.error(err);
        }

        await pageYoomoney?.screenshot({ path: 'screenshots/screen.png', fullPage: true });

        return true;
    } catch (e) {
        console.error(e);
    } finally {
        await questionAsync('Press [Enter] to exit...');
        await browser.close();
    }
    return false;
}

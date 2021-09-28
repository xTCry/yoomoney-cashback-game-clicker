import puppeteer from 'puppeteer';

function sniffDetector() {
    const { userAgent, platform } = window.navigator;
    const navigator = window.navigator as any;

    const incrementator = (f) => {
        navigator.__sniffedBy = navigator.__sniffedBy || {};
        navigator.__sniffedBy[f] = navigator.__sniffedBy[f] ? navigator.__sniffedBy[f] + 1 : 1;
    };

    navigator.__defineGetter__('userAgent', function () {
        incrementator('userAgent');
        return userAgent;
    });

    navigator.__defineGetter__('platform', function () {
        incrementator('platform');
        return platform;
    });
}

export const inject = (page: puppeteer.Page) => page.evaluateOnNewDocument(sniffDetector);

export const check = (page: puppeteer.Page): Promise<Record<string, number>> =>
    page.evaluate(() => (navigator as any).__sniffedBy);

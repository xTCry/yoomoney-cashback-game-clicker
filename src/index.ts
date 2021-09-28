// import * as app from './app/selenium.app';
import * as app from './app/puppeteer.app';
import { logger } from './logger';

logger.info('App started');

app.main()
    .then((e) => logger.info('[Main] Result: ' + e))
    .catch((e) => console.error(e));

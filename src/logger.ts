import winston from 'winston';
import { nestLikeConsoleFormat } from './utils/winston.utils';

const options = {
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            format: winston.format.combine(winston.format.ms(), winston.format.timestamp(), nestLikeConsoleFormat()),
        }),
    ],
};

type MessageMeta = ({ message: string } & { [P in keyof any]: any }) | string;

export class WinstonLogger {
    constructor(private readonly logger: winston.Logger, private context?: string) {}

    public setContext(context: string) {
        this.context = context;
    }

    public info(message: MessageMeta, context?: string) {
        context = context || this.context;

        if ('object' === typeof message) {
            const { message: msg, ...meta } = message;
            return this.logger.info(msg, { context, ...meta });
        }

        return this.logger.info(message, { context });
    }

    public error(message: MessageMeta, trace?: string, context?: string) {
        context = context || this.context;

        if (message instanceof Error) {
            const { message: msg, name, stack, ...meta } = message;
            return this.logger.error(msg, { context, stack: [trace || message.stack], ...meta });
        }

        if ('object' === typeof message) {
            const { message: msg, ...meta } = message;
            return this.logger.error(msg, { context, stack: [trace], ...meta });
        }

        return this.logger.error(message, { context, stack: [trace] });
    }

    public warn(message: MessageMeta, context?: string) {
        context = context || this.context;

        if ('object' === typeof message) {
            const { message: msg, ...meta } = message;
            return this.logger.warn(msg, { context, ...meta });
        }

        return this.logger.warn(message, { context });
    }

    public debug?(message: MessageMeta, context?: string) {
        context = context || this.context;

        if ('object' === typeof message) {
            const { message: msg, ...meta } = message;
            return this.logger.debug(msg, { context, ...meta });
        }

        return this.logger.debug(message, { context });
    }

    public verbose?(message: MessageMeta, context?: string) {
        context = context || this.context;

        if ('object' === typeof message) {
            const { message: msg, ...meta } = message;
            return this.logger.verbose(msg, { context, ...meta });
        }

        return this.logger.verbose(message, { context });
    }
}

export const logger = new WinstonLogger(winston.createLogger(options));

export const createLogger = (context?: string) => new WinstonLogger(winston.createLogger(options), context);

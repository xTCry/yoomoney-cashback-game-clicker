import { Format } from 'logform';
import clc from 'cli-color';
import { format } from 'winston';
import safeStringify from 'fast-safe-stringify';

const nestLikeColorScheme: Record<string, clc.bare.Format> = {
  info: clc.greenBright,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

const getTimestamp = (timestamp = Date.now()): string => {
  const localeStringOptions = {
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: '2-digit',
    month: '2-digit',
  };
  return new Date(timestamp).toLocaleString(undefined, localeStringOptions as Intl.DateTimeFormatOptions);
};

export const nestLikeConsoleFormat = (appName = 'XTAPP'): Format =>
  format.printf(({ context, level, timestamp, message, ms, ...meta }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const color = nestLikeColorScheme[level] || ((text: string): string => text);

    const pidMessage = color(`[${appName}] ${process.pid}  - `);
    const contextMessage = context ? clc.yellow(`[${context}] `) : '';
    const timestampDiff = ms ? ` ${clc.yellow(ms)}` : '';
    const formattedLogLevel = color(level.toUpperCase().padStart(7, ' '));
    let metaStr =
      meta && Object.values(meta).length > 0 ? ` ${clc.yellow('Meta Object:')}\n${safeStringify(meta)}` : '';

    if (level === 'error' && Array.isArray(meta.stack)) {
      metaStr = `\n${meta.stack.join('\n')}`;
    }

    const computedMessage = `${pidMessage}${getTimestamp(timestamp)} ${formattedLogLevel} ${contextMessage}${color(
      message,
    )}${metaStr}${timestampDiff}`;

    return computedMessage;
  });

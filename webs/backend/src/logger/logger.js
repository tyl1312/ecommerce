import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, align } = format;

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS A',
        }),
        align(),
        printf( info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
    ),
    transports: [
        new transports.Console(),
        // new transports.File({ dirname: 'logs', filename: 'error.log', level: 'error' }),
        // new transports.File({ dirname: 'logs', filename: 'combined.log' })
    ],
});

export default logger;
const os = require('os');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

const LEVEL_COLORS = {
    debug: '\x1b[40;1m',
    info: '\x1b[34;1m',
    warn: '\x1b[33;1m',
    error: '\x1b[31m',
    crit: '\x1b[41m'
};

const customFormat = printf(({ level, message, label, timestamp }) => {
    const color = LEVEL_COLORS[level] || LEVEL_COLORS.debug;
    return `\x1b[30;1m${timestamp}\x1b[0m ${color}${level.toUpperCase()}\x1b[0m \x1b[35m${label}\x1b[0m -> ${message}`;
});

function setupLogger(moduleName) {
    const library = moduleName.split('.js')[0];
    const logger = createLogger({
        level: 'info',
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            customFormat
        ),
        defaultMeta: { service: library },
        transports: [
            new transports.Console({
                format: combine(
                    colorize(),
                    customFormat
                )
            })
        ]
    });

    if (process.env.LOGGING === 'True') {
        const grandparentDir = path.resolve(__dirname, '../../');
        const logName = 'chatgpt_discord_bot.log';
        const logPath = path.join(grandparentDir, logName);

        logger.add(new transports.File({
            filename: logPath,
            maxsize: 32 * 1024 * 1024, // 32 MiB
            maxFiles: 2,
            format: customFormat
        }));
    }

    return logger;
}

const logger = setupLogger(__filename);



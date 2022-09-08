const PINO_LOG_LEVEL = process.env.PINO_LOG_LEVEL;

const prettyPrintConfig = {
  colorize: true,
  crlf: true,
  // no space after comma
  ignore: 'pid',
  // human-readable time, set to false for UNIX timestamp
  translateTime: true,
};

export const pinoConfig = {
  name: 'be-server',
  level: PINO_LOG_LEVEL as string,
  prettyPrint: process.env.NODE_ENV !== 'production' ? prettyPrintConfig : false,
  autoLogging: {
    ignorePaths: ['/health-check'],
  },
};

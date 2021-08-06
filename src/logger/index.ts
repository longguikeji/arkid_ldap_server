import { Logger, transports } from 'winston'

const logger = new Logger({
  transports: [
    new (transports.Console)({
      timestamp: true,
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
})

export default logger

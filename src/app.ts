import pino from 'pino'
import { pipeline, Writable } from 'stream'

import config from './config'
import Source from './source'
import Validator from './validator'
import Decoder from './decoder'
import Thingsboard from './thingsboard'

const logger = pino({
  level:
    process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV !== 'production'
      ? 'debug'
      : 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined,
})

pipeline(
  new Source(config.mqtt.source, logger),
  new Validator(logger),
  new Decoder(logger),
  new Thingsboard(logger),
  new Writable({
    objectMode: true,
    write: (msg, _, callback) => {
      console.log(msg)
      callback()
    },
  }),
  error => {
    if (error) {
      logger.error(`Error in pipeline: ${error.message}`)
    }
  },
)

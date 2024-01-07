import Joi from 'joi'
import { Transform } from 'stream'
import { Logger } from 'pino'

import { ValidatedMsg } from './types'

const schemaIncomingMsg = Joi.object({
  devEui: Joi.string().hex().length(16).required(),
  sensorType: Joi.string().required(),
  messageType: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  payload: Joi.string().hex().required(),
  fCntUp: Joi.number().required(),
  freq: Joi.number().required(),
  batteryLevel: Joi.any().optional(),
  ack: Joi.boolean().required(),
  spreadingFactor: Joi.string().required(),
  dr: Joi.number().required(),
  rssi: Joi.number().required(),
  snr: Joi.number().required(),
  gatewayIdentifier: Joi.any().optional(),
  fPort: Joi.number().required(),
  toa: Joi.any().optional(),
  tags: Joi.object()
    .pattern(Joi.string(), Joi.array().items(Joi.string()))
    .required(),
  gateways: Joi.array()
    .items(
      Joi.object({
        rssi: Joi.number().required(),
        snr: Joi.number().required(),
        gatewayIdentifier: Joi.any().optional(),
        gwEui: Joi.string().required(),
        mac: Joi.any().optional(),
        antenna: Joi.number().required(),
      }),
    )
    .required(),
})

const schemaIncomingMsgs = Joi.array().items(schemaIncomingMsg)

export default class Validator extends Transform {
  private readonly logger: Logger

  constructor(logger: Logger) {
    super({ objectMode: true })
    this.logger = logger.child({ class: 'Validator' })
  }

  _transform(msgs: any, encoding: string, callback: Function): void {
    this.logger.debug(`Validating ${msgs.length} messages`)

    const { error, value } = schemaIncomingMsgs.validate(msgs)

    this.logger.debug(`Validation result: ${error ? 'invalid' : 'valid'}`)

    if (error) {
      this.emit('error', error)
      return
    }

    for (const msg of value) {
      this.push({
        devEui: msg.devEui,
        sensorType: msg.sensorType,
        messageType: msg.messageType,
        timestamp: msg.timestamp,
        payload: msg.payload,
        fCntUp: msg.fCntUp,
        rssi: msg.rssi,
        snr: msg.snr,
        tags: msg.tags,
      } as ValidatedMsg)
    }

    callback()
  }
}

/*
Example incoming message:
[
  {
    "devEui":"6081f973219bd6df",
    "sensorType":"other",
    "messageType":"payload",
    "timestamp":"2024-01-07T11:50:32.161Z",
    "payload":"06004402014c0500016cf28807fa7900b992",
    "fCntUp":17961,
    "toa":null,
    "freq":867700000,
    "batteryLevel":null,
    "ack":false,
    "spreadingFactor":"7",
    "dr":5,
    "rssi":"-105",
    "snr":"4.199999809265137",
    "gatewayIdentifier":null,
    "fPort":"1",
    "tags":{
      "SensorType":[
        "mosmno"
      ]
    },
    "gateways":[
      {
        "rssi":"-105",
        "snr":"4.199999809265137",
        "gatewayIdentifier":null,
        "gwEui":"ac106c82c2531356",
        "mac":null,
        "antenna":0
      }
    ]
  }
]
*/

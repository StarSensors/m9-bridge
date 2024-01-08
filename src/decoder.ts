import { Transform, TransformCallback } from 'stream'
import { Logger } from 'pino'

import { DecodeResult, ValidatedMsg, DecodedMsg } from './types'

export const decode = (payload: string) => {
  const buffer = Buffer.from(payload, 'hex')
  const bytes = buffer.toJSON().data

  const mosid = (bytes[1] << 8) | bytes[2]

  const rawBatt = (bytes[4] << 8) | bytes[5]
  const battery = rawBatt / 100

  let latitude = (bytes[12] << 16) | (bytes[13] << 8) | bytes[14]
  latitude = latitude / 10000

  let longitude = (bytes[15] << 16) | (bytes[16] << 8) | bytes[17]
  longitude = longitude / 10000

  const level =
    (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10]

  const type = bytes[6]

  return {
    bytes,
    mosid,
    battery,
    latitude,
    longitude,
    level,
    type,
  } as DecodeResult
}

export default class Decoder extends Transform {
  private readonly logger: Logger

  constructor(logger: Logger) {
    super({ objectMode: true })
    this.logger = logger.child({ class: 'Decoder' })
  }

  _transform(
    msg: ValidatedMsg,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    this.logger.debug(`Decoding message ${msg.payload}`)
    const { payload } = msg

    let decoded: DecodeResult

    try {
      decoded = decode(payload)
    } catch (error) {
      return callback(new Error(`Error decoding message: ${error}`))
    }

    const decodedMsg: DecodedMsg = {
      ...msg,
      decoded,
    }

    this.push(decodedMsg)

    this.logger.debug(`Decoded message ${msg.payload}`)

    callback()
  }
}

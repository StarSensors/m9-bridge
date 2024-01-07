import { Transform } from 'stream'
import { Logger } from 'pino'

import {
  DecodedMsg,
  ThingsboardAttributesMsg,
  ThingsboardTelemetryMsg,
} from './types'

export default class Thingsboard extends Transform {
  private readonly logger: Logger

  constructor(logger: Logger) {
    super({ objectMode: true })
    this.logger = logger.child({ class: 'Thingsboard' })
  }

  _transform(
    msg: DecodedMsg,
    encoding: BufferEncoding,
    callback: Function,
  ): void {
    this.push({
      type: 'telemetry',
      payload: {
        [msg.devEui]: {
          ts: +msg.timestamp,
          values: {
            battery_voltage: msg.decoded.battery,
            level: msg.decoded.level,
            rssi: msg.rssi,
            snr: msg.snr,
          },
        },
      },
    } as ThingsboardTelemetryMsg)

    this.push({
      type: 'attributes',
      payload: {
        [msg.devEui]: {
          latitude: msg.decoded.latitude,
          longitude: msg.decoded.longitude,
          mosid: msg.decoded.mosid,
          type: msg.decoded.type,
          sensor_type: msg.tags.SensorType[0],
        },
      },
    } as ThingsboardAttributesMsg)

    callback()
  }
}

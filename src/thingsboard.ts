import { Transform } from 'stream'
import { Logger } from 'pino'

import {
  DecodedMsg,
  ThingsboardConnectMsg,
  ThingsboardAttributesMsg,
  ThingsboardTelemetryMsg,
} from './types'

export default class Thingsboard extends Transform {
  private readonly deviceType: string
  private readonly logger: Logger
  private readonly connected: { [key: string]: boolean } = {}

  constructor(deviceType: string, logger: Logger) {
    super({ objectMode: true })
    this.deviceType = deviceType
    this.logger = logger.child({ class: 'Thingsboard' })
  }

  _transform(
    msg: DecodedMsg,
    encoding: BufferEncoding,
    callback: Function,
  ): void {
    this.logger.debug(`Transforming message ${msg.payload}`)

    const connectMsg: ThingsboardConnectMsg = {
      type: 'connected',
      device: msg.devEui,
      payload: {
        device: msg.devEui,
        type: this.deviceType,
      },
    }

    const telemetryMsg: ThingsboardTelemetryMsg = {
      type: 'telemetry',
      device: msg.devEui,
      payload: {
        [msg.devEui]: [
          {
            ts: +msg.timestamp,
            values: {
              battery_voltage: msg.decoded.battery,
              level: msg.decoded.level,
              rssi: msg.rssi,
              snr: msg.snr,
            },
          },
        ],
      },
    }

    const attributesMsg: ThingsboardAttributesMsg = {
      type: 'attributes',
      device: msg.devEui,
      payload: {
        [msg.devEui]: {
          latitude: msg.decoded.latitude,
          longitude: msg.decoded.longitude,
          mosid: msg.decoded.mosid,
          type: msg.decoded.type,
          sensor_type: msg.tags.SensorType[0],
        },
      },
    }

    if (!this.connected[msg.devEui]) {
      this.push(connectMsg)
      this.connected[msg.devEui] = true
      this.logger.info(
        `${Object.keys(this.connected).length} devices connected`,
      )
    } else {
      this.logger.debug(`Device ${msg.devEui} already connected`)
    }

    this.push(telemetryMsg)
    this.push(attributesMsg)

    callback()
  }
}

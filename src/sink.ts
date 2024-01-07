import { connect, IClientOptions, MqttClient } from 'mqtt'
import { Logger } from 'pino'
import { Writable } from 'stream'
import { ThingsboardAttributesMsg, ThingsboardTelemetryMsg } from './types'

export type SinkConfig = {
  url: string
  options: IClientOptions
}

export default class Sink extends Writable {
  private readonly client: MqttClient
  private readonly logger: Logger

  constructor(config: SinkConfig, logger: Logger) {
    super({ objectMode: true, highWaterMark: 1024 })

    this.logger = logger.child({ class: 'Sink' })
    this.client = connect(config.url, config.options)
    this.logger.info(`Connecting external MQTT client to ${config.url}`)

    this.client.on('connect', () => {
      this.logger.info('Connected!')
    })
  }

  _write(
    msg: ThingsboardTelemetryMsg | ThingsboardAttributesMsg,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void,
  ): void {
    const topic = `v1/gateway/${msg.type}`
    this.logger.debug(`Publishing message to ${topic}`)
    this.client.publish(topic, JSON.stringify(msg.payload))
    callback()
  }

  _destroy(
    error: Error | null,
    callback: (error?: Error | null | undefined) => void,
  ): void {
    this.logger.info('Disconnecting MQTT client')
    this.client.end()
    callback(error)
  }
}

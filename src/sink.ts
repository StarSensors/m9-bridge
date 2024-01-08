import { connect, IClientOptions, MqttClient } from 'mqtt'
import { Logger } from 'pino'
import { Writable } from 'stream'
import { ThingsboardMsg } from './types'

export type SinkConfig = {
  url: string
  options: IClientOptions
}

export default class Sink extends Writable {
  private readonly client: MqttClient
  private readonly logger: Logger
  private readonly counters: { [key: string]: number } = {}
  private readonly interval: NodeJS.Timeout
  private timestamp: number

  constructor(config: SinkConfig, logger: Logger) {
    super({ objectMode: true, highWaterMark: 1024 })

    this.logger = logger.child({ class: 'Sink' })
    this.client = connect(config.url, config.options)
    this.logger.info(`Connecting external MQTT client to ${config.url}`)

    this.client.on('connect', () => {
      this.logger.info('Connected!')
    })

    this.timestamp = Date.now()
    this.interval = setInterval(() => {
      const now = Date.now()
      const diff = now - this.timestamp
      const seconds = diff / 1000
      const minutes = seconds / 60

      Object.keys(this.counters).forEach(key => {
        this.logger.info(
          `Count for ${key}: ${this.counters[key]} in ${seconds.toFixed(
            1,
          )} seconds (${(this.counters[key] / minutes).toFixed(1)} per minute)`,
        )
        this.counters[key] = 0
      })

      this.timestamp = now
    }, 60000)
  }

  _write(
    msg: ThingsboardMsg,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void,
  ): void {
    const topic = `v1/gateway/${msg.type}`
    const payload = JSON.stringify(msg.payload)
    this.logger.debug(`Publishing message to ${topic}: ${payload}`)
    this.client.publish(topic, payload)
    this.counters[msg.type] = (this.counters[msg.type] || 0) + 1
    callback()
  }

  _destroy(
    error: Error | null,
    callback: (error?: Error | null | undefined) => void,
  ): void {
    clearInterval(this.interval)
    this.logger.info('Disconnecting MQTT client')
    this.client.end()
    callback(error)
  }
}

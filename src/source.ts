import { connect, IClientOptions, MqttClient } from 'mqtt'
import { Logger } from 'pino'
import { Readable } from 'stream'

export type SourceConfig = {
  url: string
  options: IClientOptions
  topic: string
}

export default class Source extends Readable {
  private readonly client: MqttClient
  private readonly logger: Logger

  constructor(config: SourceConfig, logger: Logger) {
    super({ objectMode: true, highWaterMark: 1024 })

    this.logger = logger.child({ class: 'Source' })
    this.client = connect(config.url, config.options)
    this.logger.info(`Connecting external MQTT client to ${config.url}`)

    this.client.on('connect', () => {
      this.logger.info('Connected!')

      this.logger.info(`Subscribing to topic ${config.topic}`)
      this.client.subscribe(config.topic, error => {
        if (error) {
          this.logger.error(
            `Error subscribing to topic ${config.topic}: ${error.message}`,
          )
        }
      })
    })

    this.client.on('message', (topic, message) => {
      const string = message.toString()

      this.logger.debug(`Received message on topic ${topic}: ${string}`)

      let json: any
      try {
        json = JSON.parse(string)
      } catch (error) {
        this.logger.error(
          `Error parsing message on topic ${topic}, content: ${string}`,
        )
        return
      }

      if (!this.push(json)) {
        this.logger.warn('Buffer full!')
      }
    })
  }

  _read(): void {}

  _destroy(
    error: Error | null,
    callback: (error?: Error | null | undefined) => void,
  ): void {
    this.logger.info('Disconnecting MQTT client')
    this.client.end()
    callback(error)
  }
}

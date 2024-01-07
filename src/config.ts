import 'dotenv/config'
import os from 'os'

const sourceUsername = process.env.MQTT_SOURCE_USERNAME || 'username'
const hostname = os.hostname()
const sourceClientId = `${sourceUsername}-${hostname}`

export default {
  mqtt: {
    source: {
      url: process.env.MQTT_SOURCE_URL || 'mqtt://localhost:1883',
      options: {
        username: sourceUsername,
        password: process.env.MQTT_SOURCE_PASSWORD || 'password',
        clientId: sourceClientId,
      },
      topic: process.env.MQTT_SOURCE_TOPIC || 'topic',
    },
    sink: {
      url: 'mqtt://localhost:1883',
      options: {
        username: 'username',
        password: 'password',
        clientId: 'clientId',
      },
    },
  },
}

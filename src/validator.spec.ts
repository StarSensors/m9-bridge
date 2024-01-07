import { Readable, Writable, pipeline } from 'stream'
import pino from 'pino'

import Validator from './validator'

const exampleMsgs = [
  {
    devEui: '6081f973219bd6df',
    sensorType: 'other',
    messageType: 'payload',
    timestamp: '2024-01-07T11:50:32.161Z',
    payload: '06004402014c0500016cf28807fa7900b992',
    fCntUp: 17961,
    toa: null,
    freq: 867700000,
    batteryLevel: null,
    ack: false,
    spreadingFactor: '7',
    dr: 5,
    rssi: '-105',
    snr: '4.199999809265137',
    gatewayIdentifier: null,
    fPort: '1',
    tags: {
      SensorType: ['mosmno'],
    },
    gateways: [
      {
        rssi: '-105',
        snr: '4.199999809265137',
        gatewayIdentifier: null,
        gwEui: 'ac106c82c2531356',
        mac: null,
        antenna: 0,
      },
    ],
  },
]

const logger = pino({
  level: 'debug',
  transport: { target: 'pino-pretty' },
})

describe('Validate', () => {
  it('should validate', async () => {
    const source = Readable.from([exampleMsgs], { objectMode: true })
    const validator = new Validator(logger)

    return new Promise(resolve => {
      pipeline(
        source,
        validator,
        new Writable({
          objectMode: true,
          write: (msg, _, callback) => {
            expect(msg.devEui).toBe('6081f973219bd6df')
            expect(msg.sensorType).toBe('other')
            expect(msg.messageType).toBe('payload')
            expect(+msg.timestamp).toBe(1704628232161)
            expect(msg.payload).toBe('06004402014c0500016cf28807fa7900b992')
            expect(msg.fCntUp).toBe(17961)
            expect(msg.rssi).toBe(-105)
            expect(msg.snr).toBe(4.199999809265137)
            expect(msg.tags).toEqual({
              SensorType: ['mosmno'],
            })

            callback()
          },
        }),
        () => {
          resolve(true)
        },
      )
    })
  })
})

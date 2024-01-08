export type ValidatedMsg = {
  devEui: string
  sensorType: string
  messageType: string
  timestamp: string
  payload: string
  fCntUp: number
  rssi: number
  snr: number
  tags: {
    [key: string]: string
  }
}

export type DecodeResult = {
  bytes: number[]
  mosid: number
  battery: number
  latitude: number
  longitude: number
  level: number
  type: number
}

export type DecodedMsg = ValidatedMsg & {
  decoded: DecodeResult
}

export type ThingsboardMsg = {
  type: 'connected' | 'attributes' | 'telemetry'
  device: string
  payload: any
}

export type ThingsboardTelemetryMsg = ThingsboardMsg & {
  type: 'telemetry'
  payload: {
    [key: string]: {
      ts: number
      values: {
        [key: string]: number | string
      }
    }[]
  }
}

export type ThingsboardAttributesMsg = ThingsboardMsg & {
  type: 'attributes'
  payload: {
    [key: string]: {
      [key: string]: number | string
    }
  }
}

export type ThingsboardConnectMsg = ThingsboardMsg & {
  type: 'connected'
  payload: {
    device: string
    type: string
  }
}

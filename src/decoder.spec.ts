import { decode } from './decoder'

describe('Decoder', () => {
  it('should decode a payload', () => {
    const { battery, latitude, longitude, level, mosid, type } = decode(
      '06004d0201550500005854',
    )
    expect(battery).toBe(3.41)
    expect(latitude).toBe(0)
    expect(longitude).toBe(0)
    expect(mosid).toBe(77)
    expect(level).toBe(22612)
    expect(type).toBe(5)
  })

  it('should decode a payload', () => {
    const { battery, latitude, longitude, level, mosid, type } = decode(
      '06004a02016205000040d2',
    )
    expect(battery).toBe(3.54)
    expect(latitude).toBe(0)
    expect(longitude).toBe(0)
    expect(mosid).toBe(74)
    expect(level).toBe(16594)
    expect(type).toBe(5)
  })

  it('should decode a payload', () => {
    const { battery, latitude, longitude, level, mosid, type } = decode(
      '06005e02014e050000568e',
    )
    expect(battery).toBe(3.34)
    expect(latitude).toBe(0)
    expect(longitude).toBe(0)
    expect(mosid).toBe(94)
    expect(level).toBe(22158)
    expect(type).toBe(5)
  })
})

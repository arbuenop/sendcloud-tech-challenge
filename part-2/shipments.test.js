import { JSDOM } from 'jsdom'
import { createShipment, load } from './shipments'

const mockShipment = {
  name: 'Jane Doe',
  city: 'Eindhoven',
  country: 'NL',
  shipping_method_id: 1,
  created_at: '2024-01-02'
}
const methods = [{ id: 1, name: "Shipping method 1" }]

beforeAll(() => {
  const dom = new JSDOM(`<div id="wrapper">
    <div class="loading">Loading...</div>
  </div>`)
  global.document = dom.window.document
})

describe('createShipment', () => {
  it('a shipment is created', () => {
    createShipment(mockShipment, 0, methods)

    const shipment = document.querySelector('.shipment')
    expect(shipment.textContent).toContain('Name: Jane Doe')
    expect(shipment.textContent).toContain('City: Eindhoven')
    expect(shipment.textContent).toContain('Country: NL')
    expect(shipment.textContent).toContain('Shipping method: Shipping method 1')
    expect(shipment.textContent).toContain(`Created: ${new Date(mockShipment.created_at).toDateString()}`)
  })

  it('the first shipment should be highlighted', () => {
    createShipment(mockShipment, 0, methods)
    createShipment(mockShipment, 1, methods)
    createShipment(mockShipment, 2, methods)

    const shipments = document.querySelectorAll('.shipment')
    expect(shipments[0].classList).toContain('highlighted')
  })
})

describe('load', () => {
  it('loading message removed', async () => {
    global.axios = {
      get: vi.fn((url) => {
        if (url === 'http://localhost:3000/shipping-methods') {
          return Promise.resolve({ data: methods })
        } else {
          return Promise.resolve({ data: [mockShipment, mockShipment, mockShipment] })
        }
      })
    }
    expect(document.querySelector('.loading')).toBeTruthy()

    load()
    await new Promise(setImmediate)
    await new Promise(setImmediate)
    await new Promise(setImmediate)

    expect(document.querySelector('.loading')).toBe(null)
  })

  it.skip('loading shipments', async () => {
    global.axios = {
      get: vi.fn((url) => {
        if (url === 'http://localhost:3000/shipping-methods') {
          return Promise.resolve({ data: methods })
        } else {
          return Promise.resolve({ data: [mockShipment, mockShipment, mockShipment] })
        }
      })
    }

    load()
    await new Promise(setImmediate)
    await new Promise(setImmediate)
    await new Promise(setImmediate)

    expect(document.querySelector('.loading')).toBe(null)

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/shipping-methods')
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/shipments')

    const shipments = document.querySelectorAll('.shipment')
    expect(shipments[0].textContent).toContain('Name: Jane Doe')
  })
})
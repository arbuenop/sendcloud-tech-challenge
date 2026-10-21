function scrollTo(elm) {
  let element = document.querySelector(elm)
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: element.offsetTop
  })
}

function ScrollToTop() {
  const upArrow = document.querySelector('.jumpToTop')
  upArrow.onclick = () => scrollTo('.shipments-title')
}

// makes a shipment object for sending to the backend
export function createShipment(s, i, methods) {
  const t = document.createElement('div')
  t.className = 'shipment'
  if (i === 0) t.className = 'shipment highlighted'
  const name = document.createElement('div')
  name.innerHTML = '<strong>Name: </strong>' + s.name
  const city = document.createElement('div')
  city.innerHTML = '<strong>City: </strong>' + s.city
  const country = document.createElement('div')
  country.innerHTML = '<strong>Country: </strong>' + s.country
  const inner = document.createElement('div')
  inner.classList = 'inner'
  const createdAt = document.createElement('div')
  createdAt.innerHTML = '<strong>Created: </strong>' + new Date(s.created_at).toDateString()
  let method_name
  for (var i = 0; i <= methods.length; i++) {
    if (methods[i] && methods[i].id === s.shipping_method_id) {
      method_name = methods[i].name
    }
  }
  const method = document.createElement('div')
  method.innerHTML = '<strong>Shipping method:</strong> ' + method_name

  const wrapper = document.querySelector('#wrapper')
  wrapper.appendChild(t)
  t.appendChild(name)
  t.appendChild(city)
  t.appendChild(country)
  inner.appendChild(method)
  inner.appendChild(createdAt)
  t.appendChild(inner)
}

export function load() {
  let methods
  document.querySelector('.loading').remove()
  axios.get('http://localhost:3000/shipping-methods')
    .then(({ data }) => {
      methods = data
    })
  axios.get('http://localhost:3000/shipments')
    .then(({ data }) => {
      data.sort((a, b) => {
        if (new Date(a.created_at).getTime() > new Date(b.created_at).getTime()) {
          return -1
        } else if (new Date(a.created_at).getTime() < new Date(b.created_at).getTime()) {
          return 1
        }
      })
      data.forEach((shipment, index) => {
        createShipment(shipment, index, methods)
      })
    })
}

function init() {
  ScrollToTop()
  load()
}

window.init = init
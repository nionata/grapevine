const serviceUuid = 'acce5bbb-e206-4ac8-9f02-fc9a77f4efc4'
const characteristicUuid = '3fa13acd-e384-40fc-87a4-2c5fe5eec067'
const connectOutput = document.querySelector('#grapevine-connect-output')
const scanOutput = document.querySelector('#grapevine-scan-output')

const appendP = (div, p) => {
  const elm = document.createElement('p')
  elm.textContent = p
  div.append(elm)
}

document.querySelector('#grapevine-connect-btn').addEventListener('click', function (event) {
  connectOutput.innerHTML = ''
  navigator.bluetooth.scan
  navigator.bluetooth.requestDevice({
    filters: [{
      services: [serviceUuid]
    }],
    optionalServices: [serviceUuid]
  })
  .then(device => {
    console.log('device', device)
    appendP(connectOutput, `Device ${device.id}`)
    return device.gatt.connect()
  })
  .then(server => {
    console.log('server', server)
    appendP(connectOutput, `Server ${server.connected}`)
    return server.getPrimaryService(serviceUuid)
  })
  .then(service => {
    console.log('Getting characteristic for service', service.uuid)
    appendP(connectOutput, `Getting characteristic for service ${service.uuid}`)
    return service.getCharacteristic(characteristicUuid)
  })
  .then(characteristic => {
    console.log('Reading characteristic', characteristic.uuid)
    appendP(connectOutput, `Reading characteristic ${characteristic.uuid}`)
    return characteristic.readValue()
  })
  .then((val) => {
    const textDecoder = new TextDecoder('utf-8')
    const value = textDecoder.decode(val.buffer)
    console.log(value)
    appendP(connectOutput, `Value ${value}`)
  })
  .catch(error => { 
    console.error('err', error) 
  })
})

document.querySelector('#grapevine-connect-btn').addEventListener('click', function (event) {
  scanOutput.innerHTML = ''
})

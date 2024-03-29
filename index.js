let Service, Characteristic
const packageJson = require('./package.json')
const ip = require('ip')
const http = require('http')

module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerPlatform('homebridge-web-motion', 'WebMotion', WebMotion)
}

function WebMotion (log, config) {
  this.log = log

  this.port = config.port || 2000
  this.requestArray = ['motionDetected']

  this.autoReset = config.autoReset || false
  this.autoResetDelay = config.autoResetDelay || 5

  this.sensors = config.sensors
  this.sensorAccessories = []
  this.idArray = []

  this.server = http.createServer(function (request, response) {
    const baseURL = 'http://' + request.headers.host + '/'
    const url = new URL(request.url, baseURL)
    if (this.requestArray.includes(url.pathname.substr(1))) {
      try {
        this.log.debug('Handling request')
        response.end('Handling request')
        this._httpHandler(url.searchParams.get('id'), url.pathname.substr(1), url.searchParams.get('value'))
      } catch (e) {
        this.log.warn('Error parsing request: %s', e.message)
      }
    } else {
      this.log.warn('Invalid request: %s', request.url)
      response.end('Invalid request')
    }
  }.bind(this))

  this.server.listen(this.port, function () {
    this.log('Listen server: http://%s:%s', ip.address(), this.port)
  }.bind(this))
}

WebMotion.prototype = {

  accessories: function (callback) {
    const foundAccessories = []
    const count = this.sensors.length
    for (let index = 0; index < count; index++) {
      const accessory = new MotionAccessory(this.sensors[index])
      this.sensorAccessories[accessory.id] = accessory
      this.idArray.push(accessory.id)
      foundAccessories.push(accessory)
    }
    callback(foundAccessories)
  },

  _httpHandler: function (id, characteristic, value) {
    switch (characteristic) {
      case 'motionDetected': {
        this.sensorAccessories[id].setState(value)
        this.log('%s | Updated %s to: %s', id, characteristic, value)
        if (parseInt(value) === 1 && this.autoReset) {
          this.autoResetFunction(id)
        }
        break
      }
      default: {
        this.log.warn('%s | Unknown characteristic "%s" with value "%s"', id, characteristic, value)
      }
    }
  },

  autoResetFunction: function (id) {
    this.log('%s | Waiting %s seconds to autoreset motion detection', id, this.autoResetDelay)
    setTimeout(() => {
      this.sensorAccessories[id].setState(0)
      this.log('%s | Autoreset motion detection', id)
    }, this.autoResetDelay * 1000)
  }

}

function MotionAccessory (config) {
  this.name = config.name
  this.id = config.id

  this.manufacturer = config.manufacturer || packageJson.author
  this.serial = config.serial || config.id
  this.model = config.model || packageJson.name
  this.firmware = config.firmware || packageJson.version
}

MotionAccessory.prototype = {

  getServices: function () {
    this.service = new Service.MotionSensor(this.name)
    this.service.getCharacteristic(Characteristic.MotionDetected).updateValue(0)

    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial)
      .setCharacteristic(Characteristic.FirmwareRevision, this.firmware)

    return [this.informationService, this.service]
  },

  setState: function (value) {
    this.service.getCharacteristic(Characteristic.MotionDetected).updateValue(value)
  }

}

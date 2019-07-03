var Service, Characteristic
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
    var parts = request.url.split('/')
    var partOne = parts[parts.length - 3]
    var partTwo = parts[parts.length - 2]
    var partThree = parts[parts.length - 1]
    if (parts.length === 4 && this.idArray.includes(partOne) && this.requestArray.includes(partTwo) && partThree.length === 1) {
      this.log('Handling request: %s', request.url)
      response.end('Handling request')
      this._httpHandler(partOne, partTwo, partThree)
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
    var foundAccessories = []
    var count = this.sensors.length
    for (var index = 0; index < count; index++) {
      var accessory = new MotionAccessory(this.sensors[index])
      this.sensorAccessories[accessory.id] = accessory
      this.idArray.push(accessory.id)
      foundAccessories.push(accessory)
    }
    callback(foundAccessories)
  },

  _httpHandler: function (id, characteristic, value) {
    switch (characteristic) {
      case 'motionDetected':
        this.log('%s | Updating %s to: %s', id, characteristic, value)
        this.sensorAccessories[id].setState(value)
        if (parseInt(value) === 1 && this.autoReset) {
          this.autoResetFunction(id)
        }
        break
      default:
        this.log.warn('%s | Unknown characteristic "%s" with value "%s"', id, characteristic, value)
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

  this.manufacturer = config.manufacturer || packageJson.author.name
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

var Service, Characteristic
const packageJson = require('./package.json')
const ip = require('ip')
const http = require('http')

module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-web-motion', 'WebMotion', WebMotion)
}

function WebMotion (log, config) {
  this.log = log

  this.name = config.name
  this.port = config.port || 2000

  this.autoReset = config.autoReset || false
  this.autoResetDelay = config.autoResetDelay || 5

  this.manufacturer = config.manufacturer || packageJson.author.name
  this.serial = config.serial || packageJson.version
  this.model = config.model || packageJson.name
  this.firmware = config.firmware || packageJson.version

  this.requestArray = ['motionDetected']

  this.server = http.createServer(function (request, response) {
    var parts = request.url.split('/')
    var partOne = parts[parts.length - 2]
    var partTwo = parts[parts.length - 1]
    if (parts.length === 3 && this.requestArray.includes(partOne) && partTwo.length === 1) {
      this.log('Handling request: %s', request.url)
      response.end('Handling request')
      this._httpHandler(partOne, partTwo)
    } else {
      this.log.warn('Invalid request: %s', request.url)
      response.end('Invalid request')
    }
  }.bind(this))

  this.server.listen(this.port, function () {
    this.log('Listen server: http://%s:%s', ip.address(), this.port)
  }.bind(this))

  this.service = new Service.MotionSensor(this.name)
}

WebMotion.prototype = {

  identify: function (callback) {
    this.log('Identify requested!')
    callback()
  },

  _httpHandler: function (characteristic, value) {
    switch (characteristic) {
      case 'motionDetected':
        this.log('Updating %s to: %s', characteristic, value)
        this.service.getCharacteristic(Characteristic.MotionDetected).updateValue(value)
        if (parseInt(value) === 1 && this.autoReset) {
          this.autoResetFunction()
        }
        break
      default:
        this.log.warn('Unknown characteristic "%s" with value "%s"', characteristic, value)
    }
  },

  autoResetFunction: function () {
    this.log('Waiting %s seconds to autoreset motion detection', this.autoResetDelay)
    setTimeout(() => {
      this.service.getCharacteristic(Characteristic.MotionDetected).updateValue(0)
      this.log('Autoreset motion detection')
    }, this.autoResetDelay * 1000)
  },

  getServices: function () {
    this.service.getCharacteristic(Characteristic.MotionDetected).updateValue(0)

    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial)
      .setCharacteristic(Characteristic.FirmwareRevision, this.firmware)

    return [this.informationService, this.service]
  }
}

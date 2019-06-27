# homebridge-web-motion

[![npm](https://img.shields.io/npm/v/homebridge-web-motion.svg)](https://www.npmjs.com/package/homebridge-web-motion) [![npm](https://img.shields.io/npm/dt/homebridge-web-motion.svg)](https://www.npmjs.com/package/homebridge-web-motion)

## Description

This [homebridge](https://github.com/nfarina/homebridge) plugin exposes a web-based motion sensor to Apple's [HomeKit](http://www.apple.com/ios/home/). Using HTTP requests, you can update the plugin with real-time sensor information. The plugin achieves this by setting up a listen server which listens for changes in state from your device and then feeds them real-time into HomeKit.

## Installation

1. Install [homebridge](https://github.com/nfarina/homebridge#installation-details)
2. Install this plugin: `npm install -g homebridge-web-motion`
3. Update your `config.json`

## Configuration

```json
"accessories": [
     {
       "accessory": "WebMotion",
       "name": "Motion Sensor"
     }
]
```

### Core
| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Must be `WebMotion` | N/A |
| `name` | Name to appear in the Home app | N/A |

### Optional fields
| Key | Description | Default |
| --- | --- | --- |
| `autoReset` _(optional)_ | Whether the sensor should automatically change the state back to `0` after being triggered | `false` |
| `autoResetDelay` _(optional)_ | Time (in seconds) until the sensor will automatically reset (if enabled) | `5` |

### Additional options
| Key | Description | Default |
| --- | --- | --- |
| `port` _(optional)_ | Port for your HTTP listener (only one listener per port) | `2000` |
| `timeout` _(optional)_ | Time (in milliseconds) until the accessory will be marked as _Not Responding_ if it is unreachable | `3000` |
| `http_method` _(optional)_ | HTTP method used to communicate with the device | `GET` |
| `username` _(optional)_ | Username if HTTP authentication is enabled | N/A |
| `password` _(optional)_ | Password if HTTP authentication is enabled | N/A |
| `model` _(optional)_ | Appears under the _Model_ field for the accessory | plugin |
| `serial` _(optional)_ | Appears under the _Serial_ field for the accessory | apiroute |
| `manufacturer` _(optional)_ | Appears under the _Manufacturer_ field for the accessory | author |
| `firmware` _(optional)_ | Appears under the _Firmware_ field for the accessory | version |

## API Interfacing

Your API should be able to:

1. Update `motionDetected` when motion is detected by messaging the listen server (should notify `0` after motion finishes unless `autoReset` is enabled):
```
/motionDetected/INT_VALUE_0_TO_1
```

## MotionDetected Key

| Number | Name |
| --- | --- |
| `0` | No motion detected |
| `1` | Motion detected |


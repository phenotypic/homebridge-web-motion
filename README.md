<p align="center">
  <a href="https://github.com/homebridge/homebridge"><img src="https://raw.githubusercontent.com/homebridge/branding/master/logos/homebridge-color-round-stylized.png" height="140"></a>
</p>

<span align="center">

# homebridge-web-motion

[![npm](https://img.shields.io/npm/v/homebridge-web-motion.svg)](https://www.npmjs.com/package/homebridge-web-motion) [![npm](https://img.shields.io/npm/dt/homebridge-web-motion.svg)](https://www.npmjs.com/package/homebridge-web-motion)

</span>

## Description

This [homebridge](https://github.com/nfarina/homebridge) plugin exposes web-based motion sensors to Apple's [HomeKit](http://www.apple.com/ios/home/). Using HTTP requests, you can update the plugin with real-time sensor information. The plugin achieves this by setting up a listen server which listens for changes in state from your devices and then feeds them real-time into HomeKit.

## Installation

1. Install [homebridge](https://github.com/nfarina/homebridge#installation-details)
2. Install this plugin: `npm install -g homebridge-web-motion`
3. Update your `config.json`

## Configuration

```json
"platforms": [{
  "platform": "WebMotion",
  "sensors": [{
      "name": "Hallway Sensor",
      "id": "hall"
    },
    {
      "name": "Bedroom Sensor",
      "id": "bed"
    }
  ]
}]
```

### Core
| Key | Description | Default |
| --- | --- | --- |
| `platform` | Must be `WebMotion` | N/A |
| `name` | Name to appear in the Home app | N/A |
| `id` | ID to call on the listen server | N/A |

### Optional fields
| Key | Description | Default |
| --- | --- | --- |
| `autoReset` | Whether the sensor should automatically change the state back to `0` after being triggered | `false` |
| `autoResetDelay` | Time (in seconds) until the sensor will automatically reset (if enabled) | `5` |

### Additional options
| Key | Description | Default |
| --- | --- | --- |
| `port` | Port for your HTTP listener (only one listener per port) | `2000` |
| `model` | Appears under the _Model_ field for the accessory | plugin |
| `serial` | Appears under the _Serial_ field for the accessory | id |
| `manufacturer` | Appears under the _Manufacturer_ field for the accessory | author |
| `firmware` | Appears under the _Firmware_ field for the accessory | version |

## API Interfacing

Your API should be able to:

1. Update `motionDetected` when motion is detected by messaging the listen server (should notify `0` after motion finishes unless `autoReset` is enabled):
```
/ID/motionDetected/INT_VALUE_0_TO_1
```

## MotionDetected Key

| Number | Name |
| --- | --- |
| `0` | No motion detected |
| `1` | Motion detected |


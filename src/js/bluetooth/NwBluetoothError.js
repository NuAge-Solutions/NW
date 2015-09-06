OJ.extendClass(
    'NwBluetoothDeviceError', [OjEvent], {
        '_get_props_' : {
            'data' : null,
            'device' : null
        },


        '_constructor' : function(type, device, data, bubbles, cancelable){
            this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);

            this._device = device;
            this._data = data;
        }
    },
    {
        'CONNECT' : 'onBluetoothDeviceConnectError',
        'DISCONNECT' : 'onBluetoothDeviceDisconnectError'
    }
);

OJ.extendClass(
    'NwBluetoothError', [OjEvent], {
        '_get_props_' : {
            'data' : null,
            'devices' : null
        },


        '_constructor' : function(type, devices, data, bubbles, cancelable){
            this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);

            this._devices = devices;
            this._data = data;
        }
    },
    {
        'DETECT_DEVICES' : 'onBluetoothDetectDevicesError'
    }
);
OJ.extendClass(
    'NwBluetoothDeviceError', [OjEvent], {
        '_get_props_' : {
            'data' : null,
            'device' : null
        },


        '_constructor' : function(type, device, data, bubbles, cancelable){
            var self;

            self._super(OjEvent, '_constructor', [type, bubbles, cancelable]);

            self._device = device;
            self._data = data;
        }
    },
    {
        'CONNECT' : 'onBluetoothDeviceConnectError',
        'DISCONNECT' : 'onBluetoothDeviceDisconnectError'
    }
);




OJ.extendClass(
    'NwBluetoothDiscoverError', [OjEvent], {
        '_get_props_' : {
            'discovered' : null
        },


        '_constructor' : function(type, discovered, bubbles, cancelable){
            var self = this;

            self._super(OjEvent, '_constructor', [type, bubbles, cancelable]);

            self._discovered = discovered;
        }
    },
    {
        'DISCOVER_CHARACTERISTICS' : 'onBluetoothDiscoverCharacteristicsError',
        'DISCOVER_DEVICES' : 'onBluetoothDiscoverDevicesError',
        'DISCOVER_SERVICES' : 'onBluetoothDiscoverServicesError'
    }
);
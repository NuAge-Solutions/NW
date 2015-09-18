OJ.extendClass(
    'NwBluetoothCharacteristicEvent', [OjEvent], {
        '_get_props_' : {
            'characteristic' : null,
            'data' : null
        },


        '_constructor' : function(type, characteristic, data, bubbles, cancelable){
            var self = this;

            self._super(OjEvent, '_constructor', [type, bubbles, cancelable]);

            self._characteristic = characteristic;
            self._data = data;
        }
    },
    {
        'DISCOVER' : 'onBluetoothCharacteristicDiscover',
        'READ'     : 'onBluetoothCharacteristicRead',
        'UPDATE'   : 'onBluetoothCharacteristicUpdate',
        'WRITE'    : 'onBluetoothCharacteristicWrite'
    }
);



OJ.extendClass(
    'NwBluetoothDeviceEvent', [OjEvent], {
        '_get_props_' : {
            'data' : null,
            'device' : null
        },


        '_constructor' : function(type, device, data, bubbles, cancelable){
            var self = this;

            self._super(OjEvent, '_constructor', [type, bubbles, cancelable]);

            self._device = device;
            self._data = data;
        }
    },
    {
        'CONNECT' : 'onBluetoothDeviceConnect',
        'DISCOVER' : 'onBluetoothDeviceDiscover',
        'DISCONNECT' : 'onBluetoothDeviceDisconnect',
        'NAME_UPDATE' : 'onBluetoothDeviceNameUpdate',
        'RSSI_UPDATE' : 'onBluetoothDeviceRssiUpdate',
        'UPDATE' : 'onBluetoothDeviceUpdate'
    }
);




OJ.extendClass(
    'NwBluetoothDiscoverEvent', [OjEvent], {
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
        'DISCOVER_CHARACTERISTICS' : 'onBluetoothDiscoverCharacteristics',
        'DISCOVER_DEVICES' : 'onBluetoothDiscoverDevices',
        'DISCOVER_SERVICES' : 'onBluetoothDiscoverServices'
    }
);



OJ.extendClass(
    'NwBluetoothServiceEvent', [OjEvent], {
        '_get_props_' : {
            'service' : null
        },


        '_constructor' : function(type, service, bubbles, cancelable){
            var self = this;

            self._super(OjEvent, '_constructor', [type, bubbles, cancelable]);

            self._service = service;
        }
    },
    {
        'DISCOVER' : 'onBluetoothServiceDiscover',
        'UPDATE' : 'onBluetoothServiceUpdate'
    }
);
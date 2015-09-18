OJ.importJs('nw.data.NwData');
OJ.importJs('nw.data.properties.NwBooleanProperty');
OJ.importJs('nw.data.properties.NwDataProperty');
OJ.importJs('nw.data.properties.NwNumberProperty');
OJ.importJs('nw.data.properties.NwObjectProperty');
OJ.importJs('nw.data.properties.NwTextProperty');
OJ.importJs('nw.data.properties.NwUuidProperty');




OJ.extendClass(
    'NwBluetoothObject', [NwData], {},
    {
        'TYPE' : 'BluetoothObject',

        'key' : function(val){
            return val ? val.toUpperCase() : null;
        }
    }
);


OJ.extendClass(
    'NwBluetoothDevice', [NwBluetoothObject], {

        '_get_props_' : {
            'is_connected' : false,
            'rssi' : 0
        },


        // event methods
        '_onConnect' : function(){
            this._is_connected = true;

            var event = new NwBluetoothDeviceEvent(NwBluetoothDeviceEvent.CONNECT, this)

            this.dispatchEvent(event);

            return event;
        },

        '_onConnectError' : function(error){
            this._is_connected = false;

            var event = new NwBluetoothDeviceError(NwBluetoothDeviceError.CONNECT, this);

            this.dispatchEvent(event);

            return event;
        },

        '_onDisconnect' : function(error){
            this._is_connected = false;

            var event = new NwBluetoothDeviceEvent(NwBluetoothDeviceEvent.DISCONNECT, this);

            this.dispatchEvent(event);

            return event;
        },

        '_onRssiUpdate' : function(rssi){
            this._property('rssi', rssi);

            var event = new NwBluetoothDeviceEvent(NwBluetoothDeviceEvent.RSSI_UPDATE, this);

            this.dispatchEvent(event);

            return event;
        },


        // data listener methods
        'addDataListener' : function(service, characteristic, context, callback){
            return BluetoothManager.addDataListener(this, service, characteristic, context, callback);
        },

        'hasDataListener' : function(service, characteristic){
            return BluetoothManager.hasDataListener(this, service, characteristic);
        },

        'removeDataListener' : function(service, characteristic, context, callback){
            return BluetoothManager.removeDataListener(this, service, characteristic, context, callback);
        },


        // connection methods
        'connect' : function(timeout){
            // TODO: we may want to re-evaluate this later to move to native to prevent sync issues
            if(this._is_connected){
                return;
            }

            BluetoothManager.connect(this, timeout);
        },

        'disconnect' : function(timeout){
            BluetoothManager.disconnect(this, timeout);
        },


        // read/write data methods
        'readData' : function(service, characteristic, callback){
            BluetoothManager.readData(this, service, characteristic, callback);
        },

        'writeData' : function(service, characteristic, data){
            BluetoothManager.writeData(this, service, characteristic, data);
        },


        // sub-object methods
        'getCharacteristic' : function(service, uuid){
            return NwBluetoothService.get(this.uuid + ':' + service + ':' + uuid, true);
        },

        'getService' : function(uuid){
            return NwBluetoothService.get(this.uuid + ':' + uuid, true);
        },


        // misc methods
        'title' : function(){
            var nm = this.name;

            return nm ? nm : 'Unknown';
        },

        //'.proximity' : function(){
        //    var rssi = this.rssi;
        //
        //    if(rssi == 0){
        //        return -1;
        //    }
        //
        //    var ratio_linear = Math.pow(10, this.txPowerLevel - rssi / 10);
        //
        //    NW.print([rssi, this.txPowerLevel, Math.sqrt(ratio_linear)]);
        //
        //    return Math.sqrt(ratio_linear);
        //},

        '.rssi' : function(callback){
            if(this.is_connected && callback){
                BluetoothManager.rssi(this, callback);
            }

            return this._property('rssi');
        },

        '.uuid' : function(){
            var uuid = this._property('uuid');

            return uuid ? uuid.toUpperCase() : null;
        }

        //'.txPowerLevel' : function(){
        //    var ad_data = this.advertisementData,
        //        val = ad_data ? ad_data['kCBAdvDataTxPowerLevel'] : null;
        //
        //    if(val){
        //        return parseInt(val);
        //    }
        //
        //    if((val = ad_data['org.bluetooth.characteristic.tx_power_level'])){
        //        return parseInt(val);
        //    }
        //
        //    return undefined;
        //},
    },
    {
        'KEY' : 'uuid',

        'DEFINITION' : {
            //'advertisementData' : new NwObjectProperty({'label' : 'Advertisement Data'}),
            'name' : new NwTextProperty({ 'label': 'Name' }),
            'rssi' : new NwIntegerProperty({ 'label': 'RSSI' }),
            'services' : new NwDataProperty(NwData, { 'label' : 'Services', 'max': 0 }), // this will be set later
            'uuid' : new NwUuidProperty({ 'label': 'UUID' })
            //'watchDogRaised' : new NwBooleanProperty({'label' : 'Watch Dog Raised'})
        },

        'TYPE' : 'BluetoothDevice'
    }
);




OJ.extendClass(
    'NwBluetoothService', [NwBluetoothObject], {
        // internal vars
        '_get_props_' : {
            'device' : null,
            'uuid' : null
        },

        // internal event methods
        '_onEvent' : function(type){
            var self = this,
                event = new NwBluetoothServiceEvent(type, self)

            self.dispatchEvent(event);

            return event;
        },

        '_onDiscover' : function(){
            return this._onEvent(NwBluetoothServiceEvent.DISCOVER);
        },

        '_onUpdate' : function(){
            return this._onEvent(NwBluetoothServiceEvent.UPDATE);
        },


        // public sub-object methods
        'getCharacteristic' : function(uuid){
            return NwBluetoothCharacteristic.get(this.device.uuid + ':' + this.uuid + ':' + uuid, true);
        },


        // public event methods
        'addEventListener' : function(type, context, callback){
            var self = this,
                cls = NwBluetoothServiceEvent;

            if(type == cls.DISCOVER || type == cls.UPDATE){
                BluetoothManager.addServiceListener(self.device, self, context, callback);
            }

            return self._super(NwBluetoothObject, 'addEventListener', arguments);
        },

        'removeEventListener' : function(type, context, callback){
            var self = this,
                cls = NwBluetoothServiceEvent;

            if(type == cls.DISCOVER || type == cls.UPDATE){
                BluetoothManager.removeServiceListener(self.device, self, context, callback);
            }

            return self._super(NwBluetoothObject, 'removeEventListener', arguments);
        },

        // public properties
        '=id' : function(val){
            var self = this;

            if(self.id == val){
                return;
            }

            self._property('id', val);

            if(val){
                var parts = val.split(':');

                self._device =  NwBluetoothDevice.get(parts[0], true);
                self._uuid = parts[1];
            }
            else{
                self._device = null;
                self._uuid = null;
            }
        }

        // todo: figure out a way to prevent device, and uuid setting and force set through id property
    },
    {
        'KEY' : 'id',

        'DEFINITION' : {
            'characteristics': new NwDataProperty(NwData, { 'label': 'Characteristics',  'max': 0 }),  // this will be set later
            'id' : new NwTextProperty({ 'label': 'ID' }),
            'is_primary': new NwBooleanProperty({ 'label': 'Is Primary' })
        },

        'TYPE' : 'BluetoothService'
    }
);



OJ.extendClass(
    'NwBluetoothCharacteristic', [NwBluetoothObject], {
        // internal vars
        '_get_props_' : {
            'device' : null,
            'service' : null,
            'uuid' : null
        },


        // internal event methods
        '_onEvent' : function(type, data){
            var self = this,
                event = new NwBluetoothCharacteristicEvent(type, self, data)

            self.dispatchEvent(event);

            return event;
        },

        '_onDiscover' : function(data){
            return this._onEvent(NwBluetoothCharacteristicEvent.DISCOVER, data);
        },

        '_onRead' : function(data){
            return this._onEvent(NwBluetoothCharacteristicEvent.READ, data);
        },

        '_onUpdate' : function(data){
            return this._onEvent(NwBluetoothCharacteristicEvent.UPDATE, data);
        },

        '_onWrite' : function(data){
            return this._onEvent(NwBluetoothCharacteristicEvent.WRITE, data);
        },


        // public read/write data methods
        'read' : function(callback){
            var self = this;

            BluetoothManager.readData(self.device, self.service, self, callback);
        },

        'write' : function(data, callback){
            var self = this;

            BluetoothManager.writeData(self.device, self.service, self, data, callback);
        },


        // public event methods
        'addEventListener' : function(type, context, callback){
            var self = this,
                cls = NwBluetoothCharacteristicEvent;

            if(type == cls.DISCOVER || type == cls.READ || type == cls.UPDATE || type == cls.WRITE){
                BluetoothManager.addDataListener(self.device, self.service, self, context, callback);
            }

            return self._super(NwBluetoothObject, 'addEventListener', arguments);
        },

        'removeEventListener' : function(type, context, callback){
            var self = this,
                cls = NwBluetoothCharacteristicEvent;

            if(type == cls.DISCOVER || type == cls.READ || type == cls.UPDATE || type == cls.WRITE){
                BluetoothManager.removeDataListener(self.device, self.service, self, context, callback);
            }

            return self._super(NwBluetoothObject, 'removeEventListener', arguments);
        },


        // public properties
        '=id' : function(val){
            var self = this;

            if(self.id == val){
                return;
            }

            self._property('id', val);

            if(val){
                var parts = val.split(':');

                self._device = NwBluetoothDevice.get(parts[0], true);
                self._service = NwBluetoothService.get(parts[0] + ':' + parts[1], true);
                self._uuid = parts[2];
            }
            else{
                self._device = null;
                self._service = null;
                self._uuid = null;
            }
        }
    },
    {
        'KEY' : 'id',

        'DEFINITION' : {
            'id': new NwTextProperty({ 'label': 'ID' })
        },

        'TYPE' : 'BluetoothCharacteristic'
    }
);




NwBluetoothDevice.DEFINITION.services.dataClass = NwBluetoothService;
NwBluetoothService.DEFINITION.characteristics.dataClass = NwBluetoothCharacteristic;
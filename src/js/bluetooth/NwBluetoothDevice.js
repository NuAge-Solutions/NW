OJ.importJs('nw.bluetooth.NwBluetoothManager');
OJ.importJs('nw.data.NwData');
OJ.importJs('nw.data.properties.NwBooleanProperty');
OJ.importJs('nw.data.properties.NwNumberProperty');
OJ.importJs('nw.data.properties.NwObjectProperty');
OJ.importJs('nw.data.properties.NwUuidProperty');


OJ.extendClass(
    'NwBluetoothDevice', [NwData], {

        '_get_props_' : {
            'isConnected' : false,
            'rssi' : 0
        },


        // event methods
        '_onConnect' : function(){
            this._isConnected = true;

            var event = new NwBluetoothDeviceEvent(NwBluetoothDeviceEvent.CONNECT, this)

            this.dispatchEvent(event);

            return event;
        },

        '_onConnectError' : function(error){
            this._isConnected = false;

            var event = new NwBluetoothDeviceError(NwBluetoothDeviceError.CONNECT, this);

            this.dispatchEvent(event);

            return event;
        },

        '_onDisconnect' : function(error){
            this._isConnected = false;

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

        'removeDataListener' : function(service, characteristic, context, callback){
            return BluetoothManager.removeDataListener(this, service, characteristic, context, callback);
        },


        // connection methods
        'connect' : function(timeout){
            // TODO: we may want to re-evaluate this later to move to native to prevent sync issues
            if(this._isConnected){
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


        // misc methods
        'title' : function(){
            var nm = this.name;

            return nm ? nm : 'Unknown';
        },

        '.proximity' : function(){
            var rssi = this.rssi;

            if(rssi == 0){
                return -1;
            }

            var ratio_linear = Math.pow(10, this.txPowerLevel - rssi / 10);

            NW.print([rssi, this.txPowerLevel, Math.sqrt(ratio_linear)]);

            return Math.sqrt(ratio_linear);
        },

        '.rssi' : function(callback){
            if(this.isConnected && callback){
                BluetoothManager.rssi(this, callback);
            }

            return this._property('rssi');
        },

        '.txPowerLevel' : function(){
            var ad_data = this.advertisementData,
                val = ad_data ? ad_data['kCBAdvDataTxPowerLevel'] : null;

            if(val){
                return parseInt(val);
            }

            if((val = ad_data['org.bluetooth.characteristic.tx_power_level'])){
                return parseInt(val);
            }

            return undefined;
        },

        '.uuid' : function(){
            var uuid = this._property('uuid');

            return uuid ? uuid.toUpperCase() : null;
        }
    },
    {
        'KEY' : 'uuid',

        'DEFINITION' : {
            'advertisementData' : new NwObjectProperty({'label' : 'Advertisement Data'}),
            'name' : new NwTextProperty({'label' : 'Name'}),
            'rssi' : new NwIntegerProperty({'label' : 'RSSI'}),
//            'services' : new NwTextProperty({'label' : 'Services'}),
            'uuid' : new NwUuidProperty({'label' : 'UUID'}),
            'watchDogRaised' : new NwBooleanProperty({'label' : 'Watch Dog Raised'})
        },

        'TYPE' : 'BluetoothDevice',

        'key' : function(val){
            return val ? val.toUpperCase() : null;
        }
    }
);
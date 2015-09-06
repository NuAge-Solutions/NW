OJ.importJs('nw.bluetooth.NwBluetoothDevice');
OJ.importJs('nw.bluetooth.NwBluetoothError');
OJ.importJs('nw.bluetooth.NwBluetoothEvent');


OJ.extendManager(
	'BluetoothManager', 'NwBluetoothManager', [NwManager],
	{
        '_namespace' : 'nwBluetooth',  '_notified' : false,

        '_read_callbacks' : {},  '_rssi_callbacks' : {},

        '_get_props_' : {
            'isAvailable' : null
        },


        '_constructor' : function(manager){
            var self = this;

            self._super(NwManager, '_constructor', []);

            NW.addEventListener('nwOnBluetoothCharDiscover', self, '_onCharDiscover');
            NW.addEventListener('nwOnBluetoothDataSent', self, '_onDataSent');
            NW.addEventListener('nwOnBluetoothDataReceived', self, '_onDataReceived');
            NW.addEventListener('nwOnBluetoothDetectDevices', self, '_onDetectDevices');
            NW.addEventListener('nwOnBluetoothDeviceConnect', self, '_onDeviceConnect');
            NW.addEventListener('nwOnBluetoothDeviceDisconnect', self, '_onDeviceDisconnect');
            NW.addEventListener('nwOnBluetoothDeviceRssiUpdate', self, '_onDeviceRssiUpdate');
        },


        '_notify_missing_bluetooth' : function(){
            if(!this._notified){
                this._notified = true;

                WindowManager.alert(
                    'Bluetooth services are being requested, however, they are not accessible. ' +
                    'Please ensure bluetooth is on and accessible to the application.',
                    'Bluetooth Unavailable'
                );
            }

            return false;
        },

        '_onCharDiscover' : function(evt){

        },

        '_onDataReceived' : function(evt){
            var data = evt.data,
                device =  NwBluetoothDevice.importData(data.device),
                error = data.error,
                event,
                type = this.dataListenerType(device, data.service, data.characteristic),
                callbacks = this._read_callbacks[type];

            if(error){
                // TODO: add onDataReceived error handling logic
                event = new NwBluetoothDeviceError(type);
            }
            else{
                if(callbacks){
                    var ln = callbacks.length,
                        i;

                    for(i = 0; i < ln; i++){
                        callbacks[i](data.data);
                    }

                    delete callbacks[type];
                }

                event = new NwBluetoothDeviceEvent(type, device, data.data);
            }

            this.dispatchEvent(event);
        },

        '_onDataSent' : function(evt){
            // TODO: add onDataSent event handling logic
        },

        '_onDetectDevices' : function(evt){
            var data = evt.data,
                devices = data ? NwBluetoothDevice.importData(data.devices) : null,
                error = data ? data.error : null,
                event;
            print('detect', devices);
            if(devices && !error){
                event = new NwBluetoothEvent(NwBluetoothEvent.DETECT_DEVICES, devices);
            }
            else{
                event = new NwBluetoothError(NwBluetoothError.DETECT_DEVICES, devices);
            }

            this.dispatchEvent(event);
        },

        '_onDeviceConnect' : function(evt){
            var data = evt.data,
                device = NwBluetoothDevice.importData(data.device),
                error = data.error;
            print('connect', device);
            if(device){
                this.dispatchEvent(error ? device._onConnectError(error) : device._onConnect());
            }
        },

        '_onDeviceDisconnect' : function(evt){
            var data = evt.data,
                device = NwBluetoothDevice.importData(data.device),
                error = data.error;
            print('disconnect', device);
            if(device){
                this.dispatchEvent(device._onDisconnect(error));
            }
        },

        '_onDeviceRssiUpdate' : function(evt){
            var data = evt.data,
                device = NwBluetoothDevice.importData(data.device),
                error = data.error;

            if(device && !error){
                var uuid = device.uuid,
                    rssi = data.rssi;

                this.dispatchEvent(device._onRssiUpdate(rssi));

                // run the callbacks
                var callbacks = this._rssi_callbacks[uuid],
                    i = 0,
                    ln = callbacks ? callbacks.length : 0

                for(; i < ln; i++){
                    callbacks[i](rssi);
                }

                delete this._rssi_callbacks[uuid];
            }
        },


        'addDataListener' : function(device, service, characteristic, context, callback){
            var type = this.dataListenerType(device, service, characteristic);

            if(!this.hasEventListener(type)){
                this._comm('addDataListener', [device.uuid, service, characteristic]);
            }

            return this.addEventListener(type, context, callback);
        },

        'removeDataListener' : function(device, service, characteristic, context, callback){
            var type = this.dataListenerType(device, service, characteristic),
                rtrn = this.removeEventListener(type, context, callback);

            if(!this.hasEventListener(type)){
                this._comm('removeDataListener', [device.uuid, service, characteristic]);
            }

            return rtrn;
        },


        'connect' : function(device, timeout){
            if(!NW.isNative){
                return this._notify_missing_bluetooth();
            }

            var args = [device.uuid];

            if(!isUndefined(timeout)){
                args.append(timeout);
            }

            this._comm('connect', args);

            return true;
        },

        'disconnect' : function(device, timeout){
            if(!NW.isNative){
                return this._notify_missing_bluetooth();
            }

            var args = [device.uuid];

            if(!isUndefined(timeout)){
                args.append(timeout);
            }

            this._comm('disconnect', args);

            return true;
        },

        'dataListenerType' : function(device, service, characteristic){
            return device.uuid + ':' + service + ':' + characteristic;
        },

        '.isAvailable' : function(){
            // TODO: make this actually check the native system for bluetooth support
            return NW.isNative;
        },

        'readData' : function(device, service, characteristic, callback){
            if(!NW.isNative){
                return this._notify_missing_bluetooth();
            }

            var args = [device.uuid, service, characteristic],
                type = args.join(':'),
                callbacks = this._read_callbacks[type];

            if(!callbacks){
                callbacks = this._read_callbacks[type] = [];
            }

            callbacks.append(callback);

            this._comm('readData', [device.uuid, service, characteristic]);
        },

        'rssi' : function(device, callback){
            if(!NW.isNative){
				return this._notify_missing_bluetooth();
			}

            var uuid = device.uuid,
                callbacks = this._rssi_callbacks[uuid];

            if(!callbacks){
                callbacks = this._rssi_callbacks[uuid] = [];
            }

            callbacks.append(callback);

            this._comm('rssi', [uuid]);
        },

        'scanForDuration' : function(duration){
			if(!NW.isNative){
				return this._notify_missing_bluetooth();
			}

			this._comm('scanForDuration', [duration]);

			return true;
		},

        'scanStart' : function(){
            if(!NW.isNative){
				return this._notify_missing_bluetooth;
			}

			this._comm('scanStart', []);

			return true;
        },

        'scanStop' : function(){
            if(!NW.isNative){
				return this._notify_missing_bluetooth();
			}

			this._comm('scanStop', []);

			return true;
        },

        'writeData' : function(device, service, characteristic, data){
            if(!NW.isNative){
                return this._notify_missing_bluetooth();
            }

            this._comm('writeData', [device.uuid, service, characteristic, data]);
        }
	}
);




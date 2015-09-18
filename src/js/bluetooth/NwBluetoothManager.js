OJ.importJs('nw.bluetooth.NwBluetoothDiscoverErrors');
OJ.importJs('nw.bluetooth.NwBluetoothDiscoverEvents');
OJ.importJs('nw.bluetooth.NwBluetoothObjects');


OJ.extendManager(
	'BluetoothManager', 'NwBluetoothManager', [NwManager],
	{
        // Internal properties
        '_devices' : {},

        '_namespace' : 'nwBluetooth',  '_notified' : false,

        '_read_callbacks' : {},  '_rssi_callbacks' : {},

        '_get_props_' : {
            'is_available' : null
        },


        // Internal methods
        '_constructor' : function(manager){
            var self = this;

            self._super(NwManager, '_constructor', []);

            NW.addEventListener('nwOnBluetoothCharacteristicDiscover', self, '_onCharacteristicDiscover');
            NW.addEventListener('nwOnBluetoothCharacteristicRead', self, '_onCharacteristicRead');
            NW.addEventListener('nwOnBluetoothCharacteristicUpdate', self, '_onCharacteristicUpdate');
            NW.addEventListener('nwOnBluetoothCharacteristicWrite', self, '_onCharacteristicWrite');
            NW.addEventListener('nwOnBluetoothDeviceConnect', self, '_onDeviceConnect');
            NW.addEventListener('nwOnBluetoothDeviceDisconnect', self, '_onDeviceDisconnect');
            NW.addEventListener('nwOnBluetoothDeviceDiscover', self, '_onDeviceDiscover');
            NW.addEventListener('nwOnBluetoothDeviceNameUpdate', self, '_onDeviceNameUpdate');
            NW.addEventListener('nwOnBluetoothDeviceRssiUpdate', self, '_onDeviceRssiUpdate');
            NW.addEventListener('nwOnBluetoothDeviceUpdate', self, '_onDeviceUpdate');
            NW.addEventListener('nwOnBluetoothDiscoverCharacteristics', self, '_onDiscoverCharacteristics');
            NW.addEventListener('nwOnBluetoothDiscoverDevices', self, '_onDiscoverDevices');
            NW.addEventListener('nwOnBluetoothDiscoverServices', self, '_onDiscoverServices');
            NW.addEventListener('nwOnBluetoothServiceDiscover', self, '_onServiceDiscover');
            NW.addEventListener('nwOnBluetoothServiceUpdate', self, '_onServiceUpdate');
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

        '_uuid' : function(obj){
            return isObjective(obj) ? obj.uuid : obj;
        },


        // Internal event listener methods
        '_onCharacteristicDiscover' : function(evt){
            var self = this,
                data = evt.data,
                char = NwBluetoothCharacteristic.importData(data.characteristic),
                error = data.error;

            if(error){
                // TODO: add something here for char discovery error
            }
            else{
                self.dispatchEvent(char._onDiscover());
            }
        },

        '_onCharacteristicRead' : function(evt){
            var self = this,
                data = evt.data,
                char =  NwBluetoothCharacteristic.importData(data.characteristic),
                error = data.error,
                type = char.id,
                callbacks = self._read_callbacks[type],
                event;

            if(error){
                // TODO: add onDataReceived error handling logic
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

                event = char._onRead(data.data);;
            }

            this.dispatchEvent(event);
        },

        '_onCharacteristicUpdate' : function(evt){
            // TODO: add on characteristic update event handling logic
        },

        '_onCharacteristicWrite' : function(evt){
            // TODO: add on characteristic write event handling logic
        },

        '_onDeviceConnect' : function(evt){
            var data = evt.data,
                device = NwBluetoothDevice.importData(data.device),
                error = data.error;

            if(device){
                this.dispatchEvent(error ? device._onConnectError(error) : device._onConnect());
            }
        },

        '_onDeviceDisconnect' : function(evt){
            var data = evt.data,
                device = NwBluetoothDevice.importData(data.device),
                error = data.error;

            if(device){
                this.dispatchEvent(device._onDisconnect(error));
            }
        },

        '_onDeviceDiscover' : function(evt){
            // TODO: implement bluetooth device discover
        },

        '_onDeviceNameUpdate' : function(evt){
            // TODO: implement bluetooth device name update
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

        '_onDeviceUpdate' : function(evt){
            // TODO: implement bluetooth device update
        },

        '_onDiscovered' : function(type, discovered, error){
            var event;

            if(error){
                event = new NwBluetoothDiscoverError(NwBluetoothDiscoverError[type], discovered);
            }
            else{
                event = new NwBluetoothDiscoverEvent(NwBluetoothDiscoverEvent[type], discovered);
            }

            this.dispatchEvent(event);
        },

        '_onDiscoverCharacteristics' : function(evt){
            this._onDiscovered(
                'DISCOVER_CHARACTERISTICS',
                NwBluetoothCharacteristic.importData(evt.data.characteristics),
                evt.data.error
            );
        },

        '_onDiscoverDevices' : function(evt){
            var self = this,
                data = evt.data,
                devices = NwBluetoothDevice.importData(data.devices);

            devices.forEachReverse(function(item){
                self._devices[item.uuid] = item;
            });

            this._onDiscovered('DISCOVER_DEVICES', devices, data.error);
        },

        '_onDiscoverServices' : function(evt){
            this._onDiscovered(
                'DISCOVER_SERVICES',
                NwBluetoothService.importData(evt.data.services),
                evt.data.error
            );
        },

        '_onServiceDiscover' : function(evt){
            var self = this,
                cls = NwBluetoothServiceEvent,
                data = evt.data,
                service =  NwBluetoothService.importData(data.service),
                error = data.error;

            if(error){
                // TODO: do something here
            }
            else{
                var evt = new cls(cls.DISCOVER, service);

                service.dispatchEvent(evt);

                self.dispatchEvent(evt);
            }
        },

        '_onServiceUpdate' : function(evt){

        },


        // Public event listener methods
        'addDataListener' : function(device, service, characteristic, context, callback){
            var self = this,
                type = self.listenerType(device, service, characteristic);

            if(!self.hasListener(device, service, characteristic)){
                self._comm('addDataListener', [
                    self._uuid(device), self._uuid(service), self._uuid(characteristic)
                ]);
            }

            return self.addEventListener(type, context, callback);
        },

        'addServiceListener' : function(device, service, context, callback){
            var self = this,
                type = self.listenerType(device, service);

            if(!self.hasListener(device, service)){
                self._comm('addServiceListener', [
                    self._uuid(device), self._uuid(service)
                ]);
            }

            return self.addEventListener(type, context, callback);
        },

        'hasListener' : function(device, service, characteristic){
            var self = this;

            return self.hasEventListener(
                self.listenerType(device, service, characteristic)
            );
        },

        'listenerType' : function(device, service, characteristic){
            var self = this;

            return self._uuid(device) + ':' + self._uuid(service) +
                   (characteristic ? ':' + self._uuid(characteristic) : '');
        },

        'removeDataListener' : function(device, service, characteristic, context, callback){
            var self = this,
                type = self.listenerType(device, service, characteristic),
                rtrn = self.removeEventListener(type, context, callback);

            if(!self.hasListener(device, service, characteristic)){
                self._comm('removeDataListener', [
                    self._uuid(device), self._uuid(service), self._uuid(characteristic)
                ]);
            }

            return rtrn;
        },

        'removeServiceListener' : function(device, service, context, callback){
            var self = this,
                type = self.listenerType(device, service),
                rtrn = self.removeEventListener(type, context, callback);

            if(!self.hasListener(device, service)){
                self._comm('removeServiceListener', [
                    self._uuid(device), self._uuid(service)
                ]);
            }

            return rtrn;
        },


        // Public utility methods
        'connect' : function(device, timeout){
            var self = this;

            if(!NW.isNative){
                return self._notify_missing_bluetooth();
            }

            var args = [self._uuid(device)];

            if(!isUndefined(timeout)){
                args.append(timeout);
            }

            self._comm('connect', args);

            return true;
        },

        'disconnect' : function(device, timeout){
            var self = this;

            if(!NW.isNative){
                return self._notify_missing_bluetooth();
            }

            var args = [self._uuid(device)];

            if(!isUndefined(timeout)){
                args.append(timeout);
            }

            self._comm('disconnect', args);

            return true;
        },

        'readData' : function(device, service, characteristic, callback){
            var self = this;

            if(!NW.isNative){
                return self._notify_missing_bluetooth();
            }

            var args = [self._uuid(device), self._uuid(service), self._uuid(characteristic)],
                type = args.join(':'),
                callbacks = self._read_callbacks[type];

            if(!callbacks){
                callbacks = self._read_callbacks[type] = [];
            }

            callbacks.append(callback);

            self._comm('readData', args);
        },

        'rssi' : function(device, callback){
            var self = this;

            if(!NW.isNative){
				return self._notify_missing_bluetooth();
			}

            var uuid = self._uuid(device),
                callbacks = self._rssi_callbacks[uuid];

            if(!callbacks){
                callbacks = self._rssi_callbacks[uuid] = [];
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
            var self = this;

            if(!NW.isNative){
                return self._notify_missing_bluetooth();
            }

            self._comm('writeData', [self._uuid(device), self._uuid(service), self._uuid(characteristic), data]);
        },


        // Public properties
        '.is_available' : function(){
            // TODO: make this actually check the native system for bluetooth support
            return NW.isNative;
        }
	}
);




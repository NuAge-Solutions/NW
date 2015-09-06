OJ.importJs('nw.data.NwData');
OJ.importJs('nw.events.NwDataEvent');
OJ.importJs('nw.events.NwDataErrorEvent');


OJ.extendClass(
	'NwDataForm', [OjForm],
	{
        '_props_' : {
            'autoUpdate' : false,
            'data' : null
        },

        '_submitting' : false,  '_is_api_data' : false,

        //'_props' : null, '_dirty' : {},

        '_constructor' : function(){
            this._super(OjForm, '_constructor', arguments);

            this._load_checkpoints.data = false;
        },

        '_listeners' : function(type){
			switch(type){
				case 'dataLoad':
					return [this._data, NwDataEvent.LOAD, NwDataErrorEvent.LOAD];

                case 'dataSave':
					return [this._data, NwDataEvent.SAVE, NwDataErrorEvent.SAVE];
			}

			return this._super(OjForm, '_listeners', arguments);
		},

        '_showInput' : function(prop){
            return prop.userCanWrite(AppManager.user, this._data)
        },

        'load' : function(){
            if(this._super(OjForm, 'load', arguments)){
                if(this._data){
                    if(this._is_api_data && !this._data.isLoaded()){
                        this._updateListeners('add', 'dataLoad');

                        this._data.load()
                    }
                    else{
                        this._onDataLoadSuccess(null);
                    }
                }

                return true;
            }

            return false;
        },

        'submit' : function(){
            if(this._submitting){
                return false;
            }

            if(this._super(OjForm, 'submit', arguments)){
                this._showOverlay();

                this._data.importData(this._dirty);

                this._updateListeners('add', 'dataSave');

                this._submitting = true;

                this._data.save();

                return true;
            }

            return false;
        },

        '_onDataLoadSuccess' : function(evt){
            this._updateListeners('remove', 'dataLoad');

            this._loadCheckpoint('data');

            var key;

            for(key in this._props){
                this._props[key].value = this._data.property(key);
                this._props[key].addEventListener(OjEvent.CHANGE, this, '_onInputChange');
            }
        },

        '_onDataLoadFail' : function(evt){
            this._updateListeners('remove', 'dataLoad');

            this._loadCheckpoint('data');
        },

        '_onDataSave' : function(evt){
            this._submitting = false;

            this._hideOverlay();

            this._updateListeners('remove', 'dataSave');

            if(evt){
                this.dispatchEvent(evt);
            }
        },

        '_onDataSaveSuccess' : function(evt){
            if(this._controller){
                this._controller.removeView(this);
            }

            this._onDataSave(evt);
        },
        '_onDataSaveFail' : function(evt){
            this._onDataSave(evt);
        },

        '_onInputChange' : function(evt){
            var input = evt.currentTarget,
                key = input.name,
                val = input.value,
                prop = this._data.oj_class.getProperty(key);

            if(isArray(val) && !prop.isMultiSelection()){
                val = val[0];
            }
            else if(val == ""){
                val = null;
            }

            if(this._data.isNew() || this._autoUpdate){
                this._data.property(key, val);
            }
            else{
                this._dirty[key] = val;
            }
        },

        '_onSubmitClick' : function(evt){
            this.submit();
        },

        '.data' : function(){
            return this._data;
        },

        '=data' : function(data){
			var self = this,
                old_data = self._data,
                key, def, prop;

            if(old_data == data){
				return;
			}

            // reset the display
            if(old_data){
                self.removeCss(old_data.oj_class_name.toLowerCase() + '-form');

                self.removeAllElms();

                if(self._props){
                    for(key in self._props){
                        OJ.destroy(self._props[key]);
                    }
                }
            }

            // store the data and update the display
            if(self._data = data){
                // make sure we have an NwData object
                if(!data.is(NwData)){
                    throw 'NwDataForm requires that data be an instance of NwData.';
                }

                self.addCss(data.oj_class_name.toLowerCase() + '-form');

                self._is_api_data = data.is(NwIApiData);

                self._props = {};
                self._dirty = {};

                // setup the new display
                def = data.oj_class.sortedDefinition();

                for(key in def){
                    prop = def[key];

                    if(self._showInput(prop, data)){
                        self.appendElm(
                            self._props[key] = prop.makeInput()
                        );
                    }
                }
            }
		}
    },
    {
        '_TAGS' : ['dataform']
    }
);
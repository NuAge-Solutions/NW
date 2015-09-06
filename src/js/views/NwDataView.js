OJ.importJs('nw.events.NwDataEvent');


OJ.extendClass(
	'NwDataView', [OjView],
	{
        '_props_' : {
            'data' : null
        },

        '_is_api_data' : false,

        //'_props' : null

        '_constructor' : function(){
            this._super(OjView, '_constructor', arguments);

            this._load_checkpoints.data = false;

            this._props = {};
        },

        '_listeners' : function(type){
			switch(type){
				case 'data':
					return [this._data, NwDataEvent.LOAD, NwDataEvent.FAIL];
			}

			return this._super(OjView, '_listeners', arguments);
		},

        'load' : function(){
            this._super(OjView, 'load', arguments);

            if(this._data){
                if(this._is_api_data && !this._data.isLoaded()){
                    this._updateListeners('add', 'data');

                    this._data.load();
                }
                else{
                    this._onDataSuccess(null);
                }
            }
        },

        '_onDataFail' : function(evt){
            this._updateListeners('remove', 'data');

            this._loadCheckpoint('data');
        },

        '_onDataSuccess' : function(evt){
            this._updateListeners('remove', 'data');

            this._loadCheckpoint('data');

            var key;

            for(key in this._props){
                this._props[key].value = this._data.property(key);
            }
        },

        '=data' : function(data){
			if(this._data == data){
				return;
			}

            this._data = data;
            this._is_api_data = this._data && this._data.is(NwIApiData);

            // reset the display
            this._props = {};
            this.removeAllElms();

            // setup the new display
            var def = this._data.oj_class.sortedDefinition(),
                key, prop;

            for(key in def){
                prop = def[key];

                if(prop.userCanRead(AppManager.user, this._data)){
                    this.addElm(
                        this._props[key] = prop.makeDisplay()
                    );
                }
            }
		}
    }
);
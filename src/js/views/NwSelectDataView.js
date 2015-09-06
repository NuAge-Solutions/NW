OJ.importJs('nw.data.NwApiData');
OJ.importJs('nw.renderers.NwDataEditor');

OJ.importCss('nw.views.NwSelectDataView');


OJ.defineClass(
    'NwISelectDataView',
    {
        '_props_' : {
            'class' : NwApiData
        },

        '_item_renderer' : NwDataEditor,


        '_selectConstructor' : function(parent, args){
            this._super(parent, '_constructor', args);

            this._load_checkpoints.search = false;

            this.item_renderer = this._item_renderer;
        },

        '_selectListeners' : function(parent, args){
            switch(args[0]){
				case 'search':
					return [this._class, ApApiData.ON_SEARCH_LOAD, ApApiData.ON_SEARCH_FAIL];
			}

            return this._super(parent, '_listeners', args);
        },

        '_selectLoad' : function(parent, args){
            this._super(parent, 'load', args);

            this._updateListeners('add', 'search');

            this._class.search(true);

            this.no_results.hide();
        },


        '_process_data' : function(data){
            return data;
        },

        '_updateDataList' : function(data){
            if(!data || !data.length){
                this.no_results.show();
            }
            else{
                this.no_results.hide();
            }

            this.selector.options = this._process_data(data);
        },


        '_onSearchSuccess' : function(evt){
            var data = evt.data;

            this._updateDataList(data);

            this._updateListeners('remove', 'search');

			this._loadCheckpoint('search');
		},

		'_onSearchFail' : function(evt){
            this._updateListeners('remove', 'search');

            this._loadCheckpoint('search');

            WindowManager.alert('There was an error retrieving the data.', 'Data Error');

            this.no_results.show();
		},

        '.item_renderer' : function(){
            return this.selector.item_renderer;
        },

        '=item_renderer' : function(val){
            this.selector.item_renderer = val;
        }
    }
);


OJ.extendClass(
	'NwSelectDataView', [OjView, NwISelectDataView],
    {
        '_template' : 'nw.views.NwSelectDataView',


        '_constructor' : function(){
            this._selectConstructor(OjView, arguments);

            if(this._dataClass){
                var cls = this._dataClass;

                this._dataClass = null;

                this.dataClass = cls;
            }
        },


        '_listeners' : function(type){
            return this._selectListeners(OjView, arguments);
		},


        '_onItemDelete' : function(evt){
            this.selector.options.removeItem(evt.data);
        },

        '_onItemUpdate' : function(evt){
            var data = this.selector.options;

            this._updateDataList(data ? data.items : []);
        },


        'load' : function(){
            return this._selectLoad(OjView, arguments);
        },


        '=dataClass' : function(val){
            if(this._dataClass == val){
                return;
            }

            if(this._dataClass){
                this._dataClass.removeEventListener(NwDataEvent.SAVE, this, '_onItemUpdate');
                this._dataClass.removeEventListener(NwDataEvent.DELETE, this, '_onItemDelete');
            }

            if(this._dataClass = val){
                this._dataClass.addEventListener(NwDataEvent.SAVE, this, '_onItemUpdate');
                this._dataClass.addEventListener(NwDataEvent.DELETE, this, '_onItemDelete');
            }
        }
    }
);
OJ.importJs('nw.apps.NwAppManager');
OJ.importJs('nw.data.NwData');
OJ.importJs('nw.data.properties.NwUuidProperty');
OJ.importJs('nw.events.NwDataEvent');
OJ.importJs('nw.events.NwDataErrorEvent');
OJ.importJs('nw.net.NwUrlLoader');



OJ.extendClass(
    'NwApiData', [NwData, NwIPersistentData],
    {
        // Properties & Variables
//		'_loader' : null,


//        '_post_compile_' : function(context){
//            this._static._BACKLOG = [];
//        },

        // Helper Functions
        '_exportProp' : function(prop, mode){
            if(mode == NwApiData.API){
                return prop in this._dirty;
            }

            return true;
        },

        '_getDeleteRequest' : function(endpoint, params){
            var args = Array.prototype.splice.call(arguments, 0);

            if(args.length < 2){
                var params = {};

                params[this._static.KEY] = this.key();

                args.append(params);
            }

            var ldr = this._getRequest(this._translateDeleteParam, args);
            ldr.request.method = OjUrlRequest.POST;

            return ldr;
        },

        '_getLoadRequest' : function(endpoint, params){
            var args = Array.prototype.splice.call(arguments, 0);

            if(args.length < 2){
                var params = {};

                params[this._static.KEY] = this.key();

                args.append(params);
            }

            return this._getRequest(this._translateLoadParam, args);
        },

        '_getRequest' : function(translate_func, args){
            if(args.length > 1){
                var key, translated, val, prop,
                    obj = {};

                for(key in args[1]){
                    translated = translate_func.call(this, key);

                    if(translated){
                        val = this._exportValue(key, NwApiData.API, args[1][key]);

                        // if the value is an object then we need to check the flatten property flag
                        if(isObject(val) && (prop = this._static.getProperty(key)).flatten){
                            for(key in val){
                                translated = translate_func.call(this, prop.namespace + '.' + key);

                                if(translated){
                                    obj[translated] = val[key];
                                }
                            }
                        }
                        else{
                            obj[translated] = val;
                        }
                    }
                }

                args[1] = obj;
            }

            return AppManager.apiRequest.apply(AppManager, args);
        },

        '_getSaveRequest' : function(endpoint, params){
            if(isUndefined(params)){
                params = {};

                if(!this.isNew()){
                    params[this._static.KEY] = this.key();
                }

                for(var key in this._dirty){
                    params[key] = this._data[key];
                }
            }

            var ldr = this._getRequest(this._translateSaveParam, [endpoint, params]);
            ldr.request.method = OjUrlRequest.POST;

            return ldr;
        },

        '_importValue' : function(prop, value, mode) {
            this._super(NwData, '_importValue', arguments);

            if(mode == NwApiData.API && this._static.hasProperty(prop)){
                delete this._dirty[prop];
            }
        },

        '_processDeleteData' : function(data){

        },

        '_processLoadData' : function(data){
            // todo: clean out stale data on load data import
            this.importData(data, NwApiData.API);
        },

        '_processSaveData' : function(data){
            this.importData(data, NwApiData.API);
        },

        '_resetLoader' : function(){
            if(this._loader){
                this._loader.cancel();

                this._unset('_loader');
            }
        },

        '_translateDeleteParam' : function(param){
            var map = this._static.EXPORT_MAP;

            return map[param] ? map[param] : param;
        },

        '_translateLoadParam' : function(param){
            var map = this._static.EXPORT_MAP;

            return map[param] ? map[param] : param;
        },

        '_translateSaveParam' : function(param){
            var map = this._static.EXPORT_MAP;

            return map[param] ? map[param] : param;
        },


        // Event Handler Functions
        '_onDelete' : function(evt){
            this._is_loaded = false;

            this.key(null);

            this._processDeleteData(this._loader.data);

            this._unset('_loader');

            this.dispatchEvent(new NwDataEvent(NwDataEvent.DELETE));

            this._static.dispatchEvent(new NwDataEvent(NwDataEvent.DELETE, this));

            // call up to super delete
            this._super(NwData, 'del', arguments);
        },

        '_onDeleteFail' : function(evt){
            this._unset('_loader');

            this.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.DELETE));

            this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.DELETE, this));
        },

        '_onLoad' : function(evt){
            this._is_loaded = true;

            this._processLoadData(this._loader.data);

            this._unset('_loader');

            this._super(NwData, '_onLoad', arguments);
        },

        '_onLoadFail' : function(evt){
            this._unset('_loader');

            this.dispatchEvent(new NwDataEvent(NwDataErrorEvent.LOAD));

            this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.LOAD, this));
        },

        '_onSave' : function(evt){
            if(evt){
                var ldr = evt.target,
                    response = ldr.data;

                // if this is an rpc call then we can automatically check if there was an error
                if(ldr.is('OjRpc')){
                    if(!response || response.error){
                        return this._onSaveFail(evt);
                    }

                    response = response.result;
                }

                this._processSaveData(response);

                // make sure we clear out all applicable dirty flags
                var key,
                    data = ldr.request.data,
                    map = this._static.EXPORT_MAP;

                for(key in data){
                    delete this._dirty[map[key]];
                }

                // destroy the loader if we don't need it anymore
                if(this._loader == ldr){
                    this._unset('_loader');
                }
            }

            this._super(NwData, '_onSave', arguments);
        },

        '_onSaveFail' : function(evt){
            var code, message;

            if(evt){
                var ldr = this._loader,
                    response = ldr.data;

                // if this is an rpc call then we can automatically check if there was an error
                if(ldr.is('OjRpc') && response){
                    code = response.error.code;
                    message = response.error.message
                }

                this._unset('_loader');
            }

            this.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.SAVE, this, message, code));

            this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.SAVE, this, message, code));
        },


        // Utility Functions
        'del' : function(){
            this._resetLoader();

            this._loader = this._getDeleteRequest();

            this._loader.addEventListener(OjEvent.COMPLETE, this, '_onDelete');
            this._loader.addEventListener(OjEvent.FAIL, this, '_onDeleteFail');

            this._loader.load();
        },

        'load' : function(/*reload=false*/){
            var args = arguments,
                ln = args.length,
                reload = ln ? args[0] : false;

            if(this.isNew() || (this._is_loaded && !reload)){
                return this;
            }

            this._resetLoader();

            this._is_loaded = false;

            this._loader = this._getLoadRequest();

            this._loader.addEventListener(OjEvent.COMPLETE, this, '_onLoad');
            this._loader.addEventListener(OjEvent.FAIL, this, '_onLoadFail');

            this._loader.load();
        },

        'save' : function(/*prop1, prop2, ... propX*/){
            // check to see if we even need to make a save
            var is_new = this.isNew(),
                is_dirty = this.isDirty();

            if(!is_new && !is_dirty){
                this._onSave(null);

                return;
            }

            // cancel any current loader operations
            this._resetLoader();

            // setup a new loader
            var dirty = this._dirty,
                ln = arguments.length,
                key, val;

            // if we have an existing dirty object and save arguments then filter the dirty props
            if(!is_new && is_dirty && ln){
                this._dirty = {}

                for(; ln--;){
                    if(val = dirty[(key = arguments[ln])]){
                        this._dirty[key] = val;
                    }
                }
            }

            this._loader = this._getSaveRequest();

            // restore the dirty props
            this._dirty = dirty;

            this._loader.addEventListener(OjEvent.COMPLETE, this, '_onSave');
            this._loader.addEventListener(OjEvent.FAIL, this, '_onSaveFail');

            this._loader.load();
        }
    },
    {
        'API' : 'api',

        // Data Definition
        'TYPE_KEY' : '__type__',

        'DEFINITION' : {
            'id' : new NwUuidProperty()
        },

        'TYPE' : 'ApiData',

        // Static Protected Functions
//        '_BACKLOG' : [],

//        '_onAppManagerInit' : function(evt){
//            AppManager.removeEventListener(OjEvent.INIT, this, '_onAppManagerInit');
//
//            var i = 0,
//                ln = this._BACKLOG.length,
//                record;
//
//            for(i; i < ln; i++){
//                record = this._BACKLOG[i];
//
//                this[record[0]].apply(this, record[1]);
//            }
//
//            delete this._BACKLOG;
//        },

//        '_backlogCall' : function(method, args){
//            if(AppManager.isReady()){
//                return false;
//            }
//
//            if(!this._BACKLOG.length){
//                AppManager.addEventListener(OjEvent.INIT, this, '_onAppManagerInit');
//            }
//
//            this._BACKLOG.push([method, args]);
//
//            return true;
//        },

        '_callApi' : function(url, data, method, onComplete, onFail){
//            if(this._backlogCall('_callApi', arguments)){
//                return null;
//            }

            return this._callApiWithRequest(
                AppManager.apiRequest(url, data, method),
                onComplete, onFail
            );
        },

        '_callApiWithRequest' : function(req, onComplete, onFail){
            req.addEventListener(OjEvent.COMPLETE, this, onComplete);
            req.addEventListener(OjEvent.FAIL, this, onFail);
            req.load();

            return req;
        },

        '_onApiFail' : function(evt, type, data/*, message, code*/){
            var args = arguments,
                ln = args.length;

            if(evt){
                evt = OJ.destroy(evt);
            }

            this.dispatchEvent(
                new NwDataErrorEvent(
                    type, data,
                    ln > 3 ? args[3] : null,
                    ln > 4 ? args[4] : null
                )
            );
        },

        '_onApiLoad' : function(evt, type, data/*, key, old_data*/){
            var args = arguments,
                ln = args.length,
                key = ln > 3 ? args[3] : null,
                d;

            if(evt){
                d = this.importData(evt.target.data, NwApiData.API);

                if(key){
                    this[data][key] = d;
                }
                else{
                    this[data] = d;
                }

                evt = OJ.destroy(evt);
            }
            else{
                d = key ? this[data][key] : this[data];
            }

            this.dispatchEvent(new NwDataEvent(type, d, ln > 4 ? args[4] : null));

            return d;
        },


        // Static Public Functions
        'load' : function(id /*, refresh*/){
            if(!id){
                return null;
            }

            var data = this.get(id, true);

            if(data.isLoaded() && (arguments.length == 1 || !arguments[1])){
                this.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD, data));
            }
            else{
                data.load();
            }

            return data;
        },

        // Search API Call
        'ON_SEARCH_LOAD' : 'onSearchLoad',
		'ON_SEARCH_FAIL' : 'onSearchFail',

//        '_search_results' : null,
//        '_search_loader' : null,
//        '_api_endpoint' : null,

		'_onSearchLoad' : function(evt){
			this._search_loader = null;

			this._onApiLoad(evt, this.ON_SEARCH_LOAD, '_search_results');
		},

		'_onSearchFail' : function(evt){
			this._search_loader = null;

			this._onApiFail(evt, this.ON_SEARCH_FAIL, null);
		},

		'search' : function(refresh){
			if((!this._search_results || refresh) && !this._search_loader){
				this._search_loader = this._callApi(
                    this._api_endpoint, [],
                    OjUrlRequest.GET, '_onSearchLoad', '_onSearchFail'
                );
			}
			else{
				this._onSearchLoad(null);
			}
		}
    }
);
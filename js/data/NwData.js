OJ.importJs('nw.app.NwAppManager');
OJ.importJs('nw.data.NwDataEvent');
OJ.importJs('nw.data.NwDataErrorEvent');
OJ.importJs('nw.data.properties.NwProperty');
OJ.importJs('nw.data.properties.NwUuidProperty');
OJ.importJs('nw.net.NwUrlLoader');

OJ.importJs('oj.events.OjActionable');


'use strict';

OJ.extendClass(
	'NwData', [OjActionable],
	{
		// Compiler Functions
		'_post_compile_' : function(context){
			NwData.registerDataType(this._static.TYPE, this._class_name);

			var def = this._static.DEFINITION,
				e_map = this._static.EXPORT_MAP,
				i_map = (this._static.IMPORT_MAP = Object.clone(this._static.IMPORT_MAP)),
				key;

			// setup the definition
			for(key in def){
				// setup the data functions for the property
				def[key].setup(this, key, key.ucFirst());
			}

			// make sure the import/export map is synced
			for(key in e_map){
				i_map[e_map[key]] = key;
			}

			this._static.CACHE = {};
			this._static._BACKLOG = [];
		},


		// Properties & Variables
//		'_data' : null,  '_dirty' : null,  '_keyword_cache' : null,
//
//		'_loader' : null,  '_is_loaded' : false,


		// Construction & Destruction Functions
		'_constructor' : function(/*data, mode*/){
			this._super(OjActionable, '_constructor', []);

			this._data = {};

			this._dirty = [];

			this._keyword_cache = {};

			// import any data if present and don't dispatch any change events
			// since no one could be listening at this point
			var ln = arguments.length;

			if(ln){
				this._prevent_dispatch = true;

				this.importData(arguments[0], ln > 1 ? arguments[1] : NwData.DEFAULT);

				this._prevent_dispatch = false;
			}
		},


		// Helper Functions
		'_addToDirty' : function(prop){
			if(this._dirty && this._dirty.indexOf(prop) == -1){
				this._dirty.push(prop);
			}
		},

		'_exportValue' : function(prop, mode){
			if(this._static.hasProperty(prop)){
				return this._static.DEFINITION[prop].exportValue(this._data[prop], mode);
			}

			return this._data[prop];
		},

		'_getDeleteRequest' : function(method/*, params*/){
			var args = Array.prototype.splice.call(arguments, 0);

			if(args.length < 2){
				var params = {};

				params[this._static.PRIMARY_KEY] = this.primarKey();

				args.push(params);
			}

			var ldr = this._getRequest(this._translateDeleteParam, args);

			ldr.getRequest().setType(OjUrlRequest.POST);

			return ldr;
		},

		'_getLoadRequest' : function(method/*, params*/){
			var args = Array.prototype.splice.call(arguments, 0);

			if(args.length < 2){
				var params = {};

				params[this._static.PRIMARY_KEY] = this.primaryKey();

				args.push(params);
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
						val = this._exportValue(key, NwData.API);

						// if the value is an object then we need to check the flatten property flag
						if(isObject(val) && (prop = this._static.getProperty(key)).getFlatten()){
							for(key in val){
								translated = translate_func.call(this, prop.getNamespace() + '.' + key);

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

		'_getSaveRequest' : function(/*method, params*/){
			var args = Array.array(arguments);

			if(args.length < 2){
				if(this.isNew()){
					args.push(Object.clone(this._data));
				}
				else{
					var i = this._dirty.length,
						params = {};

					params[this._static.PRIMARY_KEY] = this.primaryKey();

					for(; i--;){
						params[this._dirty[i]] = this._data[this._dirty[i]];
					}

					args.push(params);
				}
			}

			var ldr = this._getRequest(this._translateSaveParam, args);

			ldr.getRequest().setMethod(OjUrlRequest.POST);

			return ldr;
		},

		'_importValue' : function(prop, value, mode){
			if(this._static.hasProperty(prop)){
				var func = 'set' + prop.ucFirst();

				value = this._static.DEFINITION[prop].importValue(value, this.property(prop), mode);

				if(func != 'setnull' && this[func]){
					this[func](value);
				}
				else{
					this.property(prop, value);
				}

				// if we are not in api mode then remove from dirty
				if(mode == NwData.API){
					var index = this._dirty.indexOf(prop);

					if(index != -1){
						this._dirty.splice(index, 1);
					}
				}

				return;
			}

			// check to see if this prop is a flattened value
			var index = prop.indexOf('.');

			if(index > 0){
				var data = {};
				data[prop.substr(index + 1)] = value;

				this._importValue(prop.substr(0, index), data, mode);
			}
		},

		'_processDeleteData' : function(data){

		},

		'_processLoadData' : function(data){
			// todo: clean out stale data on load data import
			this.importData(data, NwData.API);
		},

		'_processSaveData' : function(data){
			this.importData(data, NwData.API);
		},

		'_resetLoader' : function(){
			if(this._loader){
				this._loader.cancel();

				this._loader = null;
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

			this.primaryKey(null);

			this._processDeleteData(this._loader.getData());

			this._unset('_loader');

			this.dispatchEvent(new NwDataEvent(NwDataEvent.DELETE));

			this._static.dispatchEvent(new NwDataEvent(NwDataEvent.DELETE, this));
		},

		'_onDeleteFail' : function(evt){
			this._unset('_loader');

			this.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.DELETE));

			this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.DELETE, this));
		},

		'_onLoad' : function(evt){
			this._is_loaded = true;

			this._processLoadData(this._loader.getData());

			this._unset('_loader');

			this.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD));

			this._static.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD, this));
		},

		'_onLoadFail' : function(evt){
			this._unset('_loader');

			this.dispatchEvent(new NwDataEvent(NwDataErrorEvent.LOAD));

			this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.LOAD, this));
		},

		'_onSave' : function(evt){
			if(evt){
				var ldr = evt.getTarget(),
					response = ldr.getData();

				// if this is an rpc call then we can automatically check if there was an error
				if(ldr.is('OjRpc')){
					if(!response || response.error){
						return this._onSaveFail(evt);
					}

					response = response.result;
				}

				this._processSaveData(response);

				// make sure we clear out all applicable dirty flags
				var index, key,
					data = ldr.getRequest().getData(),
					map = this._static.EXPORT_MAP;

				for(key in data){
					index = this._dirty.indexOf(map[key]);

					if(index != -1){
						this._dirty.splice(index, 1);
					}
				}

				// destroy the loader if we don't need it anymore
				if(this._loader == ldr){
					this._unset('_loader');
				}
			}

			this.dispatchEvent(new NwDataEvent(NwDataEvent.SAVE, this));

			this._static.dispatchEvent(new NwDataEvent(NwDataEvent.SAVE, this));
		},

		'_onSaveFail' : function(evt){
			var code, message;

			if(evt){
				var ldr = this._loader,
				response = ldr.getData();

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
		'clone' : function(){
			var obj = this._super(OjActionable, 'clone', []);

			obj.importData(this._data, NwData.CLONE);

			return obj;
		},

		'delete' : function(){
			this._resetLoader();

			this._loader = this._getDeleteRequest();

			this._loader.addEventListener(OjEvent.COMPLETE, this, '_onDelete');
			this._loader.addEventListener(OjEvent.FAIL, this, '_onDeleteFail');

			this._loader.load();
		},

		'exportData' : function(/*mode*/){
			var key, mkey, obj, prop, val,
				mode = arguments.length ? arguments[0] : NwData.DEFAULT,
				is_default = mode == NwData.DEFAULT,
				map = this._static.EXPORT_MAP;

			if(is_default){
				obj = this._super(OjActionable, 'exportData', arguments);
			}
			else{
				obj = {};

				if(!this.isNew()){
					obj[this._static.PRIMARY_KEY] = this.primaryKey();
				}
			}

			for(key in this._data){
				if(is_default || this._dirty.indexOf(key) != -1){
					val = this._exportValue(key, mode);

					// if the value is an object then we need to check the flatten property flag
					if(isObject(val) && (prop = this._static.getProperty(key)).getFlatten()){
						for(key in val){
							if(key == '_class_name'){
								continue;
							}

							mkey = prop.getNamespace() + '.' + key;

							obj[map[mkey] ? map[mkey] : mkey] = val[key];
						}
					}
					else{
						obj[map[key] ? map[key] : key] = val;
					}
				}
			}

			return obj;
		},

		'importData' : function(data/*, mode*/){
			var key,
				mode = arguments.length > 1 ? arguments[1] : NwData.DEFAULT,
				map = this._static.IMPORT_MAP,
				primary = this._static.PRIMARY_KEY;

			for(key in data){
				if(mode == NwData.CLONE && key == primary){
					continue;
				}

				this._importValue(map[key] ? map[key] : key, data[key], mode);
			}
		},

		'isDirty' : function(){
			return this._dirty.length > 0;
		},

		'isLoaded' : function(){
			return this._is_loaded;
		},

		'isNew' : function(){
			return isEmpty(this.primaryKey());
		},

		'primaryKey' : function(/*key_value*/){
			if(arguments.length){
				this.property(this._static.PRIMARY_KEY, arguments[0]);
			}

			return this._data[this._static.PRIMARY_KEY];
		},

		'keywordScore' : function(keyword){
			var keywords = [], score = 0;

			if(isArray(keyword)){
				keywords = keyword;
			}
			else{
				keywords.push(keyword);
			}

			var key, ln = keywords.length;

			while(ln-- > 0){
				for(key in this._keyword_cache){
					if(this._keyword_cache[key]){
						score += this._keyword_cache[key].count(keywords[ln].toLowerCase()) / (ln + 1);
					}
				}
			}

			return score;
		},

		'load' : function(/*reload=false*/){
			var args = arguments,
				ln = args.length,
				reload = ln ? args[0] : false;

			if(this._is_loaded && !reload){
				return;
			}

			this._resetLoader();

			this._is_loaded = false;

			this._loader = this._getLoadRequest();

			this._loader.addEventListener(OjEvent.COMPLETE, this, '_onLoad');
			this._loader.addEventListener(OjEvent.FAIL, this, '_onLoadFail');

			this._loader.load();
		},

		'property' : function(prop/*, val*/){
			var args = arguments,
				prev = this._data[prop];

			if(args.length > 1){
				var val = args[1];

				if(prev != val){
					// update the dirty flag
					this._addToDirty(prop);

					var evt = new NwDataEvent(NwDataEvent.CHANGE, val, prev);

					this._data[prop] = val;

					var def = this._static.DEFINITION;

					if(def && def[prop] && def[prop].is('OjTextProperty')){
						this._keyword_cache[prop] = value ? value.toLowerCase() : null;
					}

					this.dispatchEvent(evt);
				}
			}

			return prev;
		},

		'save' : function(){
			// check to see if we even need to make a save
			if(!this.isNew() && isEmpty(this._dirty)){
				this._onSave(null);

				return;
			}

			this._resetLoader();

			this._loader = this._getSaveRequest();

			this._loader.addEventListener(OjEvent.COMPLETE, this, '_onSave');
			this._loader.addEventListener(OjEvent.FAIL, this, '_onSaveFail');

			this._loader.load();
		},

		'title' : function(){
			return null;
		},


		// Getter & Setter functions
		'getId' : function(){
			return this._data['id'];
		},
		'setId' : function(val){
			var id = this.getId();

			if(id){
				delete this._static.CACHE[id];
			}

			this.property('id', val);

			if(val){
				this._static.CACHE[val] = this;
			}
		}
	},
	{
		'API'     : 'api',
		'CLONE'   : 'clone',
		'DEFAULT' : 'default',


		'CACHE' : {},

		'DEFINITION' : {
			'id' : new NwUuidProperty()
		},

		'EXPORT_MAP' : {},

		'IMPORT_MAP' : {},

		'PRIMARY_KEY' : 'id',

		'TYPE' : 'Data',

		'TYPES' : {},


		// Static Protected Functions
		'_BACKLOG' : [],

		'_onAppManagerInit' : function(evt){
			AppManager.removeEventListener(OjEvent.INIT, this, '_onAppManagerInit');

			var i = 0,
				ln = this._BACKLOG.length,
				record;

			for(i; i < ln; i++){
				record = this._BACKLOG[i];

				this[record[0]].apply(this, record[1]);
			}

			delete this._BACKLOG;
		},

		'_backlogCall' : function(method, args){
			if(AppManager.isReady()){
				return false;
			}

			AppManager.addEventListener(OjEvent.INIT, this, '_onAppManagerInit');

			this._BACKLOG.push([method, args]);

			return true;
		},

		'_callApi' : function(url, data, method, onComplete, onFail){
			if(this._backlogCall('_callApi', arguments)){
				return;
			}

			return this._callApiWithRequest(AppManager.apiRequest(url, data, method), onComplete, onFail);
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
				key = ln > 3 ? args[3] : null;

			if(evt){
				var d = this.importData(evt.getTarget().getData(), NwData.API);

				if(key){
					this[data][key] = d;
				}
				else{
					this[data] = d;
				}

				evt = OJ.destroy(evt);
			}

			this.dispatchEvent(
				new NwDataEvent(
					type,
					key ? this[data][key] : this[data],
					ln > 4 ? args[4] : null
				)
			);
		},


		// Static Public Functions
		'addEventListener' : function(type, context, callback){
			EventManager.addEventListener(this, type, context, callback);
		},

		'dispatchEvent' : function(evt){
			if(this._prevent_dispatch){
				return;
			}

			EventManager.dispatchEvent(this, evt);
		},

		'get' : function(id){
			if(!this.CACHE[id]){
				var c = this;

				var data = new c();
				data.setId(id);
			}

			return this.CACHE[id];
		},

		'getProperty' : function(prop){
			return this.DEFINITION[prop];
		},

		'hasEventListener' : function(type){
			return EventManager.hasEventListener(this, type);
		},

		'hasProperty' : function(key){
			return !isUndefined(this.DEFINITION[key]);
		},

		'id' : function(){
			if(!this.CLASS_NAME){
				this.CLASS_NAME = OJ.classToString(this);
			}

			return this.CLASS_NAME;
		},

		'importData' : function(data/*, mode*/){
			var args = arguments,
				mode = args.length > 1 ? args[1] : NwData.DEFAULT;

			if(isArray(data)){
				var ln = data.length;

				while(ln-- > 0){
					data[ln] = this.importData(data[ln], mode);
				}

				return data;
			}

			if(isObject(data)){
				var c = data['_class_name'] ? OJ.stringToClass(data['_class_name']) : this;

				if(c){
					var obj, id = data[this.PRIMARY_KEY];

					if(id && c.CACHE[id]){
						obj = c.CACHE[id];
					}
					else{
						obj = new c();
					}

					obj.importData(data, mode);

					return obj;
				}
			}

			return null;
		},

		'load' : function(id /*, refresh*/){
			if(!id){
				return null;
			}

			var data = this.get(id);

			if(data.isLoaded() && (arguments.length == 1 || !arguments[1])){
				this.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD, data));
			}
			else{
				data.load();
			}

			return data;
		},

		'registerDataType' : function(type, class_name){
			if(!NwData.TYPES[type]){
				NwData.TYPES[type] = class_name;
			}
		},

		'removeAllListeners' : function(){
			return EventManager.removeAllListeners(this);
		},

		'removeEventListener' : function(type, context, callback){
			EventManager.removeEventListener(this, type, context, callback);
		},

		'typeToClass' : function(type){
			if(NwData.TYPES[type]){
				return OJ.stringToClass(NwData.TYPES[type]);
			}

			return null;
		}
	}
);
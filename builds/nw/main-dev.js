"use strict";

OJ.extendClass(
    'NwManager', [OjActionable], {
        '_namespace' : 'nw',
        '_comm' : function(method, params){
            return NW.comm(this._namespace + '.' + method, params);
        }
    }
);

OJ.definePackage(
    'Nw',
    {
        '_get_props_' : {
            'isNative' : false,
            'isReady' : false,
            'userHttp' : false,
            'keyboardVisible' : false,
            'version' : 0
        },
        '_scroll_top' : 0, '_scroll_left' : 0,
//    '_analytics' : null,  '_callbacks' : {},  '_gateway' : null,

        'BACKGROUND_FETCH' : 'nwOnAppFetch',
        'CONFIRM' : 'nwConfirm',
        'STATUS_BAR_CHANGE' : 'onStatusBarChange',
        'STATUS_BAR_NONE' : -1,
        'STATUS_BAR_DEFAULT' : 0,
        'STATUS_BAR_BLACK_TRANSLUCENT' : 1,
        'STATUS_BAR_BLACK_OPAQUE' : 2,
        'PORTRAIT' : 1,
        'PORTRAIT_UPSIDE_DOWN' : 2,
        'LANDSCAPE_LEFT' : 3,
        'LANDSCAPE_RIGHT' : 4,

        '_call' : function(func, params){
            var context;
            if(isFunction(this[func])){
                func = (context = this)[func];
            }
            else{
                var parts = func.split('.');
                if(parts.length == 1){
                    context = window;
                }
                else{
                    parts.pop();
                    context = OJ.stringToVar(parts);
                }
                func = OJ.stringToVar(func);
            }
            if(context && isFunction(func)){
                return toJson(OjObject.exportData(func.apply(context, params ? params : [])));
            }
            return null;
        },
        '_comm' : function(method, params, async){
            if(!params){
                params = [];
            }
            if(!async){
                async = true;
            }
            //if(this._useHttp){
            //    return (new NwRpc('http://native.web/comm', method, params, OjUrlRequest.JSON, async)).load();
            //}
            var comm = 'nw',
                context = window,
                i = 0,
                os = OJ.os,
                parts;
            if(os == OJ.IOS || os == OJ.OSX){
                context = window.webkit.messageHandlers[comm];
                comm = context.postMessage;
                params = [[method, params]]
            }
            else{
                parts = method.split('.');
                for(var ln = parts.length; i < ln; i++){
                    context = context[comm];
                    comm = context[parts[i]];
                }
            }
            if(async){
                return setTimeout(function(){
                    comm.apply(context, params);
                }, 1);
            }
            return comm.apply(context, params);
        },
        '_onNativeReady' : function(){
            var rtrn = this.comm('nw.ready');
            this._isReady = true;
            this.dispatchEvent(new OjEvent(OjEvent.READY));
            return rtrn;
        },
        '_triggerEvent' : function(evt, data){
            this.dispatchEvent(new NwEvent(evt, false, false, data));
        },
        '_onKeyboardHide' : function(evt){
            var self = this;
            self._keyboardVisible = false;
            OJ.scroll_top = self._scroll_top;
            OJ.scrol_left = self._scroll_left;
        },
        '_onKeyboardShow' : function(evt){
            var self = this;
            if(!self._keyboardVisible){
                self._scroll_top = OJ.scroll_top;
                self._scroll_left = OJ.scroll_left;
            }
            self._keyboardVisible = true;
        },
        '_onOrientationChange' : function(evt){
            // if not native lock the orientation in
            var orientationEvent = OjOrientationEvent;
            //					if(
            //						(o == orientationEvent.LANDSCAPE_LEFT )
            //					){
            //
            //					}
            //					else if(evt.getOrientation() == OjOrientationEvent.LANDSCAPE_RIGHT){
            //
            //					}
        },

        // utility functions
        'comm' : function(){},
        '=isNative' : function(val){
            if(arguments.length){
                if(this._isNative = !isEmpty(this._gateway = val)){
                    OJ.addCss('is-native');
                    this.comm = this._comm;
                    if(OJ.is_ready){
                        this._onNativeReady();
                    }
                    // override the default safari functionality
                    document.documentElement.style.webkitTouchCallout =
                    document.body.style.webkitTouchCallout =
                    document.body.style.KhtmlUserSelect = 'none';
                    document.documentElement.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
                }
                else{
                    this.comm = function(){};
                }
            }
        },
        'notify' : function(msg, title, date){
            this.comm('nw.notify', arguments, true);
        },
        'log' : function(obj){
            return this.comm('nw.log', [obj]);
        },
        'logTimed' : function(event, params){
            // todo: add tracking of timed event
        },
        // these are at the end for compilation reasons
        '_onOjLoad' : function(evt){
            this._super(OjPackage, '_onOjLoad', arguments);
            // detect if native
            var url = HistoryManager.get();
            this.isNative = (url.host == 'native.web') ? url.getQueryParam('nw-gateway') : window.__nw_gateway_id__;
                                            },
        '_onOjReady' : function(evt){
            this._super(OjPackage, '_onOjReady', arguments);
            if(this.isNative){
                this._onNativeReady();
            }
            else{
                OJ.addEventListener(OjOrientationEvent.CHANGE, this, '_onOrientationChange');
            }
        },
        // config functions
        '.gateway' : function(){
            return this._gateway;
        },
        '.maxSize' : function(){
            return this.comm('nw.maxSize');
        },
        '=maxSize' : function(width, height){
            return this.comm('nw.maxSize', [width, height]);
        },
        '.minSize' : function(){
            return this.comm('nw.minSize');
        },
        '=minSize' : function(width, height){
            this.comm('nw.minSize', [width, height]);
        },
        '.statusBarStyle' : function(){
            return this.comm('nw.statusBarStyle');
        },
        '=statusBarStyle' : function(val){
            this.comm('nw.statusBarStyle', [val]);
        },
        '.supportedOrientations' : function(){
            return this.comm('nw.supportedOrientations');
        },
        '=supportedOrientations' : function(val){
            this.comm('nw.supportedOrientations', [val]);
        }
    }
);

OJ.extendClass(
	'NwDataEvent', [OjEvent],
	{
		'_get_props_' : {
			'data'    : null,
			'oldData' : null
		},

		'_constructor' : function(type/*, data = null, old_data = null, bubbles = false, cancelable = false*/){
			var cancelable, bubbles = cancelable = false, ln = arguments.length;
			if(ln > 1){
				this._data = arguments[1];
				if(ln > 2){
					this._oldData = arguments[2];
					if(ln > 3){
						bubbles = arguments[3];
						if(ln > 4){
							cancelable = arguments[4];
						}
					}
				}
			}
			this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);
		}
	},
	{
		'CHANGE'      : 'onDataChange',
		'DELETE'      : 'onDataDelete',
		'LOAD'        : 'onDataLoad',
		'SAVE'        : 'onDataSave'
	}
);

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

OJ.extendClass(
    'NwProperty', [OjObject],
    {
        '_props_' : {
            'allowDuplicate' : true,
            'placeholder' : null,
            'defaultValue' : null,
            'flatten' : false,
            'itemRenderer' : OjLabelItemRenderer,
            'label' : null,
            'max' : 1,
            'min' : 0,
            'notes' : null,
            'readCallback' : null,
            'readPermission' : '*',
            'required' : false,
            'unique' : false,
            'weight' : 0,
            'writeCallback' : null,
            'writePermission' : '*'
        },
        '_get_props_' : {
            'name' : null,
            'type': 'TEXT'
        },

        '_constructor' : function(settings){
            this._super(OjObject, '_constructor', []);
            if(settings){
                for(var key in settings){
                    this[key] = settings[key];
                }
            }
        },
        '_exportValue' : function(value, old_value, mode){
            return value;
        },
        '_formatter' : function(func, value/*, old_value, mode*/){
            var ln = arguments.length,
                old_value = ln > 2 ? arguments[2] : null,
                mode = ln > 3 ? arguments[3] : NwData.DEFAULT;
            if(this._max != 1){
                var old_ln = isArray(old_value) ? old_value.length : 0;
                if(!value){
                    return [];
                }
                if(!isArray(value)){
                    return [func.call(this, value, old_ln ? old_value[0] : null, mode)];
                }
                var ary = [];
                for(var i = value.length; i--;){
                    ary.unshift(func.call(this, value[i], i < old_ln ? old_value[i] : null, mode));
                }
                return ary;
            }
            return func.call(this, value, old_value, mode);
        },
        '_getValue' : function(obj, getter){
            var key = this.name;
            if(!getter){
                throw 'Property "' + key + '" get not allowed.'
            }
            var get_func = obj[getter];
            if(get_func){
                return get_func.call(obj);
            }
            return obj._property(key);
        },
        '_importValue' : function(value, old_value, mode){
            return value;
        },
        '_setValue' : function(obj, setter, newValue){
            var key = this.name;
            if(!setter){
                throw 'Property "' + key + '" set not allowed.'
            }
            var set_func = obj[setter];
            if(set_func){
                set_func.call(obj, newValue);
            }
            else{
                obj._property(key, newValue)
            }
            return newValue;
        },
        '_valueIsValid' : function(value){
            return true;
        },

        'exportValue' : function(value, mode){
            return this._formatter(this._exportValue, value, null, mode);
        },
        'importValue' : function(value, old_value, mode){
            return this._formatter(this._importValue, value, old_value, mode);
        },
        'isMultiSelection' : function(){
            return this._max != 1;
        },
        'isOptionalSelection' : function(){
            return this._min == 0 && !this._required;
        },
        'isSingleSelection' : function(){
            return this._max == 1;
        },
        'makeDisplay' : function(){
            var self = this,
                display = new OjValue(self.name, self.label, self.defaultValue);
            display.itemRenderer = self.itemRenderer;
            return display;
        },
        'makeInput' : function(/*input*/){
            var self = this,
                input;
            if(arguments.length && isObjective(input = arguments[0])){
                // don't do anything
            }
            else{
                input = new OjTextInput(self.name, self.label, self.defaultValue);
            }
            input.placeholder = self.placeholder;
            input.required = self.required;
            input.notes = self.notes;
            return input;
        },
        'setup' : function(obj, key){
            // setup the name
            this.name = key;
            // setup the property + getter & setter
            var prop = this,
                getter = '.' + key,
                setter = '=' + key;
            // define property
            Object.defineProperty(obj, key, {
                'configurable': true,
                'enumerable': false,
                'get' : function(){ return prop._getValue(this, getter); },
                'set' : function(newValue){ return prop._setValue(this, setter, newValue); }
            });
        },
        'userCanRead' : function(user, data){
            return this._readPermission && user.hasPermission(this._readPermission) &&
                   (!this._readCallback || this._readCallback(user, data, this));
        },
        'userCanWrite' : function(user, data){
            return this._writePermission && user.hasPermission(this._writePermission) &&
                   (!this._writeCallback || this._writeCallback(user, data, this));
        },
        //'value' : function(obj, val){
        //    var nm = this.name;
        //
        //    if(arguments.length > 1){
        //        return obj._property.call(nm, val);
        //    }
        //    var args = Array.array(arguments);
        //    args.replaceAt(this.name, 0);
        //
        //    return obj._property.apply(obj, args);
        //},
        'valueIsValid' : function(value){
            if(this._max == 1){
                return this._valueIsValid(value) && (!this._min || isSet(value));
            }
            if(!isArray(value)){
                return false;
            }
            var count = 0;
            for(var i = value.length; i--;){
                if(!this._valueIsValid(value[i])){
                    return false;
                }
                count++;
            }
            return !this._min || !(count < this._min);
        },
        '.defaultValue' : function(){
            return OJ.copy(this._defaultValue);
        },
        '=max' : function(val){
            this._max = Math.max(val, 0);
        },
        '=min' : function(val){
            this._min = Math.max(val, 0);
        }
    },
    {
        'BLOB': 'BLOB',
        'DATE': 'DATE',
        'INTEGER': 'INTEGER',
        'NUMERIC': 'NUMERIC',
        'TEXT': 'TEXT'
    }
);

// register special tags for inputs representing the applicable data property
OjStyleElement.registerComponentTag('datainput', function(dom){
    var source = dom.getAttribute('source').split('.');
    dom.removeAttribute('source');
    return OJ.stringToClass(source[0]).DEFINITION[source[1]].makeInput(dom);
});
OjStyleElement.registerComponentTag('datainputs', function(dom){
    var source = dom.getAttribute('source'),
        inputs = OjStyleElement(),
        def = OJ.stringToClass(source).DEFINITION,
        key;
    dom.removeAttribute('source');
    for(key in def){
        inputs.addChild(def[key].makeInput());
    }
    return inputs;
});

OJ.extendClass(
    'NwTextProperty', [NwProperty],
    {
        '_props_' : {
            'minLength' : 0,
            'maxLength' : 255
        },

        '_processValue' : function(value){
            if(value){
                value = String(value);
                if(this._maxLength && value.length > this._maxLength){
                    value = value.substr(0, this._maxLength);
                }
                if(this._minLength && value.length < this._minLength){
                    value = null;
                }
            }
            return value;
        },
        '_valueIsValid' : function(value){
            if(!this._minLength && isNull(value)){
                return true;
            }
            value = String(value);
            return (!this._minLength || value.length >= this._minLength) &&
                   (!this._maxLength || value.length <= this._maxLength);
        },
        'makeInput' : function(/*dom_elm|input*/){
            var self = this,
                args = arguments;
            if(!args.length && self.maxLength > 255){
                args[0] = new OjTextArea(self.name, self.label, self.defaultValue);
                args.length = 1;
            }
            var input = this._super(NwProperty, 'makeInput', args);
            input.minLength = self.minLength;
            input.maxLength = self.maxLength;
            return input;
        },

        '=maxLength' : function(val){
            this._maxLength = Math.max(val, 0);
        },
        '=minLength' : function(val){
            this._minLength = Math.max(val, 0);
        }
    }
);

OJ.extendComponent(
	'NwDataListEditor', [OjItemEditor],
	{
        '_template' : '<div><div var=item></div><div var=actions v-align=m><a var=view_btn on-press=_onViewPress>View</a><a var=edit_btn on-press=_onEditPress>Edit</a><a var=delete_btn on-press=_onDeletePress>Delete</a></div></div>',

        '_onDataChange' : function(evt){
            if(this._item){
                this._item.redraw();
            }
        },
        '_onViewPress' : function(evt){
            var cntlr = this._group.controller;
            if(cntlr){
                cntlr.addView(this._data.makeView());
            }
        },
        '_onEditPress' : function(evt){
            var cntlr = this._group.controller;
            if(cntlr){
                cntlr.addView(this._data.makeForm());
            }
        },
        '=data' : function(data){
            if(this._data == data){
                return;
            }
            // cleanup data change listener
            if(this._data){
                this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }
            // set data
            this._super(OjItemEditor, '=data', arguments);
            // add data change listener
            if(this._data){
                this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }
        },
        '.itemRenderer' : function(){
            return this._data ? this._data.oj_class.ITEM_RENDERER : this._itemRenderer;
        }
	}
);
OJ.extendClass(
	'NwDataErrorEvent', [OjErrorEvent],
	{
		'_get_props_' : {
			'data'    : null
		},

		'_constructor' : function(type/*, data, text = null, code = 0, bubbles = false, cancelable = false*/){
			var args = Array.array(arguments),
				ln = args.length;
			if(ln > 1){
				this._data = args[1];
				args.removeAt(1);
			}
			this._super(OjErrorEvent, '_constructor', args);
		}
	},
	{
		'DELETE' : 'onDataDeleteError',
		'LOAD'   : 'onDataLoadError',
		'SAVE'   : 'onDataSaveError'
	}
);

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
OJ.extendClass(
	'NwDataListItem', [OjListItem],
	{
        '_destructor' : function(/*depth = 0*/){
            if(this._data && this._data.is && this._data.is('NwData')){
                this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }
            return this._super(OjListItem, '_destructor', arguments);
        },
		'_redrawData' : function(){
            if(this._super(OjListItem, '_redrawData', arguments)){ // we are intentionally skipping OjListItem super
                var txt, icon;
                if(this._data){
                    txt = this._data.title();
                    icon = this._data.icon();
                }
                this.content.text = txt;
                this.icon.source = icon;
                return true;
            }
            return false;
		},
        '=data' : function(val){
            if(this._data && this._data.is && this._data.is('NwData')){
                this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }
            this._super(OjListItem, '=data', arguments);
            if(this._data && this._data.is && this._data.is('NwData')){
                this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }
        }
	}
);

OJ.extendClass(
    'NwData', [OjActionable],
    {
        // Compiler Functions
        '_post_compile_' : function(cls, proto){
            NwData.registerDataType(cls.TYPE, proto._class_name);
            var def = cls.DEFINITION,
                e_map = cls.EXPORT_MAP,
                i_map = (cls.IMPORT_MAP = Object.clone(cls.IMPORT_MAP)),
                key;
            // setup the definition
            for(key in def){
                // setup the data functions for the property
                def[key].setup(proto, key);
            }
            // make sure the import/export map is synced
            for(key in e_map){
                i_map[e_map[key]] = key;
            }
            cls._BACKLOG = [];
            cls._CACHE = {};
        },

        // Properties & Variables
//		'_data' : null,  '_dirty' : null,  '_keyword_cache' : null,

        // Construction & Destruction Functions
        '_constructor' : function(/*data, mode*/){
            this._super(OjActionable, '_constructor', []);
            this._data = {};
            var def = this._static.DEFINITION,
                key;
            // setup the definition
            for(key in def){
                this._data[key] = def[key].defaultValue;
            }
            this._dirty = {};
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
        '_addToDirty' : function(prop, val){
            if(!this._dirty[prop]){
                var val = this._data[prop];
                if(isArray(val) || (isObjective(val) && val.is(OjArray))){
                    val = val.clone();
                }
                this._dirty[prop] = val;
            }
            else if(val == this._dirty[prop]){
                delete this._dirty[prop];
            }
        },
        '_exportProp' : function(prop, mode){
            return true;
        },
        '_exportValue' : function(prop, mode, value){
            value = isUndefined(value) ? this._data[prop] : value;
            if(this._static.hasProperty(prop)){
                return this._static.DEFINITION[prop].exportValue(value, mode);
            }
            return value;
        },
        '_getProp' : function(key, prop, getter){
            if(!getter){
                throw 'Property "' + key + '" get not allowed.'
            }
            var self = this,
                get_func = self[getter];
            if(get_func){
                return get_func.call(self);
            }
            return self[prop];
        },
        '_importValue' : function(prop, value, mode){
            var self = this,
                cls = self._static;
            if(cls.hasProperty(prop)){
                value = cls.DEFINITION[prop].importValue(value, self[prop], mode);
                this._property(prop, value);
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
        '_property' : function(prop, val){
            var self = this,
                args = arguments,
                prev = self._data[prop];
            if(args.length > 1){
                var cls = self._static,
                    def = cls.DEFINITION,
                    evt = NwDataEvent;
                if(!def || !def[prop]){
                    throw new Error();
                }
                if(prev != (val = def[prop].importValue(val, prev, NwData.DEFAULT))){
                    // if key update the cache
                    if(prop == cls.KEY){
                        self._updateCache(prev, val);
                    }
                    // update the dirty flag
                    self._addToDirty(prop, val);
                    self._data[prop] = val;
                    if(def[prop].is(NwTextProperty)){
                        self._keyword_cache[prop] = val ? val.toString().toLowerCase() : null;
                    }
                    self.dispatchEvent(new evt(evt.CHANGE, val, prev));
                }
            }
            return prev;
        },
        '_setProp' : function(key, prop, setter, newValue){
            if(!setter){
                throw 'Property "' + key + '" set not allowed.'
            }
            var self = this,
                set_func = self[setter];
            if(set_func){
                set_func.call(self, newValue);
            }
            else{
                self[prop] = newValue;
            }
            return newValue;
        },
        '_updateCache' : function(old_id, new_id){
            old_id = this._static.key(old_id);
            new_id = this._static.key(new_id);
            if(old_id){
                delete this._static._CACHE[old_id];
            }
            if(new_id){
                this._static._CACHE[new_id] = this;
            }
        },
        // Event Functions
        '_onLoad' : function(evt){
            this.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD));
            this._static.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD, this));
        },
        '_onSave' : function(evt){
            this.dispatchEvent(new NwDataEvent(NwDataEvent.SAVE, this));
            this._static.dispatchEvent(new NwDataEvent(NwDataEvent.SAVE, this));
        },
        // Utility Functions
        'clone' : function(){
            var obj = this._super(OjActionable, 'clone', []);
            obj.importData(this._data, NwData.CLONE);
            return obj;
        },
        'del' : function(){
            // todo: add delete from class cache
        },
        // todo: check into the exporting of the object type property
        'exportData' : function(mode){
            mode = mode ? mode : NwData.DEFAULT;
            var key, mkey, obj, prop, val,
                cls = this._static,
                is_default = mode == NwData.DEFAULT,
                map = cls.EXPORT_MAP;
            if(is_default){
                obj = this._super(OjActionable, 'exportData', arguments);
            }
            else{
                obj = {};
                if(!this.isNew()){
                    obj[cls.KEY] = this.key();
                }
            }
            for(key in this._data){
                if(is_default || this._exportProp(key, mode)){
                    val = this._exportValue(key, mode);
                    // if the value is an object then we need to check the flatten property flag
                    if(isObject(val) && (prop = cls.getProperty(key)).flatten){
                        for(key in val){
                            if(key == cls.DATA_KEY){
                                continue;
                            }
                            mkey = prop.namespace + '.' + key;
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
        'icon' : function(){
            return null;
        },
        'importData' : function(data/*, mode*/){
            var prop,
                mode = arguments.length > 1 ? arguments[1] : NwData.DEFAULT,
                map = this._static.IMPORT_MAP,
                key = this._static.KEY;
            for(prop in data){
                if(mode == NwData.CLONE && prop == key){
                    continue;
                }
                this._importValue(map[prop] ? map[prop] : prop, data[prop], mode);
            }
        },
        'isDirty' : function(/*flag*/){
            if(arguments.length && arguments[0] == false){
                this._dirty = {};
            }
            return !isEmptyObject(this._dirty);
        },
        'isNew' : function(){
            return isEmpty(this.key());
        },
        'key' : function(val){
            var self = this,
                key = self._static.KEY;
            if(isSet(val)){
                self[key] = val;
            }
            return self[key];
        },
        'load' : function(){
            this._onLoad(null);
        },
        'keywordScore' : function(keyword){
            var keywords = [], score = 0;
            if(isArray(keyword)){
                keywords = keyword;
            }
            else{
                keywords.append(keyword);
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
        'makeForm' : function(){
            var form = new this._static.FORM_RENDERER()
            form.data = this;
            if(this.isNew()){
                form.title = 'Create ' + this._static.title;
                form.submitLabel = 'Create';
            }
            else{
                form.title = 'Edit: ' + this.title;
                form.submitLabel = 'Save';
            }
            return form;
        },
        'makeView' : function(){
            var view = new this._static.VIEW_RENDERER();
            view.title = 'View: ' + this.title;
            view.data = this;
            return view;
        },
        'reset' : function(){
            var key;
            for(key in this._dirty){
                this._data[key] = this._dirty[key];
                // todo: figure out how to trigger the change event
            }
            this._dirty = {};
        },
        'save' : function(){
            this._onSave(null);
        },
        'title' : function(){
            return null;
        }
    },
    {
        'CLONE' : 'clone',
        'DEFAULT' : 'default',
        // Data Definition
        'DEFINITION' : {
            'id' : new NwTextProperty()
        },
        'KEY' : 'id',
        'ORDER_KEY' : null,
        'DATA_KEY' : '_class_name',
        'TYPE' : 'Data',
        // Property Maps
        'EXPORT_MAP' : {},
        'IMPORT_MAP' : {},
        // Renderers
        'FORM_RENDERER' : NwDataForm,
        'ITEM_EDITOR' : NwDataListEditor,
        'ITEM_RENDERER' : NwDataListItem,
        'VIEW_RENDERER' : NwDataView,
        // Static Protected Functions
        '_CACHE' : {},
        '_TYPES' : {},
        // Static Public Functions
        'addEventListener' : function(type, context, callback){
            EventManager.addEventListener(this, type, context, callback);
        },
        'all' : function(){
            return this._CACHE;
        },
        'dispatchEvent' : function(evt){
            if(this._prevent_dispatch){
                return;
            }
            EventManager.dispatchEvent(this, evt);
        },
        'get' : function(id, auto_create){
            var c = this,
                data;
            id = this.key(id);
            if(!this._CACHE[id] && auto_create){
                data = new c();
                data.key(id);
            }
            return this._CACHE[id];
        },
        'getProperty' : function(prop){
            return this.DEFINITION[prop];
        },
        'has' : function(id){
            return isSet(this._CACHE[this.key(id)]);
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
        'importData' : function(data, mode){
            var ln;
            if(!mode){
                mode = NwData.DEFAULT;
            }
            if(isArray(data)){
                ln = data.length;
                for(; ln--;){
                    data[ln] = this.importData(data[ln], mode);
                }
                return data;
            }
            if(isObject(data)){
                var c = data[NwData.DATA_KEY] ? this.typeToClass(data[NwData.DATA_KEY]) : this;
                if(c){
                    var obj, id = this.key(data[c.KEY]);
                    if(id && c._CACHE[id]){
                        obj = c._CACHE[id];
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
        'key' : function(val){
            return val;
        },
        'registerDataType' : function(type, class_name){
            NwData._TYPES[type] = class_name;
        },
        'removeAllListeners' : function(){
            return EventManager.removeAllListeners(this);
        },
        'removeEventListener' : function(type, context, callback){
            EventManager.removeEventListener(this, type, context, callback);
        },
        'sortedDefinition' : function(){
            if(!this.SORTED_DEFINITION){
                this.SORTED_DEFINITION = {};
                var key, ln = 0, index = [];
                for(key in this.DEFINITION){
                    index.append([key, this.DEFINITION[key].weight]);
                    ln++;
                }
                index.sort(function(a, b){
                    return a[1] - b[1]
                });

                for(var i = 0; i < ln; i++){
                    key = index[i][0];
                    this.SORTED_DEFINITION[key] = this.DEFINITION[key];
                }
            }
            return this.SORTED_DEFINITION;
        },
        'title' : function(){
            return this.TYPE;
        },
        'typeToClass' : function(type){
            if(NwData._TYPES[type]){
                type = NwData._TYPES[type];
            }
            return OJ.stringToClass(type);
        }
    }
);

OJ.defineClass(
    'NwIPersistentData',
    {
        '_is_loaded' : false,

        'del' : function(){
        },
        'isLoaded' : function(){
            return this._is_loaded || this.isNew();
        },
        'load' : function(){
        },
        'save' : function(){
        }
    },
    {
        'get' : function(){
        },
        'search' : function(){
        }
    }
);


OJ.extendClass(
	'NwDateProperty', [NwProperty],
	{
//		'_max_date' : null,  '_min_date' : null,
        '_type' : NwProperty.DATE,
		'_importValue' : function(value){
			if(value && !isDate(value)){
                if(isObject(value) && value.__type__ == 'date'){
                    value = value.data;
                }
				value = new Date(value);
			}
			if(this._max_date && value > this._max_date){
				value = new Date(this._max_date.getTime());
			}
			if(this._min_date && value < this._min_date){
				value = new Date(this._min_date.getTime());
			}
			return value;
		},
		'_valueIsValid' : function(value){
			return isDate(value) &&
				(!this._min_date || value >= this._min_date) &&
				(!this._max_date || value >= this._max_date);
		},
		'.maxLength' : function(){
			return this._max_date;
		},
		'=maxLength' : function(val){
			this._max_date = !this._min_date || val > this._min_date ? val : this._min_date;
		},
		'.minDate' : function(){
			return this._min_date;
		},
		'=minDate' : function(val){
			this._min_date = !this._max_date || val < this._max_date ? val : this._max_date;
		}
	}
);

OJ.extendClass(
	'NwNumberProperty', [NwProperty],
	{
        '_props_' : {
            'maxValue' : null,
            'minValue' : null,
            'rouding' : 'round', // NwNumberProperty.ROUND
            'step' : 0
        },
        '_type': NwProperty.NUMERIC,

		'_importValue' : function(value){
			if(!isNumber(value)){
				value = parseFloat(value);
			}
			if(isSet(this._minValue)){
				value = Math.max(this._minValue, value);
			}
			if(isSet(this._maxValue)){
				value = Math.min(this._maxValue, value);
			}
			if(this._step){
				// todo: add logic for making sure the value is in step ;-)
			}
			if(this._type == NwProperty.INTEGER){
				value = this._round(value);
			}
			return value;
		},
		'_round' : function(value){
			if(this._rounding == NwNumberProperty.CEIL){
				return Math.ceil(value);
			}
			if(this._rounding == NwNumberProperty.FLOOR){
				return Math.floor(value);
			}
			return Math.round(value);
		},
		'_valueIsValid' : function(value){
			if(
				!isNumber(value) ||
					(this._type == NwProperty.INTEGER && !isInt(value)) ||
					(isSet(this._minValue) && value < this._minValue) ||
					(isSet(this._maxValue) && value > this._maxValue)
				){
				return false;
			}
			// todo: add step validation
			return true;
		},
        '=type' : function(){
            throw new Error('Cannot set NwNumberProperty type.');
        }
	},
	{
		'CEIL'  : 'ceil',
		'FLOOR' : 'floor',
		'ROUND' : 'round'
	}
);

OJ.extendClass(
    'NwIntegerProperty', [NwNumberProperty], {
        '_type' : NwProperty.INTEGER,
        '=type' : function(){
            throw new Error('Cannot set number type on NwIntProperty.');
        }
    }
);

OJ.defineClass(
    'NwIUser',
    {
        'hasPermission' : function(perm){
            if(perm == '*' || this.isAdmin()){
                return true;
            }
            var roles = this.roles;
            if(roles){
                for(var i = roles.length; i; i--){
                    if(AppManager.roleHasPermission(roles[i], perm)){
                        return true;
                    }
                }
            }
            return false;
        },
        'isAdmin' : function(){
            return AppManager.userIsAdmin(this);
        }
    }
);
OJ.extendClass(
	'NwUser', [NwData, NwIUser],
    {},
	{
		'DEFINITION' : {
			'id'            : new NwIntegerProperty(),
			'name'          : new NwTextProperty(),
			'roles'         : new NwTextProperty({ 'max': 0 })
		},
		'TYPE' : 'User',
        'ADMIN': 'admin'
	}
);

OJ.extendClass(
	'NwSession', [OjActionable],
	{
		'_props_' : {
			'data'  : null,
			'token' : null,
			'user'  : null
		},
        '_get_props_' : {
            'isLoggedIn' : null
        },

		'_constructor' : function(/*token, data*/){
			this._super(OjActionable, '_constructor', []);
			this._data = {};
			var ln = arguments.length;
			if(ln){
				this.token = arguments[0];
				if(ln > 1){
					this.data = arguments[1];
				}
			}
		},

		// Utility Functions
		'exportData' : function(){
			var self = this,
                obj = self._super(OjActionable, 'exportData', arguments),
                data = self.data,
                user = self.user;
			obj.data = data ? OjObject.exportData(data) : {};
			obj.token = self._token;
            obj.user = user ? user.exportData() : null;
			return obj;
		},
		'importData' : function(obj){
            var self = this;
			self.data = obj && obj.data ? OjObject.importData(obj.data) : {};
			self.token = obj && obj.token ? obj.token : null;
			self.user = obj && obj.user ? self._static.USER_CLASS.importData(obj.user) : null;
            this.save()
		},
        '.isLoggedIn' : function(){
            return !isEmpty(this._token) && !isEmpty(this._user) && this._user.key()
        },
		'save' : function(){
			this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
		},

		// Getter & Setter Functions
		'get' : function(key){
			return this._data[key];
		},
		'set' : function(key, val){
			if(this._data[key] == val){
				return;
			}
			this._data[key] = val;
			this.save();
		},
		'unset' : function(key){
			delete this._data[key];
			this.save();
		},

		'=data' : function(val){
			if(this._data == val){
				return;
			}
			this._data = val ? val : {};
			this.save();
		},
		'=token' : function(val){
			if(this._token == val){
				return;
			}
			this._token = val;
			this.save();
		},
        'newUser' : function(data){
            this._static.newUser(data);
        },
		'=user' : function(val){
			if(this._user == val){
				return;
			}
			this._user = val;
			this.save();
		}
	},
    {
        'USER_CLASS' : NwUser,
        'newUser' : function(data){
            var cls = this.USER_CLASS;
            return data ? cls.importData(data) : new cls();
        }
    }
);


OJ.extendClass(
	'NwActionCard', [OjAlert],
	{
		'_props_' : {
			'actions'       : null,
			'allowMultiple' : false
		},
		'_template' : '<div><div var=underlay></div><div var=pane><div var=actions><label var=title></label><button var=destroyBtn on-press=_onDestroyPress>Delete</button></div><button var=cancelBtn on-press=_onCancelPress>Cancel</button></div></div>',

		'_constructor' : function(/*btns, title, cancel_lbl = "Cancel", destroy_lbl = null*/){
            this._super(OjAlert, '_constructor', []);
            this._processArguments(arguments, {
                'actions' : [],
                'title' : null,
                'cancelLabel' : 'Cancel',
                'destroyLabel' : null
            });
		},
		'_destructor' : function(/*depth = 0*/){
			var args = arguments,
				depth = args.length ? args[0] : 0;
			this._unset(['title', 'actions', 'cancelBtn']);
			return this._super(OjModal, '_destructor', arguments);
		},

		'_onActionItemPress' : function(evt){
			if(!this._allowMultiple){
				this.dispatchEvent(new OjAlertEvent(OjAlertEvent.BUTTON_PRESS, evt.index));
				WindowManager.hide(this);
			}
		},
        '_onDestroyPress' : function(evt){
        },

		'=actions' : function(val){
			var actions = this._actions;
			if(actions == val){
				return;
			}
			if(actions){
				actions.parent = null;
				actions.removeEventListener(OjCollectionEvent.ITEM_PRESS, this, '_onActionItemPress');
			}
			this.actions.insertChild(actions = this._actions = val, this.actions.numChildren() - 1);
			if(actions){
				actions.addEventListener(OjCollectionEvent.ITEM_PRESS, this, '_onActionItemPress');
			}
		},
		'.cancelLabel' : function(){
			return this.cancelBtn.label;
		},
		'=cancelLabel' : function(val){
            this.cancelBtn.label = val;
            if(isEmpty(val)){
                this.cancelBtn.hide();
            }
            else{
                this.cancelBtn.show();
            }
		},
		'.cancelIcon' : function(){
			return this.cancelBtn.icon;
		},
		'=cancelIcon' : function(val){
			this.cancelBtn.icon = val;
		},
        '.destroyLabel' : function(){
			return this.destroyBtn.label;
		},
		'=destroyLabel' : function(val){
            this.destroyBtn.label = val;
			if(isEmpty(val)){
                this.destroyBtn.hide();
            }
            else{
                this.destroyBtn.show();
            }
		},
		'.title' : function(){
			return this.title.text;
		},
		'=title' : function(val){
            if(isEmpty(val)){
                this.title.hide();
            }
            else{
                this.title.label = val;
                this.title.show();
            }
		}
	}
);


OJ.extendComponent(
	'NwActionButton', [OjItemRenderer],
	{
		'_template' : '<div><button var=btn></button></div>',

		'_redrawData' : function(){
			if(this._super(OjItemRenderer, '_redrawData', arguments)){
				this.btn.text = this._data;
				return true;
			}
			return false;
		}
	}
);

OJ.extendManager(
    'WindowManager', 'NwWindowManager', [OjWindowManager, NwManager],
    {
        '_props_' : {
            'actionCardClass' : NwActionCard
        },
        '_namespace' : 'nwUi',

        '_actionCard' : function(buttons/*, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
            var args = arguments;
            args[0] = new OjList(buttons, NwActionButton);
            return this.makeActionCard.apply(this, args);
        },
        '_isMobileAC' : function(modal){
            return modal.is(NwActionCard) && OJ.is_mobile;
        },
        '_transIn' : function(modal){
            this._super(OjWindowManager, '_transIn', arguments);
            if(this._isMobileAC(modal)){
                var h = modal.pane.height,
                    y = modal.pane.y;
                modal.pane.y = y + h;
                // transition the modal
                var move = new OjMove(modal.pane, OjMove.Y, y, 250, OjEasing.OUT);
                move.start();
            }
        },
        '_transOut' : function(modal){
            this._super(OjWindowManager, '_transOut', arguments);
            if(this._isMobileAC(modal)){
                var h = modal.pane.height,
                    y = modal.pane.y;
                // transition the modal
                var move = new OjMove(modal.pane, OjMove.Y, y + h, 250, OjEasing.OUT);
                move.start();
            }
        },

        'alert' : function(message, title, buttons, cancel_label){
            if(NW.isNative){
                this._comm('alert', arguments);
            }
            else{
                return this._super(OjWindowManager, 'alert', arguments)
            }
        },
        'actionCard' : function(target, buttons/*, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
            var args = Array.slice(arguments, 1),
                card = this._actionCard.apply(this, args);
            if(NW.isNative){
                this._comm('actions', [
                    card.title, card.cancelLabel, card.destroyLabel, buttons, target.pageRect
                ]);
            }
            else{
                this.show(card);
            }
            return card;
        },
        'browser' : function(url, title/*, width, height*/){
            if(NW.isNative){
                return this._comm('browser', Array.array(arguments));
            }
            return this._super(OjWindowManager, 'browser', arguments);
        },
        'call' : function(phone){
            if(NW.isNative){
                return this._comm('call', Array.array(arguments));
            }
            return this._super(OjWindowManager, 'call', arguments);
        },
        'email' : function(email){
            if(NW.isNative){
                return this._comm('email', [email]);
            }
            return this._super(OjWindowManager, 'email', arguments);
        },
        'makeActionCard' : function(/*actions, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
            return this._actionCardClass.makeNew(arguments);
        },
        'position' : function(modal){
            if(this._isMobileAC(modal)){
                var w = modal.width,
                    h = modal.height,
                    w2 = modal.paneWidth,
                    h2 = modal.paneHeight;
                modal.pane.x = (w - w2) / 2;
                modal.pane.y = h - h2;
                return;
            }
            this._super(OjWindowManager, 'position', arguments);
        },
        'txt' : function(phone, message){
            if(NW.isNative){
                return this._comm('txt', Array.array(arguments));
            }
            return this._super(OjWindowManager, 'txt', arguments);
        }
    }
);


OJ.extendClass(
	'NwUrlLoader', [OjUrlLoader],
	{
		'_async' : true
//        '_is_multipart' : false,
//
//		'_loadMultiPart' : function(){
//			if(NW.isNative){
//				this._is_multipart = true;
//
//				return this._load();
//			}
//
//			this._super(OjUrlLoader, '_loadMultiPart', arguments);
//		},
//
//		'_xhrFormat' : function(){
//			if(this._is_multipart){
//				this._xhr.setRequestHeader('content-type', OjUrlRequest.JSON);
//
//				return;
//			}
//
//			this._super(OjUrlLoader, '_xhrFormat', arguments);
//		},
//
//		'_xhrOpen' : function(){
//			if(this._is_multipart){
//				return this._xhr.open(OjUrlRequest.POST, 'http://native.web/request', this._async);
//			}
//
//			this._super(OjUrlLoader, '_xhrOpen', arguments);
//		},
//
//		'_xhrSend' : function(){
//			if(this._is_multipart){
//				return this._xhr.send(toJson({
//					'url'     : this._request.toString(),
//					'headers' : this._request.getHeaders(),
//					'method'  : this._request.getMethod(),
//					'data'    : this._request.getData(),
//					'files'   : this._request.getFiles()
//				}));
//			}
//
//			this._super(OjUrlLoader, '_xhrSend', arguments);
//		}
	}
);

OJ.extendClass(
	'NwUrlRequest', [OjUrlRequest],
	{
		'_props_' : {
			'priority' : 0,
			'method'   : OjUrlRequest.POST,
			'weight'   : 0
		},
		'_constructor' : function(){
			this._super(OjUrlRequest, '_constructor', arguments);
			this.contentType = OjUrlRequest.JSON;
		}
	}
);


OJ.extendManager(
	'CacheManager', 'NwCacheManager', [OjCacheManager],
	{
		'_is_native' : false,

		'_constructor' : function(manager){
			this._super(OjCacheManager, '_constructor', arguments);
			// determine which set of functions to use based on the systems capabilities
			if(this._is_native = NW.isNative){
//				this.getData = this.getNativeData;
//				this.setData = this.setNativeData;
//				this.unsetData = this.unsetNativeData;
			}
			this._policies = manager._policies;
			this._cache_size = manager._cache_size;
		},

		'getNativeData' : function(key/*, default*/){
		},
		'setNativeData' : function(key, value){
		},
		'unsetNativeData' : function(key){
		}
	}
);


OJ.defineClass(
    'NwIApp',
    {
        '_get_props_' : {
            'db' : null,
            'isLoggedIn' : null,
            'maxWidth' : null,
            'maxHeight' : null,
            'minWidth' : 320,
            'minHeight' : 320,
            'systemBar' : 'appSystemBarDefault', // NwApp.SYSTEM_BAR_DEFAULT
            'url' : null
        },
        '_props_' : {
            'session' : null
        },
        '_ready' : false, '_scale' : 1,  '_api_endpoint' : '', '_api_request_type' : OjUrlRequest.QUERY_STRING,
        '_has_mobile_layout' : false, '_has_tablet_layout' : false,
        '_session_class' : NwSession,
        // the acl object will serve as a first-level permission control system to prevent users from doing things they shouldn't
        // ultimately the final level of permission control should be done on the server side
        //'_acl' : null,
        //
        //'_orientations' : null,  '_timer' : null,  '_api_response_type' : null,

        '_init' : function(){
            // setup the url
            var url = HistoryManager.get();
            this._url = url.protocol + '://' + url.host;
            // mobile settings
            if(
                (OJ.is_mobile && this._has_mobile_layout) ||
                (OJ.is_tablet && this._has_tablet_layout)
                ){
                this._scale = OJ.pixel_ratio;
                OJ.meta('viewport', 'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no');
                OJ.meta('apple-mobile-web-app-capable', 'yes');
            }
            // orientation settings
            if(this._orientations){
                NW.supportedOrientations = this._orientations;
            }
            // size settings
            if(this._minWidth && this._minHeight){
                NW.minSize = [this._minWidth, this._minHeight];
            }
            if(this._maxWidth && this._maxHeight){
                NW.maxSize = [this._maxWidth, this._maxHeight];
            }
            // init with the app manager
            AppManager.init(this);
        },

        // helper functions
        '_buildApiUrl' : function(method){
            var path = String.string(method);
            if(!path){
                path = '/'
            }
            else if(path.charAt(0) != '/'){
                path = '/' + path;
            }
            return this._api_endpoint + path;
        },
        '_login' : function(error){
            if(error){
                this.dispatchEvent(new OjEvent(NwApp.LOGIN_FAIL));
                AppManager.dispatchEvent(new OjEvent(NwApp.LOGIN_FAIL));
            }
            else{
                this.dispatchEvent(new OjEvent(NwApp.LOGIN));
                AppManager.dispatchEvent(new OjEvent(NwApp.LOGIN));
            }
        },
        '_logout' : function(error){
            if(error){
                this.dispatchEvent(new OjEvent(NwApp.LOGOUT_FAIL));
                AppManager.dispatchEvent(new OjEvent(NwApp.LOGOUT_FAIL));
            }
            else{
                this.dispatchEvent(new OjEvent(NwApp.LOGOUT));
                AppManager.dispatchEvent(new OjEvent(NwApp.LOGOUT));
            }
        },
        // event handler functions
        '_onSaveSession' : function(evt){
            CacheManager.setData(this.oj_class_name, this._session);
        },
        '_onSessionChange' : function(evt){
            this._timer.restart();
            try{
                var roles = this._session.user.roles,
                    list = this.cssList,
                    ln = list.length,
                    css;
                // remove old user roles
                for(; ln--;){
                    css = list[ln];
                    if(css.indexOf('user-role-') == 0){
                        list.removeAt(ln);
                    }
                }
                // add new user roles
                ln = roles.length
                for(; ln--;){
                    list.append('user-role-' + roles[ln]);
                }
                this.css = list;
            }
            catch(e){}
        },

        // utility functions
        'apiRequest' : function(endpoint, params, method, async){
            var loader = new NwUrlLoader(
                new NwUrlRequest(
                    this._buildApiUrl(endpoint), params, this._api_request_type, isUndefined(method) ? OjUrlRequest.GET : method
                ),
                isUnset(async) ? true : async
            );
            loader.contentType = this._api_response_type;
            return loader;
        },
        // this gets called by the app manager to let the app know all is ready to go
        'init' : function(){
            // setup the acl
            this._acl = {};
            // setup the session
            this._timer = new OjTimer(100, 1);
            this._timer.addEventListener(OjTimer.COMPLETE, this, '_onSaveSession');
            if(!(this.session = CacheManager.getData(this.oj_class_name))){
                this.session = this.newSession();
            }
            // ready the app visually
            this.redraw();
        },
        'login' : function(){
        },
        'logout' : function(){
        },
        'newSession' : function(data){
            var cls = this._session_class,
                session = new cls();
            if(data){
                session.importData(data);
            }
            if(!session.user){
                session.user = cls.newUser();
            }
            return session;
        },
        'newUser' : function(data){
            return this._session_class.newUser(data);
        },

        // Getter & Setter Functions
        '.isLoggedIn' : function(){
            var session = this.session;
            return session && session.isLoggedIn;
        },
        '=session' : function(val){
            if(this._session != val){
                if(this._session){
                    this._session.removeEventListener(OjEvent.CHANGE, this, '_onSessionChange');
                }
                if(this._session = val){
                    val.addEventListener(OjEvent.CHANGE, this, '_onSessionChange');
                    this._onSessionChange(null);
                }
            }
            return val;
        },
        '=systemBar' : function(value){
            this._systemBar = value;
            if(NwApp.OS == NwApp.IOS){
                var system_bar;
                switch(this._systemBar){
                    case NwApp.SYSTEM_BAR_BLACK:
                        system_bar = 'black';
                        break;
                    case NwApp.SYSTEM_BAR_BLACK_NONE:
                    case NwApp.SYSTEM_BAR_BLACK_TRANS:
                        system_bar = 'black-translucent';
                        break;
                    case NwApp.SYSTEM_BAR_LIGHT:
                        system_bar = 'light'
                        break;
                    default:
                        system_bar = 'default';
                        break;
                }
                OJ.meta('apple-mobile-web-app-status-bar-style', system_bar);
            }
        }
    }
);

OJ.extendClass(
    'NwApp', [OjView, NwIApp],
    {
        '_constructor' : function(/*properties*/){
            this._init();  // this needs to happen first so that the app gets registered with the app manager
            this._super(OjView, '_constructor', arguments);
        }
    },
    {
        // Event Constants
        'LOGIN' : 'onLogin',
        'LOGIN_FAIL' : 'onLoginFail',
        'LOGOUT' : 'onLogout',
        'LOGOUT_FAIL' : 'onLogoutFail',
        // System Bar Constants
        'SYSTEM_BAR_BLACK' : 'appSystemBarBlack',
        'SYSTEM_BAR_BLACK_TRANS' : 'appSystemBarBlackTranslucent',
        'SYSTEM_BAR_DEFAULT' : 'appSystemBarDefault',
        'SYSTEM_BAR_LIGHT' : 'appSystemLight',
        'SYSTEM_BAR_NONE' : 'appSystemBarNone'
    }
);


OJ.extendClass(
    'NwAppMessage', [OjAlert],
    {
        '_props_' : {
            'icon' : null
        },

        '_constructor' : function(){
            var self = this;
            self._super(OjAlert, '_constructor', arguments);
            self.addEventListener(OjUiEvent.PRESS, self, '_onPress');
        },

        '_onPress' : function(evt){
            this.cancel();
        },

        '=icon' : function(val){
            var self = this,
                icn = self.icn;
            if(self._icon == val){
                return;
            }
            if(self._icon = val){
                if(!icn){
                    self.icn = icn = new OjImage();
                    icn.addCss('fa-stack', 'fa-3x', 'icn');
                    icn.prependChild(new OjStyleElement('<i class="fa fa-heart fa-stack-2x"></i>'));
                    self.pane.prependChild(icn);
                }
                icn.source = val;
            }
            else {
                self.unset('icn');
            }
        }
    }
);


OJ.extendManager(
	'AppManager', 'NwAppManager', [OjActionable],
	{
		'_props_' : {
			'session' : null,
			'user' : null
		},
        '_get_props_' : {
            'app' : null,
            'isLoggedIn' : null,
            'ready' : false
        },
		'_oj_ready' : false,
        '_loadings' : [],

        // internal methods
		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);
			// listen for when the OJ is ready
			if(OJ.is_ready){
				this._onOjReady(null);
			}
			else{
				OJ.addEventListener(OjEvent.READY, this, '_onOjReady');
			}
		},

		'_initApp' : function(){
            var self = this,
                app = self.app,
                evt = OjEvent;
			if(self._oj_ready && app && OJ.is_supported && !self._ready){
				self._ready = true;
				// init the app and get the session session
				app.init();
				// let everyone know we are inited
				self.dispatchEvent(new evt(evt.INIT))
			}
		},
		'_onOjReady' : function(evt){
            var self = this;
			if(!self._oj_ready){
				self._oj_ready = true;
				OJ.removeEventListener(OjEvent.READY, self, '_onOjReady');
				self._initApp();
			}
		},

		// public methods
		'init' : function(/*app*/){
			if(arguments.length){
				this._app = arguments[0];
				this._initApp();
			}
			return this;
		},

        // hud methods
        '_num_loading' : 0,
        '_makeAlert' : function(message, title, icon){
            var alrt = new NwAppMessage(message, title);
            alrt.paneWidth = 300;
            alrt.paneHeight = 300;
            // show icon
            if(icon){
                alrt.icon = '@fa fa-inverse fa-stack-1x fa-' + icon;
            }
            return alrt;
        },
        '_showMessage' : function(message, title, icon, duration){
            var self = this,
                alrt = self._message,
                timer = self._alert_timer;
            // cleanup the old
            if(alrt){
                alrt.cancel();
                if(timer){
                    timer.cancel();
                }
            }
            // setup the new
            self._alert = alrt = self._makeAlert(message, title, icon);
            // show new
            alrt.present();
            // setup & start the remove timer
            duration = isUnset(duration) ? 1000 : duration;
            if(duration){
                self._alert_timer = timer = new OjTimer(duration);
                timer.addEventListener(OjTimer.COMPLETE, self, '_onAlertTimerDone');
                timer.start();
            }
            return alrt;
        },
        'hideAllLoading' : function(){
        },
        'hideAllMessages' : function(){
        },
        'hideLoading' : function(){
            var self = this,
                loading = self._loading;
            if(--self._num_loading > 0 || !loading){
                return;
            }
            loading.cancel();
            self._num_loading = 0;
            self._loading = null;
		},
        'hideMessage' : function(){
        },
        'showError' : function(message, title, icon, duration){
            return this.showMessage(message, title || 'Error', icon || 'exclamation', duration);
        },
        'showLoading' : function(message, cancelable){
            var self = this,
                loading = self._loading;
            self._num_loading++;
            if(loading){
                loading.title = message;
            }
            else{
                self._loading = loading = self._makeAlert(null, message || 'Loading', 'circle-o-notch fa-spin');
                loading.present();
            }
            return self._loading;
		},
        'showMessage' : function(message, title, icon, duration){
            return this._showAlert(message, title, icon, duration);
        },
        'showSuccess' : function(message, title, icon, duration){
            return this.showMessage(message, title || 'Success', icon || 'smile-o', duration);
        },

        // app methods
        'apiRequest' : function(){
            var app = this.app;
			if(!app){
				throw new Error('No application initialized.');
			}
			return app.apiRequest.apply(app, arguments);
		},
		'login' : function(){
            var app = this.app;
			return app.login.apply(app, arguments);
		},
		'logout' : function(){
			var app = this.app;
			return app.logout.apply(app, arguments);
		},
        'newSession' : function(data){
            return this.app.newSession(data);
        },
        'newUser' : function(data){
            return this.app.newUser(data);
        },
		'userIsAdmin' : function(/*user*/){
			var user = arguments.length ? arguments[0] : this.user,
			    roles = user ? user.roles : null,
                admin = user.oj_class.ADMIN;
			return roles && roles.contains(admin);
		},

        // app properties
        '.isLoggedIn' : function(){
			return this.app.isLoggedIn;
		},
        '.db' : function(){
            return this.app.db;
        },
		'.session' : function(){
			return this.app.session;
		},
        '=session' : function(val){
            this.app.session = val;
        },
		'.user' : function(){
			var session = this.session;
			return session ? session.user : null;
		},
        '=user' : function(val){
            var session = this.session;
            if(session){
                session.user = val;
            }
        }
	}
);

// register special tags for handeling app components
OjStyleElement.registerComponentTag('app', function(dom){
	var cls = window[dom.getAttribute('class-name')];
	var app = new cls();
	AppManager.init(app);
	return app;
});
OJ.extendClass(
	'NwEvent', [OjEvent],
	{
		'_get_props_' : {
			'data' : null
		},

		'_constructor' : function(type/*, bubbles = false, cancelable = false, data = null*/){
			var ln = arguments.length;
			this._super(OjEvent, '_constructor', ln > 3 ? [].slice.call(arguments, 0, 3) : arguments);
			if(ln > 3){
				this._data = arguments[3];
			}
		}
	}
);


OJ.extendClass(
	'NwRpc', [OjRpc],
	{
		'_get_props_' : {
			'gateway' : null
		},

		'_constructor' : function(url, method, params/*, content_type, async*/){
			this._super(OjRpc, '_constructor', arguments);
			this._request.data.gateway = NW.gateway;
		}
	}
);
OJ.extendClass(
	'NwAnalyticsData', [OjObject],
	{
		'_props_' : {
			'date' : null
		},

		'_constructor' : function(){
			this._super(OjObject, '_constructor', []);
			this.date = new Date();
		}
	}
);

OJ.extendClass(
	'NwAnalyticsAction', [NwAnalyticsData],
	{
		'_props_' : {
			'category' : null,
			'isBounce' : null,
			'params'   : null,
			'name'     : null
		},

		'_constructor' : function(name/*, category, params, is_bounce*/){
			this._super(NwAnalyticsData, '_constructor', []);
			this.name = name;
            this._processArguments(arguments, {
                'category' : undefined,
                'params' : undefined,
                'isBounce' : false
            });
		}
	}
);

OJ.extendClass(
	'NwAnalyticsEvent', [OjEvent],
	{
		'_get_props_' : {
			'data'  : null
		},

		'_constructor' : function(type, data){
			this._super(OjEvent, '_constructor', [type, false, true]);
			this._data = data;
		}
	},
	{
		'ACTION'   : 'onAnalyticsAction',
		'MESSAGE'  : 'onAnalyticsMessage',
		'VIEW'     : 'onAnalyticsView'
	}
);

OJ.extendClass(
	'NwAnalyticsMessage', [NwAnalyticsData],
	{
	}
);

OJ.extendClass(
	'NwAnalyticsView', [NwAnalyticsData],
	{
		'_props_' : {
			'title' : null,
			'path'   : null
		},

		'_constructor' : function(/*path, title*/){
			this._super(NwAnalyticsData, '_constructor', []);
            this._processArguments(arguments, {
                'path' : undefined,
                'title' : undefined
            });
		},

		'=path' : function(val){
			if(this._path == val){
				return;
			}
			if((this._path = val) && val.charAt(0) != '/'){
				this._path = '/' + val;
			}
		}
	}
);

OJ.extendManager(
	'Analytics', 'NwAnalytics', [OjActionable],
	{
		'_constructor' : function(/*manager*/){
			this._super(OjActionable, '_constructor', []);
		},
		'enableEngine' : function(engine){
			engine.enable();
		},
		'disableEngine' : function(engine){
			engine.disable();
		},
		'log' : function(msg){
			this.dispatchEvent(
				new NwAnalyticsEvent(
					NwAnalyticsEvent.MESSAGE,
					new NwAnalyticsMessage(msg)
				)
			);
		},
		'trackEvent' : function(action/*, category, params, is_bounce*/){
			var args = arguments,
				ln = args.length,
				data = new NwAnalyticsAction(action);
			if(ln > 1){
				data.category = args[1];
				if(ln > 2){
					data.params = args[2];
					if(ln > 3){
						data.isBounce = args[3];
					}
				}
			}
			this.dispatchEvent(new NwAnalyticsEvent(NwAnalyticsEvent.ACTION, data));
		},
		'trackView' : function(/*path, title*/){
			var args = arguments,
				ln = args.length,
				data = new NwAnalyticsView();
			if(ln){
				data.path = args[0];
				if(ln > 1){
					data.title = args[1];
				}
			}
			this.dispatchEvent(new NwAnalyticsEvent(NwAnalyticsEvent.VIEW, data));
		}
	}
);

OJ.extendClass(
	'NwAnalyticsEngine', [OjActionable],
	{
		'_queue' : null,  '_processing' : false,

		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);
			this._queue = new OjArray();
			if(!this._static._HAS_LIBRARY){
				this._loadLibrary();
			}
			this._init();
		},

		// utility functions
		'_init' : function(){
		},
		'_loadLibrary' : function(){
			this._static._HAS_LIBRARY = true;
		},
		'_processActionItem' : function(evt){
			return false;
		},
		'_processItem' : function(evt){
			return false;
		},
		'_processQueue' : function(){
			if(this._processing){
				return;
			}
			this._processing = true;
			var ln = this._queue.length,
				item, func;
			for(; ln--;){
				func = '_processItem';
				item = this._queue.getItemAt(ln);
				switch(item.type){
					case NwAnalyticsEvent.ACTION:
						func = '_processActionItem';
					break;
					case NwAnalyticsEvent.MESSAGE:
						func = '_processMessageItem';
					break;
					case NwAnalyticsEvent.VIEW:
						func = '_processViewItem';
					break;
				}
				if(this[func](item)){
					this._queue.removeItemAt(ln);
				}
			}
			this._processing = false;
		},
		'_processMessageItem' : function(evt){
			return false;
		},
		'_processViewItem' : function(evt){
			return false;
		},

		// event listeners
		'_onAnalyticsEvent' : function(evt){
			this._queue.addItemAt(evt, 0);
			this._processQueue();
		},

		// public functions
		'disable' : function(){
			Analytics.removeEventListener(NwAnalyticsEvent.ACTION, this, '_onAnalyticsEvent');
			Analytics.removeEventListener(NwAnalyticsEvent.MESSAGE, this, '_onAnalyticsEvent');
			Analytics.removeEventListener(NwAnalyticsEvent.VIEW, this, '_onAnalyticsEvent');
		},
		'enable' : function(){
			Analytics.addEventListener(NwAnalyticsEvent.ACTION, this, '_onAnalyticsEvent');
			Analytics.addEventListener(NwAnalyticsEvent.MESSAGE, this, '_onAnalyticsEvent');
			Analytics.addEventListener(NwAnalyticsEvent.VIEW, this, '_onAnalyticsEvent');
		},
		'log' : function(){
		},
		'track' : function(event, data){
			this._onAnalyticsEvent(new NwAnalyticsEvent(NwAnalyticsEvent.TACK_EVENT, event, data));
		}
	},
	{
		'_HAS_LIBRARY' : false
	}
);

OJ.extendClass(
	'NwGoogleAnalytics', [NwAnalyticsEngine],
	{
		'_get_props_' : {
			'key' : null,
			'namespace' : null
		},
		'_name' : null,

		'_constructor' : function(key, namespace){
			this._key = key;
			this._namespace = namespace;
			this._super(NwAnalyticsEngine, '_constructor', arguments);
		},
		'_call' : function(){
			var args = arguments;
			if(this._name){
				args[0] = this._name + '.' + args[0];
			}
			window.ga.apply(window.ga, args);
		},
		'_init' : function(){
			var params = {},
				trackers = window.ga.getAll ? window.ga.getAll() : null;
			if(!isEmpty(trackers)){
				params.name = this._name = this.oj_id;
			}
			window.ga('create', this._key, this._namespace, params);
		},
		'_loadLibrary' : function(){
			this._super(NwAnalyticsEngine, '_loadLibrary', []);
			var w = window;
			w.GoogleAnalyticsObject = 'ga';
			w.ga = function(){
				(w.ga.q = w.ga.q || []).append(arguments);
			};
			w.ga.l = 1 * new Date();
			OJ.loadJs('//www.google-analytics.com/analytics.js', true);
		},
		'_processActionItem' : function(evt){
			var action = evt.data,
				category = action.category,
				params = action.params,
				args = {
					'eventCategory'  : category ? category : 'misc',
					'eventAction'    : action.name,
					'nonInteraction' : !action.isBounce
				};
			if(params){
				var key;
				for(key in params){
					args.eventLabel = key;
					args.eventValue = parseInt(params[key]);
					break;
				}
			}
			this._send('event', args);
			return true;
		},
		'_processViewItem' : function(evt){
			var action = evt.data,
				args = {
					'page' : action.path,
					'title' : action.title
				};
			this._send('pageview', args);
			return true;
		},
		'_send' : function(hitType, args){
			args.hitType = hitType;
			this._call('send', args);
		}
//		'_processQueue' : function(){
//			var ln = this._queue.numItems(),
//				item, data;
//
//			for(;ln--;){
//				item = this._queue.getItemAt(ln);
//				data = item.getData();
//
//				this._call(
//					this.getId() + '.send', 'event',
//					data.category ? data.category : 'misc',
//					item.getAction(),
//					data.label ? data.label : null,
//					data.value ? data.value : null,
//					data.isBounce ? data.isBounce : true
//				);
//			}
//		}
	}
);


OJ.extendClass(
	'NwFlowedApp', [NwApp],
	{
		'nav' : null,  '_routing' : null,  'stack' : null,

		'_constructor' : function(){
			this._super(NwApp, '_constructor', arguments);
			// setup the stack
			this.stack = new OjStack(OjStack.SLIDE_HORZ, 250);
			this.stack.addCss('stack');
			this.addChild(this.stack);
			// setup the nav controller
			this.nav = new NwFlowNavController(this.stack);
			this.nav.id = 'nav';
			this.nav.addCss('nav');
			this.insertChild(this.nav, 0);
			// setup the routing
			this._routing = new NwNavRoute('/', 'Home')
		},
		'init' : function(){
			var session = this._super(NwApp, 'init', arguments);
			if(this.nav){
				this.nav.routing = this._routing;
			}
			return session;
		},
		'load' : function(route/*|path*/){
			if(isString(route) || (isObjective(route) && route.is('OjUrl'))){
				this.nav.loadPath(route);
			}
			else{
				this.nav.loadRoute(route);
			}
		}
	}
);


OJ.extendClass(
	'NwTabbedApp', [NwApp],
	{
		'_routing' : null,

		'_constructor' : function(){
			this._super(NwApp, '_constructor', arguments);
			// setup the stack
			if(!this.stack){
				var s = new OjNavStack(OjStack.FADE, 250)
				s.addCss(['stack']);
				this.addChild(this.stack = s);
			}
			this.container = this.stack;
			// setup the nav controller
			if(!this.nav){
				var n = new OjTabNavController();
				n.addCss(['nav']);
				this.addChild(this.nav = n);
			}
			this.nav.addEventListener(OjEvent.CHANGE, this, '_onViewChange');

			// setup the routing
//			this._routing = new NwNavRoute('/', 'Home');
		},
		'_setupNavRouting' : function(){
//			this.nav.setRouting(this._routing);
		},

		'_onViewChange' : function(evt){
		},

		'init' : function(){
			var session = this._super(NwApp, 'init', arguments);
			this.nav.stack = this.stack;
//			this._setupNavRouting();
			return session;
		},
		'load' : function(route/*|path*/){
//			if(isString(route) || (isObjective(route) && route.is('OjUrl'))){
//				this.nav.loadPath(route);
//			}
//			else{
//				this.nav.loadRoute(route);
//			}
		}
	}
);

OJ.extendComponent(
    'NwTray', [OjComponent],
    {
        '_props_' : {
            'actuator' : null,
            'allowSlide' : false,
            'tray' : null
        },
        '_template' : '<div><div var=tray></div><div var=container></div></div>',  '_is_open' : false,
        // '_tray_anim' : null,

        '_constructor' : function(/*actuator, allowSlide = false unless native and mobile*/){
            this._super(OjComponent, '_constructor', []);
            this._processArguments(arguments, {
                'actuator' : undefined,
                'allowSlide' : OJ.is_mobile && NW.isNative
            });
        },

        '_startTrayAnim' : function(tray_amount, content_amount){
            var easing = OjEasing.STRONG_OUT,
                dir = OjMove.X;
            this._stopTrayAnim();
            this._tray_anim = new OjTweenSet(
                new OjMove(this.tray, dir, tray_amount, 250, easing),
                new OjMove(this.container, dir, content_amount, 250, easing)
            );
            this._tray_anim.addEventListener(OjTweenEvent.COMPLETE, this, '_onAnimComplete');
            this._tray_anim.start();
        },
        '_stopTrayAnim' : function(){
            this._unset('_tray_anim');
        },
        '_updateActuatorListeners' : function(action){
            if(this._actuator){
                this._actuator[action + 'EventListener'](OjUiEvent.PRESS, this, '_onActuatorClick');
            }
        },
        '_updateContainerListeners' : function(action){
            this.container[action + 'EventListener'](OjUiEvent.DOWN, this, '_onTrayBlur');
        },
        '_updateDragListeners' : function(action){
            if(this._actuator){
                this._actuator[action + 'EventListener'](OjDragEvent.START, this, '_onActuatorDragStart');
                this._actuator[action + 'EventListener'](OjDragEvent.MOVE, this, '_onActuatorDragMove');
            }
        },

        '_onActuatorClick' : function(evt){
            this.toggleTray();
        },
        '_onActuatorDragMove' : function(evt){
        },
        '_onActuatorDragStart' : function(evt){
        },
        '_onAnimComplete' : function(evt){
            this._stopTrayAnim();
            if(this._callback){
                this._callback();
                this._callback = null;
            }
        },
        '_onTrayBlur' : function(evt){
            this.hideTray();
        },

        'hideTray' : function(callback){
            if(!this._is_open){
                if(callback){
                    callback();
                }
                return;
            }
            this._callback = callback;
            this._startTrayAnim(this.width * -.6, 0);
            this._updateContainerListeners(OjActionable.REMOVE);
            this._is_open = false;
        },
        'showTray' : function(callback){
            if(this._is_open){
                if(callback){
                    callback();
                }
                return;
            }
            this._callback = callback;
            var w = this.width * .6;
            this.tray.width = w;
            this.tray.x = -1 * w;
            this._startTrayAnim(0, w);
            this._is_open = true;
        },

        'toggleTray' : function(/*val*/){
            if(this._is_open){
                this.hideTray();
            }
            else{
                this.showTray();
            }
        },
        '=actuator' : function(val){
            if(this._actuator == val){
                return;
            }
            this._updateActuatorListeners(OjActionable.REMOVE);
            this._updateDragListeners(OjActionable.REMOVE);
            this._actuator = val;
            this._updateActuatorListeners(OjActionable.ADD);
            if(this._allowSlide){
                this._updateDragListeners(OjActionable.ADD);
            }
        },
        '=allowSlide' : function(val){
            if(this._allowSlide == val){
                return;
            }
            this._updateDragListeners((this._allowSlide = val) ? OjActionable.ADD : OjActionable.REMOVE);
        },
        '=tray' : function(val){
            this.tray.removeAllChildren();
            if(this._tray = val){
                this.tray.addChild(val);
            }
        },
        '.trayPosition' : function(){
            return this.container.x;
        },
        '=trayPosition' : function(val){
            var w = this.width * .6;
            this.tray.x = Math.max(Math.min(val - w, 0), -(w));
            this.container.x = Math.min(Math.max(val, 0), w);
//      this._updateContainerListeners(OjActionable.ADD);
        }
    },
    {
        '_TAGS' : ['tray']
    }
);

OJ.extendComponent(
  'NwTrayApp', [NwTray, NwIApp],
  {
    '_constructor' : function(){
      this._super(NwTray, '_constructor', arguments);
      this._init();
    }
	}
);
OJ.extendClass(
    'NwBluetoothDeviceError', [OjEvent], {
        '_get_props_' : {
            'data' : null,
            'device' : null
        },

        '_constructor' : function(type, device, data, bubbles, cancelable){
            this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);
            this._device = device;
            this._data = data;
        }
    },
    {
        'CONNECT' : 'onBluetoothDeviceConnectError',
        'DISCONNECT' : 'onBluetoothDeviceDisconnectError'
    }
);
OJ.extendClass(
    'NwBluetoothError', [OjEvent], {
        '_get_props_' : {
            'data' : null,
            'devices' : null
        },

        '_constructor' : function(type, devices, data, bubbles, cancelable){
            this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);
            this._devices = devices;
            this._data = data;
        }
    },
    {
        'DETECT_DEVICES' : 'onBluetoothDetectDevicesError'
    }
);
OJ.extendClass(
    'NwBluetoothDeviceEvent', [OjEvent], {
        '_get_props_' : {
            'data' : null,
            'device' : null
        },

        '_constructor' : function(type, device, data, bubbles, cancelable){
            this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);
            this._device = device;
            this._data = data;
        }
    },
    {
        'CONNECT' : 'onBluetoothDeviceConnect',
        'DISCONNECT' : 'onBluetoothDeviceDisconnect',
        'RSSI_UPDATE' : 'onBluetoothDeviceRssiUpdate'
    }
);
OJ.extendClass(
    'NwBluetoothEvent', [OjEvent], {
        '_get_props_' : {
            'data' : null,
            'devices' : null
        },

        '_constructor' : function(type, devices, data, bubbles, cancelable){
            this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);
            this._devices = devices;
            this._data = data;
        }
    },
    {
        'DETECT_DEVICES' : 'onBluetoothDetectDevices'
    }
);

OJ.extendManager(
	'BluetoothManager', 'NwBluetoothManager', [NwManager],
	{
        '_namespace' : 'nwBluetooth',  '_notified' : false,
        '_read_callbacks' : {},  '_rssi_callbacks' : {},
        '_get_props_' : {
            'isAvailable' : null
        },

        '_constructor' : function(manager){
            this._super(NwManager, '_constructor', []);
            NW.addEventListener('nwOnBluetoothCharDiscover', this, '_onCharDiscover');
            NW.addEventListener('nwOnBluetoothDataSent', this, '_onDataSent');
            NW.addEventListener('nwOnBluetoothDataReceived', this, '_onDataReceived');
            NW.addEventListener('nwOnBluetoothDetectDevices', this, '_onDetectDevices');
            NW.addEventListener('nwOnBluetoothDeviceConnect', this, '_onDeviceConnect');
            NW.addEventListener('nwOnBluetoothDeviceDisconnect', this, '_onDeviceDisconnect');
            NW.addEventListener('nwOnBluetoothDeviceRssiUpdate', this, '_onDeviceRssiUpdate');
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
        '_onDeviceRssiUpdate' : function(evt){
            var data = evt.data,
                device = NwBluetoothDevice.importData(data.device),
                error = data.error;
            if(device && !error){
                var uuid = device.uuid,
                    rssi = data.rssi;
                debugger;
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



OJ.extendClass(
	'NwBooleanProperty', [NwProperty],
	{
        '_type' : NwProperty.INTEGER,

		'_exportValue' : function(value, old_value, mode){
			return value ? 1 : 0;
		},
		'_processValue' : function(value, old_value, mode){
			return isTrue(value);
		}
	}
);

OJ.extendClass(
	'NwObjectProperty', [NwProperty],
	{
		'_props_' : {
			'namespace' : null
		}
	}
);
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
  var _global = this;
  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;
  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }
  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }
  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }
      return _rnds;
    };
  }
  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;
  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }
  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;
    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });
    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }
    return buf;
  }
  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }
  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html
  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();
  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];
  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;
  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;
  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];
    options = options || {};
    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;
    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();
    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;
    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;
    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }
    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }
    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;
    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;
    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;
    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;
    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;
    // `clock_seq_low`
    b[i++] = clockseq & 0xff;
    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }
    return buf ? buf : unparse(b);
  }
  // **`v4()` - Generate random UUID**
  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;
    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};
    var rnds = options.random || (options.rng || _rng)();
    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }
    return buf || unparse(rnds);
  }
  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;
  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;
    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };
    _global.uuid = uuid;
  }
}).call(this);

OJ.extendClass(
	'NwUuidProperty', [NwProperty],
	{
        '_props_' :{
			'unique' : true
		},
        '_importValue' : function(value, old_value, mode){
            return value ? value.toLowerCase() : null;
        },
        'generate' : function(){
            return this._static.generate();
        },

        '=unique' : function(){
			throw 'Cannot set the uniqueness of a uuid. This is a fixed value.';
		}
    },
    {
        'generate' : function(){
//            if(NW.isNative){
//                // TODO: add native call to generate UUID
//                return NW.call();
//            }
            return uuid.v4().toLowerCase();
        }
    }
);

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


OJ.extendClass(
	'NwMarquee', [OjComponent],
	{
		// properties & vars
		'_props_' : {
			'buttonMode'        : null,
			'interval'          : 0,
			'nextButtonIcon'    : null,
			'nextButtonLabel'   : 'Next >',
			'prevButtonIcon'    : null,
			'prevButtonLabel'   : '< Prev'
		},
		'_template' : '<div><div var=prerender></div><stack var=container></stack></div>',
//		'_timer' : null,  'nextBtn' : null,  'prevBtn' : null,

		// Construction & Destruction Functions
		'_constructor' : function(/*items, transition, item_renderer*/){
			this._super(OjComponent, '_constructor', []);
			var args = arguments,
				ln = args.length;
			// setup the stack
			this.container.allowLooping = true;
			this.container.addEventListener(OjUiEvent.OVER, this, '_onMouseOver');
			this.container.addEventListener(OjUiEvent.OUT, this, '_onMouseOut');
			this.container.addEventListener(OjStackEvent.CHANGE_COMPLETE, this, '_onChange');
			// setup stack
			if(ln){
				if(ln > 1){
					if(ln > 2){
						this.itemRenderer = args[2];
					}
					this.transition = args[1];
				}
				this.items = args[0];
			}
			// setup the timer
			this._timer = new OjTimer(this._interval * 1000, 0);
			this._timer.addEventListener(OjTimer.TICK, this, '_onTimerTick');
			// set the default button mode
			this.buttonMode = NwMarquee.HIDE_BUTTONS;
		},
		'_destructor' : function(){
			this._unset('_timer');
			return this._super(OjComponent, '_destructor', arguments);
		},

		'_setIsDisplayed' : function(displayed){
			if(this._is_displayed == displayed){
				return;
			}
			this._super(OjComponent, '_setIsDisplayed', arguments);
			if(this._is_displayed){
				if(this._timer.isPaused()){
					this.start();
				}
				this.redraw();
			}
			else if(this._timer.isRunning()){
				this._timer.pause();
			}
		},

		// Helper Functions
		'_redrawButtons' : function(){
			if(this._is_displayed){
				if(this.prevBtn){
					this.prevBtn.isDisabled = !this._allowLooping && this._current_index <= 0;
				}
				if(this.nextBtn){
					this.nextBtn.isDisabled = !this._allowLooping && this._current_index >= this.numElms - 1;
				}
				return true;
			}
			return false;
		},

		// Event Handler Functions
		'_onChange' : function(evt){
			var stack = this.container,
				index = evt.index, item;
			this.prerender.children = [
                (item = stack.getElmAt(index - 1)) == stack.active ? null : stack.renderItem(item),
                (item = stack.getElmAt(index + 1)) == stack.active ? null : stack.renderItem(item)
            ];
		},
		'_onTimerTick' : function(evt){
			this.next();
		},
		'_onMouseOut' : function(evt){
			if(this._timer.state == OjTimer.PAUSED){
				this.start();
			}
		},
		'_onMouseOver' : function(evt){
			if(this._timer.isRunning()){
				this._timer.pause();
			}
		},
		'_onNextClick' : function(evt){
			this.next();
		},
		'_onPrevClick' : function(evt){
			this.prev();
		},

		// Utility Functions
		'next' : function(){
			if(this._timer.isRunning()){
				this._timer.restart();
			}
			this.container.next();
		},
		'prev' : function(){
			if(this._timer.isRunning()){
				this._timer.restart();
			}
			this.container.prev();
		},
		'start' : function(){
			if(this._interval){
				this._timer.start();
			}
		},
		'stop' : function(){
			this._timer.stop();
		},

		// Getter & Setter Functions
		'.allowLooping' : function(){
			return this.container.allowLooping;
		},
		'=allowLooping' : function(allow_looping){
			this.container.allowLooping = allow_looping;
			this._redrawButtons();
		},
		'.alwaysTrans' : function(){
			return this.container.alwaysTrans;
		},
		'=alwaysTrans' : function(val){
			return this.container.alwaysTrans = val;
		},
		'=buttonMode' : function(val){
			if(this._buttonMode == val){
				return;
			}
			if(this._buttonMode){
				this.removeCss(this._buttonMode);
			}
			this.addCss([this._buttonMode = val]);
			if(this._buttonMode == this._static.HIDE_BUTTONS){
				this.removeChild(this.prevBtn);
				this.removeChild(this.nextBtn);
			}
			else{
				if(!this.prevBtn){
					this.prevBtn = new OjButton(this._prevButtonLabel, this._prevButtonIcon);
					this.prevBtn.addCss('prevBtn');
					this.prevBtn.addEventListener(OjUiEvent.PRESS, this, '_onPrevClick');
				}
				this.addChild(this.prevBtn);
				if(!this.nextBtn){
					this.nextBtn = new OjButton(this._nextButtonLabel, this._nextButtonIcon);
					this.nextBtn.addCss('nextBtn');
					this.nextBtn.addEventListener(OjUiEvent.PRESS, this, '_onNextClick');
				}
				this.addChild(this.nextBtn);
			}
		},
		'=interval' : function(interval){
			this._interval = interval;
			this._timer.duration = interval * 1000;
		},
		'=isDisabled' : function(val){
			if(this._isDisabled == val){
				return;
			}
			this._super(OjComponent, '=isDisabled', arguments);
			if(this._isDisabled && this._timer.isRunning()){
				this._timer.pause();
			}
			else if(!this._isDisabled && this._timer.isPaused()){
				this.start();
			}
		},
		'.itemRenderer' : function(){
			return this.container.itemRenderer;
		},
		'=itemRenderer' : function(val){
			this.container.itemRenderer = val;
		},
		'.items' : function(){
			return this.container.elms;
		},
		'=items' : function(val){
			this.container.elms = val;
		},
		'=nextButtonIcon' : function(icon){
			if(this._nextButtonIcon == icon){
				return;
			}
			this._nextButtonIcon = icon;
			if(this.nextBtn){
				this.nextBtn.icon = icon;
			}
		},
		'=nextButtonLabel' : function(lbl){
			if(this._nextButtonLabel == lbl){
				return;
			}
			this._nextButtonLabel = lbl;
			if(this.nextBtn){
				this.nextBtn.label = lbl;
			}
		},
		'=prevButtonIcon' : function(icon){
			if(this._prevButtonIcon == icon){
				return;
			}
			this._prevButtonIcon = icon;
			if(this.prevBtn){
				this.prevBtn.icon = icon;
			}
		},
		'=prevButtonLabel' : function(lbl){
			if(this._prevButtonLabel == lbl){
				return;
			}
			this._prevButtonLabel = lbl;
			if(this.prevBtn){
				this.prevBtn.label = lbl;
			}
		},
		'.transition' : function(){
			return this.container.transition;
		},
		'=transition' : function(val){
			return this.container.transition = val;
		}
	},
	{
		// static
		'HIDE_BUTTONS'  : 'hide-buttons',
		'HOVER_BUTTONS' : 'hover-buttons',
		'SHOW_BUTTONS'  : 'show-buttons'
	}
);


OJ.extendClass(
	'NwCarousel', [NwMarquee],
	{
		'_props_' : {
			'viewSize' : 50
		},
		'_allow_loop' : false,  '_current_pos' : 0,  '_index' : null,
		'_offset' : 0,  '_tween' : null,  '_view_offset' : 0,  '_visable_size' : 0,

		'_constructor' : function(/*data, item_renderer*/){
			this._index = {};
			this._super(NwMarquee, '_constructor', arguments);
		},

		'_redrawPosition' : function(pos){
			if(!this._collection){
				return;
			}
			// get all the vars/values needed to make this happen
			var i, index, x, view, start, stop,
				offset = this._offset + this._view_offset,
				max = this._collection.length, elms = this.container.children;
			// calculate which views to show and where they view goes
			if(pos < 0){
				start = Math.ceil((pos - offset) / this._viewSize);
				stop = Math.ceil((pos + offset) / this._viewSize);
			}
			else{
				start = Math.signedCeil((pos - offset) / this._viewSize);
				stop = Math.signedCeil((pos + offset) / this._viewSize);
			}
			for(i = start; i < stop; i++){
				if(i < 0){
					if(this._allow_loop){
						x = i * this._viewSize;
						index = (max - 1) + (i % max);
					}
					else{
						index = 0;
						x = 0;
					}
				}
				else if(i < max){
					x = (index = i) * this._viewSize;
				}
				else{
					if(this._allow_loop){
						index = i % max;
					}
					else{
						index = max - 1;
					}
					x = i * this._viewSize;
				}
				if(view = this[index]){
					view.x = x + this._offset - this._view_offset - pos;
					view.width = this._viewSize;
					if(this.container.hasChild(view)){
                        elms.remove(view);
					}
					else{
						view.addEventListener(OjUiEvent.PRESS, this, '_onViewClick');
						this.container.addChild(view);
					}
					// store the index
					this._index[view.id] = i;
				}
			}
			// remove any old views
			i = elms.length;
			while(i--){
				elms[i].removeEventListener(OjUiEvent.PRESS, this, '_onViewClick');
				this.container.removeChild(elms[i]);
			}
			// set the new position as current
			this._current_pos = pos;
		},

		'redraw' : function (){
			if(this._super(NwMarquee, 'redraw', arguments)){
				this._visable_size = this.container.width;
				this._offset = this._visable_size / 2;
				this._view_offset = this._viewSize / 2;
				this._allow_loop = this._visable_size < this.numElms() * this._viewSize;
				this._redrawPosition(this._current_pos);
				return true;
			}
			return false;
		},

		'_onTweenTick' : function(evt){
			this._redrawPosition(evt.value);
		},
		'_onViewClick' : function(evt){
			this.activeIndex = this._index[evt.currentTarget.id];
		},

		'=activeIndex' : function(val){
			var w, h, direction;
			if(this._activeIndex == val && this._active){
				return;
			}
			// if we don't have an active then no need to animate
			if(!this._active){
				this._activeIndex = val;
				this._active = this.getElmAt(val);
				this._redrawPosition(val * this._viewSize);
				return;
			}
			var total = this.numElms;
			// setup the animation here
			this._tween = new OjTween(this._current_pos, (this._current_index = val) * this._viewSize, 300, OjEasing.OUT);
			this._tween.addEventListener(OjTweenEvent.TICK, this, '_onTweenTick');
			val = val % total;
			// set the active
			if(val < 0){
				val = total + val;
			}
			this._activeIndex = val;
			if(this._active = this.getElmAt(val)){
				// start the animation
				this._tween.start();
			}
			else{
				this._activeIndex = -1;
			}
		}
	}
);


OJ.extendClass(
	'NwLayout', [OjActionable],
	{
		'_props_' : {
			'hSpacing' : 0,
			'target'   : null,
			'vSpacing' : 0
		},
		// '_layouts' : null,

		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);
			this._layouts = {};
		},

		'_recalculateLayoutItem' : function(index, item){
			if(this._layouts[index]){
				return this._layouts[index];
			}
			return this._layouts[index] = item.rect;
		},

		'recalculateLayout' : function(index){
			if(!this._target){
				return;
			}
			var i = index, elm, layout, rendered = false,
				ln = this._target.numElms;
			for(; i < ln; i++){
				elm = this._target.renderItemAt(i);
				rendered = !elm.parent;
				if(rendered){
					OJ.render(elm);
				}
				layout = this._recalculateLayoutItem(i, elm);
				if(rendered){
					elm.parent = null;
				}
				elm.x = layout.left;
				elm.y = layout.top;
			}
		},
		'getVisible' : function(rect){
			var ln = this._target.numElms,
				visible = [];
			for(; ln--;){
				if(rect.hitTestRect(this._layouts[ln])){
					visible.append(ln)
				}
			}
			return visible;
		},

		'getItemRectAt' : function(index){
			return this._layouts[index];
		},
		'=target' : function(val){
			if(this._target == val){
				return;
			}
			this._target = val;
			this.recalculateLayout(0);
		}
	}
);

window.NwILayoutable = {
};


OJ.extendClass(
	'NwColumnLayout', [NwLayout],
	{
		'_props_' : {
			'numCols' : 1
		},
		// '_col_widths' : null

		'_constructor' : function(/*num_cols = 1*/){
			this._super(NwLayout, '_constructor', []);
			this._col_widths = [0];
			var args = arguments;
			if(args.length){
				this.numCols = args[0];
			}
		},

		'_recalculateLayoutItem' : function(index, item){
			var layout = this._super(NwLayout, '_recalculateLayoutItem', arguments),
				x, y;
			// detect if this is the first item
			if(!index){
				// if it is then its at (0, 0)
				x = y = 0;
			}
			else{
				var col = index % this._numCols,
					w = !this._col_widths[col] || index < this._numCols ? item.width : this._col_widths[col],
					prev = index < this._numCols ? null : this._layouts[index - this._numCols];
				// store the col width
				this._col_widths[col] = w;
				// calculate the x and y
				x = (col * w) + (col  * this._hSpacing);
				y = prev ? prev.bottom + this._vSpacing : 0;
			}
			// set the x and y for the item
			layout.left = x;
			layout.top = y;
			return layout;
		},

		'=numCols' : function(val){
			val = Math.max(val, 0);
			if(this._numCols == val){
				return;
			}
			this._numCols = val;
			this._col_widths = [];
			for(; val--;){
				this._col_widths.append(0);
			}
			this.recalculateLayout(0);
		}
	}
);


OJ.extendComponent(
	'NwScrollPane', [OjView],
  {
    '_props_' : {
      'layout'      : null,
      'allowScroll' : 'both' // NwScrollPane.BOTH
    },
    '_custom_scroll' : OJ.is_touch_capable && (OJ.is_mobile || OJ.is_tablet),
    '_multiplier' : 2,  '_lastScroll' : 0,
//			'_scrollPosX' : 0,  '_scrollPosX' : 0

    '_constructor' : function(/*layout=new NwColumnLayout(1)*/){
      var args = arguments;
//				if(this._custom_scroll){
//					this._template = 'nw.components.NwScrollPane';
//				}
      this._super(OjView, '_constructor', []);
      // run the collection component setup
      this._setup();
      // figure out what events to listen for
//				if(this._custom_scroll){
////					this.addEventListener(OjDragEvent.START, this, '_onPaneScrollStart');
////					this.addEventListener(OjDragEvent.DRAG, this, '_onPaneScrollMove');
//					this.addEventListener(OjDragEvent.END, this, '_onPaneScrollEnd');
//				}
//				else{
        this.addEventListener(OjScrollEvent.SCROLL, this, '_onPaneScroll');
//				}
              // add a hack for the touch event bug with mobile safari
              if(OJ.is_mobile && OJ.browser == OJ.SAFARI){
                  this.addEventListener(OjUiEvent.PRESS, this, '_onMobileSafariClick');
              }
      // setup the elm function overrides
      this._dims = [];
      this.layout = args.length ? args[0] : new NwColumnLayout();
      if(OJ.is_mobile){
        this._multiplier = 4;
      }
    },
    '_destructor' : function(){
      // run the collection component teardown
      this._teardown();
      this._super(OjView, '_destructor', arguments);
    },

    '_canScrollX' : function(){
      return this._allowScroll == this._static.X || this._allowScroll == this._static.BOTH;
    },
    '_canScrollY' : function(){
      return this._allowScroll == this._static.Y || this._allowScroll == this._static.BOTH;
    },

    '_onPaneScroll' : function(evt){
      var now = (new Date()).getTime();
      if(now - this._lastScroll > 5){
        this._lastScroll = now;
        this.redraw();
      }
    },
    '_onPaneScrollStart' : function(evt){
//				this._scrollX = this.content.getX();
//				this._scrollY = this.content.getY();
    },
    '_onPaneScrollMove' : function(evt){
//				var max_x = this._canScrollX() ? this.getWidth() - this.content.getWidth() : 0,
//					max_y = this._canScrollY() ? this.getHeight() - this.content.getHeight() : 0;
//				print(this._scrollY + evt.getDeltaY(), this.getHeight(), this.content.getHeight());
//				this.content.setX(Math.max(Math.min(this._scrollX + evt.getDeltaX(), 0), max_x));
//				this.content.setY(Math.max(Math.min(this._scrollY + evt.getDeltaY(), 0), max_y));
//
//				this.redraw();
    },
    '_onPaneScrollEnd' : function(evt){
//				print(evt);
    },
          '_onMobileSafariClick' : function(evt){
              // this is a hack for a bug with safari and not registering touches on previously hidden elements
          },

    'addEventListener' : function(type, target, func){
      this._super(OjView, 'addEventListener', arguments);
              this._addItemListener(type);
    },
    'removeEventListener' : function(type, target, func){
      this._super(OjView, 'removeEventListener', arguments);
      this._removeItemListener(type);
    },
    'redraw' : function(){
      if(this._super(OjView, 'redraw', arguments)){
        // redraw the visible items
        var container = this.container,
          y = this.scrollY, h = this.height,
          visible = this._layout.visible = new OjRect(
              this.scrollX - container.x, y - container.y,
              this.width * this._multiplier, h * this._multiplier
          ),
          ln = container.numChildren,
          i;
        // figure which of the existing will stay and go
        for(; ln--;){
          if((i = visible.indexOf(this.indexOfElm(container.getChildAt(ln)))) == -1){
            container.removeChildAt(ln);
          }
          else{
            visible.removeAt(i);
          }
        }
        // add all the new items
        for(ln = visible.length; ln--;){
          container.addChild(this.renderItemAt(visible[ln]));
        }
        // check to see if the footer is visible
        // note: footer needs to be first since we recycle the h var for header
        if(this.footer){
          if(y + h < this.footer.y){
            if(this._footer.parent){
            }
          }
          else{
            this.footer.addChild(this._footer);
            this.footer.height = OjStyleElement.AUTO;
          }
        }
        // check to see if the header is visible
        if(this.header){
          if(y > (h = this.header.height)){
            if(this._header.parent){
              this.header.height = h;
              this.header.removeAllChildren();
            }
          }
          else{
            this.header.addChild(this._header);
            this.header.height = OjStyleElement.AUTO;
          }
        }
        return true;
      }
      return false;
    },

    // Event Handler Functions
    '_onItemAdd' : function(evt){
      this._onItemChange(evt);
    },
    '_onItemChange' : function(evt){
      this._layout.recalculateLayout(evt.index);
      this.container.height = this._layout.getItemRectAt(this.numElms - 1).bottom;
      this.redraw();
    },
    '_onItemMove' : function(evt){
      this._super(OjView, '_onItemMove', arguments);
      this._onItemChange(evt);
    },
    '_onItemRemove' : function(evt){
      this._super(OjView, '_onItemRemove', arguments);
      this._onItemChange(evt);
    },
    '_onItemReplace' : function(evt){
      this._super(OjView, '_onItemReplace', arguments);
      this._onItemChange(evt);
    },

    // getter & setter functions
    '=layout' : function(val){
      if(this._layout == val){
        return;
      }
      (this._layout = val).target = this;
    }
    //,
//			'getScrollX' : function(){
//				return this._custom_scroll ? this.content.getX() * -1 : this._super(OjView, 'getScrollX', arguments);
//			},
//			'setScrollX' : function(val){
//				if(this._custom_scroll){
//					return this.content.setX(-1 * val);
//				}
//
//				this._super(OjView, 'setScrollX', arguments);
//			},
//
//			'getScrollY' : function(){
//				return this._custom_scroll ? this.content.getY() * -1 : this._super(OjView, 'getScrollY', arguments);
//			},
//			'setScrollY' : function(val){
//				if(this._custom_scroll){
//					return this.content.setY(-1 * val);
//				}
//
//				this._super(OjView, 'setScrollY', arguments);
//			}
  },
	{
		'_TAGS' : ['scrollpane'],
		'BOTH' : 'x',
		'X'    : 'x',
		'Y'    : 'y'
	}
);


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
        'DATA_KEY' : '__type__',
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


OJ.extendComponent(
	'NwDataEditor', [NwDataListEditor],
	{
        '_onViewPress' : function(evt){
            evt.cancel();
        },
        '_onEditPress' : function(evt){
            evt.cancel();
        },
        '_onDeleteConfirm' : function(evt){
            if(evt.buttonIndex){
                this._data.del();
            }
        },
        '_onDeletePress' : function(evt){
            evt.cancel();
            var alrt = WindowManager.alert(
                OJ.tokenReplace('Are you sure you want to delete "[%title]"?', 'title', this._data.title()),
                'Confirm Delete', ['Yes'], 'No'
            );
            alrt.addEventListener(OjAlertEvent.BUTTON_PRESS, this, '_onDeleteConfirm');
        }
	}
);


OJ.defineClass(
    'NwISelectDataView',
    {
        '_props_' : {
            'class' : NwApiData
        },
        '_itemRenderer' : NwDataEditor,

        '_selectConstructor' : function(parent, args){
            this._super(parent, '_constructor', args);
            this._load_checkpoints.search = false;
            this.itemRenderer = this._itemRenderer;
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
        '.itemRenderer' : function(){
            return this.selector.itemRenderer;
        },
        '=itemRenderer' : function(val){
            this.selector.itemRenderer = val;
        }
    }
);

OJ.extendClass(
	'NwSelectDataView', [OjView, NwISelectDataView],
    {
        '_template' : '<div><div var=header><textinput var=search_box></textinput></div><div var=container><label var=no_results>No Results Found</label><selector var=selector selection-renderer=OjCheckedOption selection-max=0></selector></div></div>',

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

//
OJ.extendClass(
	'NwSelectDataForm', [OjForm, NwISelectDataView],
    {
        '_props_' : {
            'property' : null
        },
        '_template' : '<div><div class=header><textinput var=search_box></textinput></div><list var=errors item-renderer=OjFormError></list><div var=container><label var=no_results>No Results Found</label><selector var=selector selection-renderer=OjCheckedOption></selector></div><div var=actions class=cf></div></div>',

        '_constructor' : function(){
            return this._selectConstructor(OjForm, arguments);
        },

        '_listeners' : function(type){
            return this._selectListeners(OjForm, arguments);
		},

        '_onSearchSuccess' : function(evt){
            this._super(NwISelectDataView, '_onSearchSuccess', arguments);
            this.selector.value = this._data;
		},

        'load' : function(){
            return this._selectLoad(OjForm, arguments);
        },

        '=class' : function(val){
            if(this._class == val){
                return;
            }
            this._class = val;
            this.selector.itemRenderer = this._class.ITEM_RENDERER;
        },
        '.data' : function(){
            return this.selector.value;
        },
        '=data' : function(val){
            this.selector.value = this._data = val;
        },
        '=property' : function(val){
            if(this._property == val){
                return;
            }
            this._property = val;
            this.selector.selectionMin = this._property.min;
            this.selector.selectionMax = this._property.max;
        }
    }
);

OJ.extendComponent(
	'NwOrderedDataEditor', [OjItemEditor],
	{
        '_template' : '<div><label var=handle class=no-select></label><div var=form></div><div var=actions v-align=m><a var=delete_btn on-press=_onDeletePress>&times;</a></div></div>',
        '_position' : -1,  '_orig_pos' : -1,  '_place_holder' : null,
//        '_prop' : null,

        '_constructor' : function(){
            this._super(OjItemEditor, '_constructor', arguments);
            this.handle.addEventListener(OjDragEvent.START, this, '_onDragStart');
            this.handle.addEventListener(OjDragEvent.DRAG, this, '_onDrag');
            this.handle.addEventListener(OjDragEvent.END, this, '_onDragEnd');
        },
        '_redrawData' : function(){
            // intentionally skip the OjItemEditor _redrawData method because we don't want its functionality
            if(this._super(OjItemRenderer, '_redrawData', arguments)){
                var index = this._group.indexOfElm(this._data),
                    desc;
                if(this._data){
//                    this._data.setIndex(index = this._group.indexOfElm(this._data));
//
//                    desc = this._data.getDescription();
                }
                this.handle.text = index;
//                this.item.setValue(desc);
                return true;
            }
            return false;
        },
        '_onDeletePress' : function(evt){
            // remove the elm
            var group = this._group;
            this._group.removeElm(this._data);
            // redraw the #'s
            group.redraw()
        },
        '_onDragStart' : function(evt){
            var w = this.width,
                h = this.height,
                holder = new OjStyleElement(),
                p = this.parent;
            // setup the place holder
            holder.addCss('ApRecipeStepPlaceHolder')
            holder.width = w;
            holder.height = h;
            // setup the row to drag
            this.width = w;
            this.height = w;
            this.x = this.x;
            this.pageY = evt.pageY + 1;
            this.addCss('drag');
            // setup the position vars
            this._position = this._orig_pos = this._group.indexOfElm(this._data);
            p.replaceChild(this, this._place_holder = holder);
            p.addChild(this);
        },
        '_onDrag' : function(evt){
            var p = this.parent,
                x = this.x,
                y = p.localY(evt.pageY),
                start = this._position,
                stop = 0,
                pos = -1;
            if(this.y > y){
                for(start++; start--;){
                    if(p.container.getChildAt(start).hitTestPoint(x, y)){
                        pos = start;
                        break;
                    }
                }
            }
            else{
                for(stop = p.numElms; start < stop; start++){
                    if(p.container.getChildAt(start).hitTestPoint(x, y)){
                        pos = start;
                        break;
                    }
                }
            }
            this.y = y + 1;
            if(pos > -1 && pos != this._position){
                if(pos > this._position){
                    this._position = pos++;
                }
                else{
                    this._position = pos;
                }
                p.insertChild(this._place_holder, pos);
            }
        },
        '_onDragEnd' : function(evt){
            // remove the place holder
            this._unset('_place_holder');
            // update the group data
            this._group.moveElm(this._data, this._position);
            this._group.redraw();
            // reset vars and elms
            this.width = null;
            this.height = null;
            this.x = null;
            this.y = null;
            this.removeCss('drag');
            this._position = -1;
        },
        '=data' : function(data){
            if(this._data == data){
                return;
            }
            if(this._form){
                this._unset('_form');
            }
            this._super(OjItemEditor, '=data', arguments);
            if(this._data){
                var cls = this._data.oj_class;
                this._prop = cls.getProperty(cls.ORDER_KEY);
                this._form = this._data.makeForm();
                this._form.autoUpdate = true;
                this._form.load();
                this.form.addChild(this._form);
            }
        },
        '.value' : function(){
            return this.item.value;
        },
        '=value' : function(val){
            this.item.value = val;
        }
	}
);

// TODO: this form only works for nested data. it should be make to work for non-nested data as well
OJ.extendComponent(
	'NwOrderedDataForm', [OjForm],
	{
        '_props_' : {
            'parentData' : null,
            'property' : null,
            'submitLabel' : 'Save'
        },
        '_template' : '<div><list var=errors item-renderer=OjFormError></list><elist var=container item-editor=NwOrderedDataEditor></elist><div var=actions class=cf><button on-press=_onAddClick>+ Add</button></div></div>',

        '_constructor' : function(parentData, property){
            this._super(OjForm, '_constructor', []);
            this.property = property;
            this.parentData = parentData;
        },

        '_listeners' : function(type){
			switch(type){
				case 'save':
					return [this.parentData, NwDataEvent.SAVE, NwDataErrorEvent.SAVE];
			}
			return this._super(OjForm, '_listeners', arguments);
		},
        '_unload' : function(){
            this._super(OjForm, '_unload', arguments);
            var ln = this.numElms;
            for(; ln--; ){
                this.getElmAt(ln).reset();
            }
        },
        '_updateFormData' : function(){
            var parent = this.parentData,
                prop = this.property;
            if(prop && parent){
                var data = prop.value(parent),
                ln = data ? data.length : 0,
                elms = [];
                for(; ln--;){
                    elms.unshift(data.getItemAt(ln));
                }
                elms.sort(function(a, b){
                    return a.property(a.oj_class.ORDER_KEY) - b.property(b.oj_class.ORDER_KEY);
                });
                this.container.elms = elms;
            }
        },

        '_onAddClick' : function(evt){
            var cls = this.property.dataClass,
                data = new cls();
            this.addElm(data);
            data.property(data.oj_class.ORDER_KEY, this.numElms);
        },
        '_onSaveFail' : function(){
            this._updateListeners('remove', 'save');
            this._hideOverlay();
            WindowManager.alert('Could not save. Please try again.', 'Save Error');
        },
        '_onSaveSuccess' : function(){
            this._updateListeners('remove', 'save');
            var ln = this.numElms();
            for(; ln--; ){
                this.getElmAt(ln).isDirty(false);
            }
            this._hideOverlay();
            if(this._controller){
                this._controller.removeView(this);
            }
        },
        '_onSubmitClick' : function(evt){
            if(this.submit()){
                var parent = this.parentData,
                    prop = this.property;
                parent.property(prop.name, this.elms);
                if(parent.isNew()){
                    this._onSaveSuccess(null);
                }
                else{
                    this._updateListeners('add', 'save');
                    this._showOverlay('Saving');
                    parent.save(prop.name);
                }
            }
        },

        '=parentData' : function(data){
            if(this._parentData == data){
                return;
            }
            this._parentData = data;
            this._updateFormData();
        },
        '=property' : function(prop){
            if(this._property == prop){
                return;
            }
            this._property = prop;
            this._updateFormData();
        }
	}
);


OJ.extendComponent(
	'NwDataInput', [OjInput],
    {
        '_props_' : {
            'dataClass' : NwData,
            'formRenderer' : NwDataForm,
            'itemEditor' : OjItemEditor,
            'property' : null,
            'selectRenderer' : NwSelectDataForm
        },
        '_template' : '<div><div var=wrapper><label var=label></label><div var=psuedoInput><span var=prefix class=prefix></span><span var=stem><elist var=list on-item-change=_onListChange></elist><label var=dflt>None</label></span><span var=suffix class=suffix></span></div></div><div class=buttons><button var=select_btn on-press=_onSelectClick>@</button><button var=add_btn on-press=_onAddClick>+</button></div></div>',

        '_updateButtons' : function(){
            var max = this._property.max;
            this.add_btn.isDisabled = max && max <= this.list.numElms;
        },
        '_onAddClick' : function(evt){
            var form = new this._formRenderer(),
                controller = this.controller;
            form.data = new this.dataClass();
            form.submitLabel = 'Create';
            form.title = 'Create ' + this._class.title();
            form.addEventListener(NwDataEvent.SAVE, this, '_onAddSave');
            if(controller){
                controller.addView(form);
            }
            else{
                WindowManager.modal(form, form.title, 600, 500);
            }
        },
        '_onAddSave' : function(evt){
            this.list.addElm(evt.currentTarget.data);
            this._updateButtons();
        },
        '_onListChange' : function(evt){
            this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
            this._updateButtons();
        },
        '_onSelectClick' : function(evt){
            var form = new this._selectRenderer(),
                controller = this.controller;
            form.dataClass = this.dataClass;
            form.data = this.list.dataProvider;
            form.property = this._property;
            form.submitLabel = 'Save';
            form.title = 'Select ' + this._class.title();
            form.addEventListener(OjEvent.SUBMIT, this, '_onSelectSave');
            if(controller){
                controller.addView(form);
            }
            else{
                WindowManager.modal(form, form.title, 600, 500);
            }
        },
        '_onSelectSave' : function(evt){
            this.value = evt.currentTarget.data;
        },
        '_redrawValue' : function(){
            var val = OjArray.array(this._value);
            this.list.elms = val;
        },
        '=dataClass' : function(cls){
            if(this._dataClass == cls){
                return;
            }
            this._dataClass = cls;
            this.list.itemRenderer = cls.ITEM_RENDERER;
            // type check class
            var obj = new cls();
            if(obj.is(NwApiData)){
                this.removeCss('no-select');
            }
            else{
                this.addCss('no-select');
            }
        },
        '.itemEditor' : function(){
            return this.list.itemEditor;
        },
        '=itemEditor' : function(val){
            this.list.itemEditor = val;
        },
        '.value' : function(){
            return this.list.elms;
        }
    },
    {
        '_TAGS' : ['datainput']
    }
);

//OJ.extendComponent(
//	'NwInlineReferenceInput', [OjInput],
//	{
//
//    }
//);

OJ.extendComponent(
	'NwOrderedReferenceInput', [OjInput],
	{
        '_props_' : {
            'class' : NwData,
            'formRenderer' : NwOrderedDataForm,
            'itemEditor' : OjItemEditor,
            'property' : null
        },
        '_constructor' : function(){
            this._super(OjInput, '_constructor', arguments);
            this.psuedoInput.addEventListener(OjUiEvent.PRESS, this, '_onInputClick');
        },

        '_redrawValue' : function(){
            if(!this.value){
                this.value = new OjLabel();
                this.stem.addChild(this.value);
            }
            var prop = this.property,
                prop_lbl = prop ? prop.label : 'Available',
                lbl = 'No ' + prop_lbl;
            if(this._value){
                lbl = this._value.length + ' ' + prop_lbl
            }
            this.value.text = lbl;
        },

        '_onDataSave' : function(evt){
            this._value = evt.data.property(this.property.name);
            this._redrawValue();
        },
        '_onInputClick' : function(evt){
            var controller = this.controller;
            if(controller){
                var cls = this.formRenderer,
                    data = this.form.data;
                controller.stack.addElm(new cls(data, this.property));
                data.addEventListener(NwDataEvent.SAVE, this, '_onDataSave');
            }
        }
	}
);

OJ.extendClass(
    'NwDataProperty', [NwObjectProperty],
    {
        '_props_' : {
            'dataClass' : NwData,
            'nested' : false,
            'inline': false,
            'itemEditor' : OjItemEditor,
            'options' : null,
            'ordered' : false
        },

        '_constructor' : function(dataClass/*, properties*/){
            var self = this,
                args = arguments;
            self.dataClass = dataClass;
            self.itemEditor = dataClass.ITEM_EDITOR;
            self.itemRenderer = dataClass.ITEM_RENDERER;
            self._super(NwObjectProperty, '_constructor', args.length > 1 ? [args[1]] : []);
        },

        '_exportSubValue' : function(value, old_value, mode){
            if(value && isObjective(value)){
                return (this._nested || this._flatten) ? value.exportData() : value.key();
            }
            return value;
        },
        '_exportValue' : function(value, old_value, mode){
            if(this._max == 1){
                return this._exportSubValue(value, old_value, mode);
            }
            var ary = [], ln = value ? value.length: 0;
            for(; ln--;){
                ary.unshift(
                    this._exportSubValue(
                        value[ln],
                        old_value,
                        mode
                    )
                );
            }
            return ary;
        },
        '_formatter' : function(func, value/*, old_value, mode*/){
            var ln = arguments.length;
            return func.call(
                this,
                value,
                ln > 2 ? arguments[2] : null,
                ln > 3 ? arguments[3] : NwData.DEFAULT
            );
        },
        '_importSubValue' : function(value, old_value, mode){
            // if the value is null then just return that
            if(!value){
                return null;
            }
            var cls = this.dataClass;
            // if value is of the proper oj class type then return it
            if(isObjective(value) && value.is(cls)){
                return value;
            }
            // if we allow nesting and have an old value then we need to handle this special
            if((this._nested || this._flatten) && old_value){
                if(isObject(value)){
                    old_value.importData(value, mode);
                }
                else{
                    old_value.key(value);
                }
                return old_value;
            }
            return isObject(value) ? cls.importData(value, mode) : cls.get(value, true);
        },
        '_importValue' : function(value, old_value, mode){
            var self = this,
                max = self.max;
            if(max == 1){
                return self._importSubValue(value, old_value, mode);
            }
            var old_ln = old_value ? old_value.length : 0,
                items = old_ln ? old_value : new OjArray();
            if(isObjective(value, OjArray)){
                return value;
            }
            if(isArray(value)){
                var ln = isArray(value) ? value.length : 0;
                ln = max == 0 ? ln : Math.min(ln, max);
                for(; old_ln > ln;){
                    items.removeAt(--old_ln);
                }
                for(; ln--;){
                    if(ln < old_ln){
                        items[ln] = self._importSubValue(value[ln], items[ln], mode);
                    }
                    else{
                        items.insertAt(this._importSubValue(value[ln], null, mode), old_ln);
                    }
                }
                return items;
            }
            if(isObject(value)){
                var key, i;
                for(key in value){
                    i = parseInt(key);
                    if(!max || ary.length < max){
                        if(i < old_ln){
                            items[i] = self._importSubValue(value[key], items[i], mode);
                        }
                        else{
                            items.append(self._importSubValue(value[key], null, mode));
                        }
                    }
                }
                return items;
            }
            return (self.nested || self.flatten) ? old_value : null;
        },
        '_setValue' : function(obj, setter, newValue){
            var self = this,
                key = self.name,
                prev = obj[key],
                d_evt = NwDataEvent,
                c_evt = OjCollectionEvent;
            if(prev == newValue){
                return newValue;
            }
            if(isArray(newValue)){
                arguments[2] = newValue = OjArray.array(newValue);
            }
            self._super(NwObjectProperty, '_setValue', arguments);
            var on_change = 'on' + (self.namespace || key).ucFirst() + 'Change';
            if(prev){
                if(prev.is(NwData)){
                    prev.removeEventListener(d_evt.CHANGE, self, on_change);
                }
                else if(prev.is(OjArray)){
                    prev.removeEventListener(c_evt.ITEM_CHANGE, self, on_change);
                }
            }
            if(newValue){
                if(newValue.is(NwData)){
                    newValue.addEventListener(d_evt.CHANGE, self, on_change);
                }
                else if(newValue.is(OjArray)){
                    newValue.addEventListener(c_evt.ITEM_CHANGE, self, on_change);
                }
            }
        },

        'makeInput' : function(input){
            var options = this.options,
                nm = this.name,
                lbl = this.label,
                dflt_val = this.defaultValue,
                min = this.min,
                itm_edtr = this.itemEditor;
            if(!input){
                if(options){
                    if(this.isSingleSelection()){
                        input = new OjSelector(nm, lbl, dflt_val);
                        input.selectionRenderer = OjRadioOption;
                    }
                    else if(options.length > 10){
                        input = new OjTokenInput(nm, lbl, dflt_val);
                    }
                    else{
                        input = new OjSelector(nm, lbl, dflt_val);
                    }
                    input.itemRenderer = this.itemRenderer;
                }
                else if(this.ordered){
                    input = new NwOrderedReferenceInput(nm, lbl, dflt_val);
                    input.property = this;
                    input.itemEditor = itm_edtr;
                }
//                else if(this.getInline()){
//                    input = new NwInlineReferenceInput(nm, lbl, dflt_val);
//                }
                else{
                    input = new NwDataInput(nm, lbl, dflt_val);
                    input.property = this;
                    input.itemEditor = itm_edtr;
                }
            }
            if(isObjective(input) && input.is(NwDataInput)){
                input.dataClass = this.dataClass;
            }
            else if(input.options){
                input.options = options;
                input.selectionMin = min ? min : (this.required ? 1 : 0);
                input.selectionMax = this.max;
            }
            return this._super(NwProperty, 'makeInput', [input]);
        },
        'setup' : function(obj, key){
            var self = this,
                ns = self.namespace,
                on_change,
                is_sub = (self.nested || self.flatten);
            self._super(NwObjectProperty, 'setup', arguments);
            // default the namespace
            if(!ns){
                self.namespace = ns = key;
            }
            // setup change listener function if one doesn't already exist
            ns = ns.ucFirst();
            on_change = 'on' + ns + 'Change';
            if(!obj[on_change]){
                obj[on_change] = function(evt){
                    if(!evt || !evt.is(NwDataEvent) || is_sub){
                        this._addToDirty(key);
                    }
                };
            }
            //// if we only allow one or don't have a namespace
            //// don't add the extra reference management functions
            //if(this.max == 1 || !ns){
            //    return;
            //}
            //
            //// setup the add function if one doesn't already exist
            //var func;
            //
            //func = 'add' + ns;
            //
            //if(!obj[func]){
            //    obj[func] = function(item){
            //        var items = this[key];
            //
            //        if(!items){
            //            this[key] = items = new OjArray();
            //        }
            //
            //        if(is_sub){
            //            item.addEventListener(NwDataEvent.CHANGE, this, on_change);
            //        }
            //
            //        this._addToDirty(key);
            //
            //        return items.append(item);
            //    };
            //}
            //
            //// setup the addAt function if one doesn't already exist
            //func += 'At';
            //
            //if(!obj[func]){
            //    obj[func] = function(item, index){
            //        var items = this[key];
            //
            //        if(!items){
            //            this.property(key, items = new OjArray());
            //        }
            //
            //        if(is_sub){
            //            item.addEventListener(NwDataEvent.CHANGE, this, on_change);
            //        }
            //
            //        this._addToDirty(key);
            //
            //        return items.addItemAt(item, index);
            //    };
            //}
            //
            //// setup the getAt function if one doesn't already exist
            //func = 'get' + ns + 'At';
            //
            //if(!obj[func]){
            //    obj[func] = function(index){
            //        var items = this.property(key);
            //
            //        if(!items){
            //            return null;
            //        }
            //
            //        return items.getItemAt(index);
            //    };
            //}
            //
            //// setup the has function if one doesn't already exist
            //func = 'has' + ns;
            //
            //if(!obj[func]){
            //    obj[func] = function(item){
            //        var items = this.property(key);
            //
            //        return items ? items.hasItem(item) : false;
            //    };
            //}
            //
            //// setup the indexOf function if one doesn't already exist
            //func = 'indexOf' + ns;
            //
            //if(!obj[func]){
            //    obj[func] = function(item){
            //        var items = this.property(key);
            //
            //        return items ? items.indexOfItem(item) : -1;
            //    };
            //}
            //
            //// setup the num function if one doesn't already exist
            //func = 'num' + OJ.pluralize(ns);
            //
            //if(!obj[func]){
            //    obj[func] = function(){
            //        var items = this.property(key);
            //
            //        return items ? items.length : 0;
            //    };
            //}
            //
            //// setup the remove function if one doesn't already exist
            //func = 'remove' + ns;
            //
            //if(!obj[func]){
            //    obj[func] = function(item){
            //        var items = this.property(key);
            //
            //        if(!items){
            //            return item;
            //        }
            //
            //        if(is_sub){
            //            item.removeEventListener(NwDataEvent.CHANGE, this, on_change);
            //        }
            //
            //        this._addToDirty(key);
            //
            //        return items.removeItem(item);
            //    };
            //}
            //
            //// setup the removeAt function if one doesn't already exist
            //func += 'At';
            //
            //if(!obj[func]){
            //    obj[func] = function(index){
            //        var items = this.property(key);
            //
            //        if(!items){
            //            return null;
            //        }
            //
            //        if(is_sub){
            //            item.removeEventListener(NwDataEvent.CHANGE, this, on_change);
            //        }
            //
            //        this._addToDirty(key);
            //
            //        return items.removeItemAt(index);
            //    };
            //}
        },
        '=dataClass' : function(val){
            if(isString(val)){
                val = OJ.toClass(val);
            }
            if(this._dataClass == val){
                return;
            }
            this._dataClass = val;
        },
        '.itemEditor' : function(){
            return this._itemEditor ? this._itemEditor : this.dataClass.ITEM_EDITOR;
        },
        '.itemRenderer' : function(){
            return this._itemRenderer ? this._itemRenderer : this.dataClass.ITEM_RENDERER;
        }
    }
);

OJ.extendClass(
	'NwEmailProperty', [NwTextProperty],
	{
		'_props_' :{
			'maxLength' : 254,
			'minLength' : 3,
            'unique' : true
		},

		'makeInput' : function(dom){
			var input = new OjEmailInput(this.name, this.label, this.defaultValue);
			input.placeholder = this.placeholder;
			input.required = this.required;
			return input;
		},

		'=maxLength' : function(val){
			throw 'Cannot set the max length of an email. This is a fixed value.';
		},
		'=minLength' : function(val){
			throw 'Cannot set the min length of an email. This is a fixed value.';
		}
	}
);

OJ.extendClass(
	'NwFileProperty', [NwProperty],
	{
        '_props_' : {
            'minSize' : 0,
            'maxSize' : 1
        },

        '_processValue' : function(value){
            if(value){
                if(
                    (this._maxSize && value.size > this._maxSize) ||
                    (this._minSize && value.size < this._minSize)
                ){
                    // throw an error
                }
            }
            return value;
        },
        '_valueIsValid' : function(value){
            if(!this._minSize && isNull(value)){
                return true;
            }
            return (!this._minSize || value.size >= this._minSize) &&
                   (!this._maxSize || value.size <= this._maxSize);
        },
        'makeInput' : function(/*dom_elm|input*/){
            var args = arguments;
            if(!args.length){
                args[0] = new OjFileInput(this._name, this._label);
                args.length = 1;
            }
            var input = this._super(NwProperty, 'makeInput', args);
            input.minSize = this._minLength;
            input.maxSize = this._maxLength;
            input.selectionMax = this._max;
            return input;
        },

        '=maxSize' : function(val){
            this._maxSize = Math.max(val, 0);
        },
        '=minSize' : function(val){
            this._minSize = Math.max(val, 0);
        }
    }
);

OJ.extendClass(
	'NwMediaProperty', [NwFileProperty],
	{
		'_props_' : {
			'formats' : null,
			'missing' : null
		},

		'_constructor' : function(/*settings*/){
			this.formats = [];
			this._super(NwFileProperty, '_constructor', arguments);
		},
        '_getFormatValue' : function(obj, format, getter){
            var self = this,
                key = self.name;
            if(!getter){
                throw 'Property "' + key + '" get not allowed.'
            }
            var get_func = obj[getter];
            if(get_func){
                return get_func.call(obj);
            }
            return self.formatValue(obj, format);
        },
        '_setFormatValue' : function(obj, format, setter, newValue){
            var self = this,
                key = self.name;
            if(!setter){
                throw 'Property "' + key + '" set not allowed.'
            }
            var set_func = obj[setter];
            if(set_func){
                set_func.call(obj, newValue);
            }
            else{
                self.formatValue(obj, format, newValue);
            }
            return newValue;
        },
		'_setupFormatFunc' : function(obj, key, format){
			var prop = this,
                format_key = key + '_' + format,
                getter = '.' + format_key,
				setter = '=' + format_key;
            Object.defineProperty(obj, format_key, {
                'configurable': true,
                'enumerable': false,
                'get' : function(){ return prop._getFormatValue(this, format, getter); },
                'set' : function(newValue){ return prop._setFormatValue(this, format, setter, newValue); }
            });
		},

		'formatValue' : function(obj, format, value){
			var args = arguments,
				is_setter = args.length > 2,
                self = this,
				media = obj[self.name],
                missing = self.missing;
			if(is_setter){
				if(!media){
                    obj[key] = media = {};
				}
				return media[format] = args[3];
			}
			if(!media){
				return null;
			}
			media = media[format];
			if(!media && missing){
				if(isString(missing)){
					return missing;
				}
				media = missing[format];
			}
			return media;
		},
		'setup' : function(obj, key){
            var self = this;
			self._super(NwFileProperty, 'setup', arguments);
            self.formats.forEachReverse(function(item){
                self._setupFormatFunc(obj, key, item);
            });
		}
	}
);

OJ.extendClass(
    'NwOptionProperty', [NwProperty],
    {
        '_props_' : {
            'options' : null
        },

        '_constructor' : function(options /*, properties*/){
            var args = arguments;
            this._super(NwTextProperty, '_constructor', args.length > 1 ? [args[1]] : []);
            this.options = options;
        },

        '_valueIsValid' : function(value){
            return this._options && this._options.indexOf(value) > -1;
        },

        'makeInput' : function(dom){
            var self = this,
                dflt = self.defaultValue,
                input = new OjComboBox(self.name, self.label, dflt, self.options);
            input.placeholder = self.placeholder;
            input.required = self.required;
            if(dflt){
                input.value = dflt;
            }
            return input;
        }
    }
);

OJ.extendClass(
	'NwPasswordProperty', [NwTextProperty],
	{
//        'makeInput' : function(/*dom_elm|input*/){
//            var args = arguments;
//
//            if(!args.length){
//                args[0] = new OjPassword(this._name, this._label, this._defaultValue);
//                args.length = 1;
//            }
//
//            var input = this._super(NwProperty, 'makeInput', args);
//
//            input.setMinLength(this._minLength);
//            input.setMaxLength(this._maxLength);
//
//            return input;
//        }
    }
);

OJ.extendClass(
	'NwTokenProperty', [NwTextProperty],
	{
//		'_props_' :{
//			'maxLength' : 254,
//			'minLength' : 3
//		},

		'makeInput' : function(dom){
			var self = this,
                input = new OjEmailInput(self.name, self.label, self.defaultValue);
			input.placeholder = self.placeholder;
			input.required = self.required;
			return input;
		}
	}
);


OJ.extendClass(
	'NwUrlProperty', [NwTextProperty],
	{}
);

OJ.extendComponent(
	'NwSelector', [OjSelector],
	{
		'_props_' : {
			'summaryRenderer' : null
		},
		'_selectOption' : function(option, data){
			this._super(OjSelector, '_selectOption', arguments);
			if(this.summary){
				this.summary.setData(this._value.clone());
			}
		},
		'_unselectOption' : function(option, data){
			this._super(OjSelector, '_unselectOption', arguments);
			if(this.summary){
				this.summary.data = this._value.clone();
			}
		},

		'_onSummaryClick' : function(evt){
			if(isEmpty(this.options)){
				return;
			}
			WindowManager.show(
				WindowManager.makeActionCard(this.input, this._label)
			);
		},

		'=summaryRenderer' : function(val){
			if(this._summaryRenderer == val){
				return;
			}
			if(this.summary){
				this.stem.replaceChild(this.summary, this.input);
				this._unset('summary');
			}
			if(this._summaryRenderer = val){
				this.stem.replaceChild(this.input, this.summary = new val(this, this._value));
				this.summary.addEventListener(OjUiEvent.PRESS, this, '_onSummaryClick');
			}
		}
	}
)



OJ.extendClass(
	'NwDataItemRenderer', [OjItemRenderer],
	{
		'_onDataChange' : function(evt){
			this._redrawData();
		},
        '_redrawData' : function(){
            if(this._super(OjItemRenderer, '_redrawData', arguments)){
                this.text = this._data ? this._data.title() : '';
                return true;
            }
            return false;
        },

		'=data' : function(data){
			if(this._data){
				this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}
			this._super(OjItemRenderer, '=data', arguments);
			if(this._data){
				this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}
		}
	}
);

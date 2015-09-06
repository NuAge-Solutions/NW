OJ.importJs('nw.views.NwDataView');
OJ.importJs('nw.data.properties.NwProperty');
OJ.importJs('nw.data.properties.NwTextProperty');
OJ.importJs('nw.renderers.NwDataListEditor');
OJ.importJs('nw.form.NwDataForm');
OJ.importJs('nw.renderers.NwDataListItem');


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
            var self = this,
                cls = self._static,
                prop,
                mode = arguments.length > 1 ? arguments[1] : NwData.DEFAULT,
                map = cls.IMPORT_MAP,
                key = cls.KEY;

            for(prop in data){
                if(mode == NwData.CLONE && prop == key){
                    continue;
                }

                self._importValue(map[prop] ? map[prop] : prop, data[prop], mode);
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
                var ary = [];

                ln = data.length;

                for(; ln--;){
                    ary.prepend(this.importData(data[ln], mode));
                }

                return ary;
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
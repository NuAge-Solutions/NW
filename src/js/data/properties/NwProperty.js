OJ.importJs('oj.data.OjObject');
OJ.importJs('oj.dom.OjElement');


OJ.extendClass(
    'NwProperty', [OjObject],
    {
        '_props_' : {
            'allowDuplicate' : true,
            'placeholder' : null,
            'defaultValue' : null,
            'flatten' : false,
            'item_renderer' : OjLabelItemRenderer,
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
            var self = this,
                key;

            self._super(OjObject, '_constructor', []);

            if(settings){
                for(key in settings){
                    self[key] = settings[key];
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

            display.item_renderer = self.item_renderer;

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
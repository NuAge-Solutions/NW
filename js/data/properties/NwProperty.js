OJ.importJs('oj.data.OjObject');
OJ.importJs('oj.dom.OjElement');


'use strict';

OJ.extendClass(
	OjObject, 'NwProperty',
	{
		'_props_' : {
			'default'         : null,
			'defaultValue'    : null,
			'label'           : null,
			'max'             : 1,
			'min'             : 0,
			'readCallback'    : null,
			'readPermission'  : '*',
			'required'        : false,
			'writeCallback'   : null,
			'writePermission' : '*'
		},

		'_get_props_' : {
			'name' : null
		},


		'_constructor' : function(/*settings*/){
			this._super('NwDataProperty', '_constructor', []);

			if(arguments.length){
				var key, func, settings = arguments[0];

				for(key in settings){
					func = 'set' + key.ucFirst();

					if(isFunction(this[func])){
						this[func](settings[key]);
					}
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

		'_importValue' : function(value, old_value, mode){
			return value;
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

		'makeInput' : function(/*dom_elm|input*/){
			var input;

			if(arguments.length && isObjective(input = arguments[0])){
				// don't do anything
			}
			else{
				OJ.importJs('oj.form.OjTextInput');

				input = new OjTextInput(this._name, this._label, this._defaultValue);
			}

			input.setDefault(this._default);
			input.setRequired(this._required);

			return input;
		},

		'setup' : function(obj, key, u_key){
			// setup the name
			this._name = key;


			// setup the getter & setter
			var getter = 'get' + u_key,
				setter = 'set' + u_key;

			// setup the getter function if one doesn't already exist
			if(!obj[getter]){
				obj[getter] = function(){
					return this._static.getProperty(key).value(this, key);
				};
			}

			// setup the setter function if one doesn't already exist
			if(!obj[setter]){
				obj[setter] = function(val){
					this._static.getProperty(key).value(this, key, val);
				};
			}
		},

		'userCanRead' : function(user, data){
			return this._readPermission && user.hasPermission(this._readPermission) &&
				(!this._readCallback || this._readCallback(user, data, this));
		},

		'userCanWrite' : function(user, data){
			return this._writePermission && user.hasPermission(this._writePermission) &&
				(!this._writeCallback || this._writeCallback(user, data, this));
		},

		'value' : function(obj, key/*, val*/){
			var args = arguments;

			return obj.property.apply(obj, Array.array(args).slice(1));
		},

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


		'setMax' : function(val){
			this._max = Math.max(val, 0);
		},

		'setMin' : function(val){
			this._min = Math.max(val, 0);
		}
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
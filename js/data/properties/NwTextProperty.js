OJ.importJs('nw.data.properties.NwProperty');


'use strict';

OJ.extendClass(
	NwProperty, 'NwTextProperty',
	{
		'_props_' : {
			'minLength' : 0,
			'maxLength' : 255
		},


		'_processValue' : function(value){
			if(!isString(value)){
				value = String(value);
			}

			if(this._maxLength && value.length > this._maxLength){
				value = value.substr(0, this._maxLength);
			}

			if(this._minLength && value.length < this._minLength){
				value = null;
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
			var input = this._super('NwTextProperty', 'makeInput', arguments);

			input.setMinLength(this._minLength);
			input.setMaxLength(this._maxLength);

			return input;
		},


		'setMaxLength' : function(val){
			this._maxLength = Math.max(val, 0);
		},

		'setMinLength' : function(val){
			this._minLength = Math.max(val, 0);
		}
	}
);
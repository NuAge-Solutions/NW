OJ.importJs('nw.data.properties.NwProperty');


'use strict';

OJ.extendClass(
	'NwNumberProperty', [NwProperty],
	{
		'_max_value' : null,  '_min_value' : null,

		'_rounding' : 'round', // NwNumberProperty.ROUND,

		'_step' : 0,

		'_type' : 'float', // NwNumberProperty.FLOAT,


		'_processValue' : function(value){
			if(!isNumber(value)){
				value = parseFloat(value);
			}

			if(isSet(this._min_value)){
				value = Math.max(this._min_value, value);
			}

			if(isSet(this._max_value)){
				value = Math.min(this._max_value, value);
			}

			if(this._step){
				// todo: add logic for making sure the value is in step ;-)
			}

			if(this._type == NwNumberProperty.INT){
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
					(this._type == NwNumberProperty.INT && !isInt(value)) ||
					(isSet(this._min_value) && value < this._min_value) ||
					(isSet(this._max_value) && value > this._max_value)
				){
				return false;
			}

			// todo: add step validation

			return true;
		},


		'getType' : function(){
			return this._type;
		},
		'setType' : function(val){
			this._type = val;
		},

		'getMaxValue' : function(){
			return this._max_value;
		},
		'setMaxValue' : function(val){
			this._max_value = val;
		},

		'getMinValue' : function(){
			return this._min_value;
		},
		'setMinValue' : function(val){
			this._min_value = val;
		}
	},
	{
		'FLOAT' : 'float',
		'INT'   : 'int',

		'CEIL'  : 'ceil',
		'FLOOR' : 'floor',
		'ROUND' : 'round'
	}
);
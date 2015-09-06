OJ.importJs('nw.data.properties.NwProperty');


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
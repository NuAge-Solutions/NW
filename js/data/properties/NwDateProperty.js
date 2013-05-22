OJ.importJs('nw.data.properties.NwProperty');


'use strict';

OJ.extendClass(
	NwProperty, 'NwDateProperty',
	{
		'_max_date' : null,  '_min_date' : null,

		'_processValue' : function(value){
			if(!isDate(value)){
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

		'getMaxLength' : function(){
			return this._max_date;
		},
		'setMaxLength' : function(val){
			this._max_date = !this._min_date || val > this._min_date ? val : this._min_date;
		},

		'getMinDate' : function(){
			return this._min_date;
		},
		'setMinDate' : function(val){
			this._min_date = !this._max_date || val < this._max_date ? val : this._max_date;
		}
	}
);
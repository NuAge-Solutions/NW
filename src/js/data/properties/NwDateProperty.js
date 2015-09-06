OJ.importJs('nw.data.properties.NwProperty');


'use strict';

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
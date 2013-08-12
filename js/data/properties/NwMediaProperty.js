OJ.importJs('nw.data.properties.NwFileProperty');


'use strict';

OJ.extendClass(
	'NwMediaProperty', [NwFileProperty],
	{
		'_props_' : {
			'formats' : null,
			'missing' : null
		},


		'_constructor' : function(/*settings*/){
			this._formats = [];

			this._super(NwFileProperty, '_constructor', arguments);
		},

		'_setupFormatFunc' : function(obj, key, u_key, format){
			var u_format = format.ucFirst(),
				getter = 'get' + u_key + u_format,
				setter = 'set' + u_key + u_format;

			if(!obj[getter]){
				obj[getter] = function(){
					return this._static.getProperty(key).formatValue(this, key, format);
				};
			}

			if(!obj[setter]){
				obj[setter] = function(val){
					this._static.getProperty(key).formatValue(this, key, format, val);
				};
			}
		},


		'formatValue' : function(obj, key, format){
			var args = arguments,
				is_setter = args.length > 3,
				media = obj.property(key);

			if(is_setter){
				if(!media){
					obj['set' + key.ucFirst()](media = {});
				}

				return media[format] = args[3];
			}

			if(!media){
				return null;
			}

			media = media[format];

			if(!media && this._missing){
				if(isString(this._missing)){
					return this._missing;
				}

				media = this._missing[format];
			}

			return media;
		},

		'setup' : function(obj, key, u_key){
			this._super(NwFileProperty, 'setup', arguments);

			var ln = this._formats.length;

			for(; ln--;){
				this._setupFormatFunc(obj, key, u_key, this._formats[ln]);
			}
		}
	}
);
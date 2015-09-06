OJ.importJs('nw.data.properties.NwFileProperty');


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
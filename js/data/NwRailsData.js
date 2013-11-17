OJ.importJs('nw.data.NwData');
OJ.importJs('nw.data.properties.NwDateProperty');
OJ.importJs('nw.data.properties.NwNumberProperty');


'use strict';

OJ.extendClass(
	'NwRailsData', [NwData],
	{
		'_getDeleteRequest' : function(method/*, params*/){
			var ldr = this._super(NwData, '_getDeleteRequest', [method, arguments.length > 1 ? arguments[1] : null]);
			ldr.getRequest().setContentType(OjUrlRequest.QUERY_STRING);

			return ldr;
		},

		'_getLoadRequest' : function(method/*, params*/){
			var ldr = this._super(NwData, '_getLoadRequest', [method, arguments.length > 1 ? arguments[1] : null]);
			ldr.getRequest().setContentType(OjUrlRequest.QUERY_STRING);

			return ldr;
		},

		'_getSaveRequest' : function(method/*, params*/){
			var ldr = this._super(NwData, '_getSaveRequest', arguments);
			ldr.getRequest().setContentType(OjUrlRequest.QUERY_STRING);

			return ldr;
		},

		'_translateSaveParam' : function(param){
			if(
				param == 'id' || param == 'created' || param == 'modified' ||
				param == '_class_name' || param == '_class_path'
			){
				return null;
			}

			return this._super(NwData, '_translateSaveParam', arguments);
		}
	},
	{
		'DEFINITION' : {
			'id'         : new NwNumberProperty(),
			'created'    : new NwDateProperty(),
			'modified'   : new NwDateProperty()
		},

		'EXPORT_MAP' : {
			'created'  : 'created_at',
			'modified' : 'updated_at'
		},

		'TYPE' : 'RailsData',


		'import' : function(data){
			if(isArray(data)){
				var ln = data.length;

				while(ln-- > 0){
					data[ln] = this.importData(data[ln]);
				}

				return data;
			}

			if(isObject(data)){
				var keys = Object.keys(data);
				var ln = keys.length;
				var c = this;

				if(ln == 1){
					c = NwData.typeToClass(keys[0]);
					data = data[keys[0]];
				}

				if(c){
					var obj, id = data[c.PRIMARY_KEY];

					if(id && c._CACHE[id]){
						obj = c._CACHE[id];
					}
					else{
						obj = new c();
					}

					obj.importData(data);

					return obj;
				}
			}

			return null;
		}
	}
);
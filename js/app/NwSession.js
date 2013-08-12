OJ.importJs('oj.events.OjActionable');
OJ.importJs('oj.events.OjEvent');
OJ.importJs('oj.timer.OjTimer');

'use strict';

OJ.extendClass(
	'NwSession', [OjActionable],
	{
		'_props_' : {
			'data'  : null,
			'token' : null,
			'user'  : null
		},

		'_class_path' : 'nw.app.NwSession',


		'_constructor' : function(/*token, data*/){
			this._super(OjActionable, '_constructor', []);

			this._data = {};

			var ln = arguments.length;

			if(ln){
				this.setToken(arguments[0]);

				if(ln > 1){
					this.setData(arguments[1]);
				}
			}
		},


		// Utility Functions
		'exportData' : function(){
			var obj = this._super(OjActionable, 'exportData', arguments);

			obj.data = this._data ? OjObject.exportData(this._data) : {};
			obj.token = this._token;
			obj.user = this._user ? this._user.exportData() : null;

			return obj;
		},

		'importData' : function(obj){
			this._data = obj && obj.data ? OjObject.importData(obj.data) : {};

			this._token = obj && obj.token ? obj.token : null;

			this._user = obj && obj.user ? OjObject.importData(obj.user) : null;
		},

		'save' : function(){
			this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
		},


		// Getter & Setter Functions
		'get' : function(key){
			return this._data[key];
		},

		'set' : function(key, val){
			if(this._data[key] == val){
				return;
			}

			this._data[key] = val;

			this.save();
		},

		'unset' : function(key){
			delete this._data[key];

			this.save();
		},


		'setData' : function(val){
			if(this._data == val){
				return;
			}

			this._data = val ? val : {};

			this.save();
		},

		'setToken' : function(val){
			if(this._token == val){
				return;
			}

			this._token = val;

			this.save();
		},

		'setUser' : function(val){
			if(this._user == val){
				return;
			}

			this._user = val;

			this.save();
		}
	}
);
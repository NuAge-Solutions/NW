OJ.importJs('nw.data.NwUser');


OJ.extendClass(
	'NwSession', [OjActionable],
	{
		'_props_' : {
			'data'  : null,
			'token' : null,
			'user'  : null
		},

        '_get_props_' : {
            'is_logged_in' : null
        },


		'_constructor' : function(token, data){
            var self = this;

			self._super(OjActionable, '_constructor', []);

			self._data = {};

			if(token){
				self._token = token;

				if(data){
					self._data = data;
				}

                self.save();
			}
		},


		// Utility Functions
		'exportData' : function(){
			var self = this,
                obj = self._super(OjActionable, 'exportData', arguments),
                data = self.data,
                user = self.user;

			obj.data = data ? OjObject.exportData(data) : {};
			obj.token = self._token;
            obj.user = user ? user.exportData() : null;

			return obj;
		},

		'importData' : function(obj){
            var self = this;

			self._data = obj && obj.data ? OjObject.importData(obj.data) : {};

			self._token = obj && obj.token ? obj.token : null;

			self._user = obj && obj.user ? self._static.USER_CLASS.importData(obj.user) : null;

            this.save()
		},

        '.is_logged_in' : function(){
            return !isEmpty(this._token) && !isEmpty(this._user) && this._user.key()
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


		'=data' : function(val){
			if(this._data == val){
				return;
			}

			this._data = val ? val : {};

			this.save();
		},

		'=token' : function(val){
			if(this._token == val){
				return;
			}

			this._token = val;

			this.save();
		},

        'newUser' : function(data){
            this._static.newUser(data);
        },

		'=user' : function(val){
			if(this._user == val){
				return;
			}

			this._user = val;

			this.save();
		}
	},
    {
        'USER_CLASS' : NwUser,

        'newUser' : function(data){
            var cls = this.USER_CLASS;

            return data ? cls.importData(data) : new cls();
        }
    }
);
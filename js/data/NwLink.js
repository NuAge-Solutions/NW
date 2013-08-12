'use strict';

OJ.extendClass(
	'NwLinkData', [OjActionable],
	{
		'_active' : false, '_url' : null,  '_title' : null,  '_icon' : null,


		'_constructor' : function(/*title, url, icon*/){
			this._super(OjActionable, '_constructor', []);

			var ln = arguments.length;

			if(ln){
				this.setTitle(arguments[0]);

				if(ln > 1){
					this.setUrl(arguments[1]);

					if(ln > 2){
						this.setIcon(arguments[2]);
					}
				}
			}
		},


//	    'isActive' : function(/*active*/){
//			if(arguments.length && this._active != arguments[0]){
//				this._active = arguments[0];
//
//				this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
//			}
//
//			return this._active;
//		},

		'getIcon' : function(){
			return this._icon;
		},
		'setIcon' : function(icon){
			if(this._icon != icon){
				this._icon = icon;

				this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
			}
		},

		'getUrl' : function(){
			return this._calculated_url;
		},
		'setUrl' : function(path){
			if(this._url != path){
				this._url = path;

				this._recalculatePath();
			}
		},

		'getTitle' : function(){
			return this._title;
		},
		'setTitle' : function(title){
			if(this._title != title){
				this._title = title;

				this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
			}
		}
	}
);
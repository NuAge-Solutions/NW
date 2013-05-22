OJ.importJs('oj.events.OjEvent');


'use strict';

OJ.extendClass(
	OjEvent, 'NwNavRouteEvent',
	{
		'_get_props_' : {
			'arguments' : null
		},


		'_constructor' : function(type/*, args, bubbles = true, cancelable = false*/){
			var ln = arguments.length, args = [type, true, false];

			if(ln > 1){
				this._arguments = arguments[1];

				if(ln > 2){
					args[2] = arguments[2];

					if(ln > 3){
						args[3] = arguments[3];
					}
				}
			}
			else{
				this._arguments = [];
			}

			this._super('NwNavRouteEvent', '_constructor', args);
		}
	},
	{
		'LOAD'   : 'onRouteLoad',
		'CHANGE' : 'onRouteChange'
	}
);
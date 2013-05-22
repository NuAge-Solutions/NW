OJ.importJs('oj.events.OjEvent');


'use strict';

OJ.extendClass(
	OjEvent, 'NwEvent',
	{
		'_get_props_' : {
			'data' : null
		},


		'_constructor' : function(type/*, bubbles = false, cancelable = false, data = null*/){
			var ln = arguments.length;

			this._super('NwEvent', '_constructor', ln > 3 ? [].slice.call(arguments, 0, 3) : arguments);

			if(ln > 3){
				this._data = arguments[3];
			}
		}
	}
);
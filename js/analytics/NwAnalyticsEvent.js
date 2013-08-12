OJ.importJs('oj.events.OjEvent');


'use strict';

OJ.extendClass(
	'NwAnalyticsEvent', [OjEvent],
	{
		'_get_props_' : {
			'data'  : null
		},


		'_constructor' : function(type, data){
			this._super(OjEvent, '_constructor', [type, false, true]);

			this._data = data;
		}
	},
	{
		'ACTION'   : 'onAnalyticsAction',
		'MESSAGE'  : 'onAnalyticsMessage',
		'VIEW'     : 'onAnalyticsView'
	}
);
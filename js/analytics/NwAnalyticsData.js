OJ.importJs('oj.data.OjObject');


'use strict';

OJ.extendClass(
	OjObject, 'NwAnalyticsData',
	{
		'_props_' : {
			'date' : null
		},


		'_constructor' : function(){
			this._super('NwAnalyticsData', '_constructor', []);

			this._date = new Date();
		}
	}
);
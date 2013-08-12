OJ.importJs('nw.analytics.NwAnalyticsData');


'use strict';

OJ.extendClass(
	'NwAnalyticsMessage', [NwAnalyticsData],
	{
		'_props_' : {

		},


		'_constructor' : function(){
			this._super(NwAnalyticsData, '_constructor', []);
		}
	}
);
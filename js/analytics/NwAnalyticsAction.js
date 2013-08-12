OJ.importJs('nw.analytics.NwAnalyticsData');


'use strict';

OJ.extendClass(
	'NwAnalyticsAction', [NwAnalyticsData],
	{
		'_props_' : {
			'category' : null,
			'isBounce' : false,
			'params'   : null,
			'name'     : null
		},


		'_constructor' : function(name/*, category, params, is_bounce*/){
			this._super(NwAnalyticsData, '_constructor', []);

			this.setName(name);

			var args = arguments,
				ln = args.length;

			if(ln > 1){
				this.setCategory(args[1]);

				if(ln > 2){
					this.setParams(args[2]);

					if(ln > 3){
						this.setIsBounce(args[3]);
					}
				}
			}
		}
	}
);
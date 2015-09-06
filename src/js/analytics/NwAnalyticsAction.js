OJ.importJs('nw.analytics.NwAnalyticsData');


OJ.extendClass(
	'NwAnalyticsAction', [NwAnalyticsData],
	{
		'_props_' : {
			'category' : null,
			'isBounce' : null,
			'params'   : null,
			'name'     : null
		},


		'_constructor' : function(name/*, category, params, is_bounce*/){
			this._super(NwAnalyticsData, '_constructor', []);

			this.name = name;

            this._processArguments(arguments, {
                'category' : undefined,
                'params' : undefined,
                'isBounce' : false
            });
		}
	}
);
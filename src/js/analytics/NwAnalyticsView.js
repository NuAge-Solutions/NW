OJ.importJs('nw.analytics.NwAnalyticsData');


OJ.extendClass(
	'NwAnalyticsView', [NwAnalyticsData],
	{
		'_props_' : {
			'title' : null,
			'path'   : null
		},


		'_constructor' : function(/*path, title*/){
			this._super(NwAnalyticsData, '_constructor', []);

            this._processArguments(arguments, {
                'path' : undefined,
                'title' : undefined
            });
		},


		'=path' : function(val){
			if(this._path == val){
				return;
			}

			if((this._path = val) && val.charAt(0) != '/'){
				this._path = '/' + val;
			}
		}
	}
);
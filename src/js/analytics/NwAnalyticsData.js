OJ.extendClass(
	'NwAnalyticsData', [OjObject],
	{
		'_props_' : {
			'date' : null
		},


		'_constructor' : function(){
			this._super(OjObject, '_constructor', []);

			this.date = new Date();
		}
	}
);
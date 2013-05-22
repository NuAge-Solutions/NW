OJ.importJs('nw.analytics.NwAnalyticsData');


'use strict';

OJ.extendClass(
	NwAnalyticsData, 'NwAnalyticsView',
	{
		'_props_' : {
			'title' : null,
			'path'   : null
		},


		'_constructor' : function(/*path, title*/){
			this._super('NwAnalyticsView', '_constructor', []);

			var args = arguments,
				ln = args.length;

			if(ln){
				this.setPath(args[0]);

				if(ln > 1){
					this.setTitle(args[1]);
				}
			}
		},


		'setPath' : function(val){
			if(this._path == val){
				return;
			}

			if((this._path = val) && val.charAt(0) != '/'){
				this._path = '/' + val;
			}
		}
	}
);
OJ.importJs('oj.events.OjActionable');
OJ.importJs('nw.analytics.NwAnalyticsAction');
OJ.importJs('nw.analytics.NwAnalyticsEvent');
OJ.importJs('nw.analytics.NwAnalyticsMessage');
OJ.importJs('nw.analytics.NwAnalyticsView');


'use strict';

OJ.extendManager(
	'Analytics', OjActionable, 'NwAnalytics',
	{
		'_constructor' : function(/*manager*/){
			this._super('NwAnalytics', '_constructor', []);
		},

		'enableEngine' : function(engine){
			engine.enable();
		},

		'disableEngine' : function(engine){
			engine.disable();
		},

		'log' : function(msg){
			this.dispatchEvent(
				new NwAnalyticsEvent(
					NwAnalyticsEvent.MESSAGE,
					new NwAnalyticsMessage(msg)
				)
			);
		},

		'trackEvent' : function(action/*, category, params, is_bounce*/){
			var args = arguments,
				ln = args.length,
				data = new NwAnalyticsAction(action);

			if(ln > 1){
				data.setCategory(args[1]);

				if(ln > 2){
					data.setParams(args[2]);

					if(ln > 3){
						data.setIsBounce(args[3]);
					}
				}
			}

			this.dispatchEvent(new NwAnalyticsEvent(NwAnalyticsEvent.ACTION, data));
		},

		'trackView' : function(/*path, title*/){
			var args = arguments,
				ln = args.length,
				data = new NwAnalyticsView();

			if(ln){
				data.setPath(args[0]);

				if(ln > 1){
					data.setTitle(args[1]);
				}
			}

			this.dispatchEvent(new NwAnalyticsEvent(NwAnalyticsEvent.VIEW, data));
		}
	}
);
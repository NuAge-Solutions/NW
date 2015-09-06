OJ.importJs('oj.events.OjActionable');
OJ.importJs('nw.analytics.NwAnalyticsAction');
OJ.importJs('nw.analytics.NwAnalyticsEvent');
OJ.importJs('nw.analytics.NwAnalyticsMessage');
OJ.importJs('nw.analytics.NwAnalyticsView');


OJ.extendManager(
	'Analytics', 'NwAnalytics', [OjActionable],
	{
		'_constructor' : function(/*manager*/){
			this._super(OjActionable, '_constructor', []);
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
				data.category = args[1];

				if(ln > 2){
					data.params = args[2];

					if(ln > 3){
						data.isBounce = args[3];
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
				data.path = args[0];

				if(ln > 1){
					data.title = args[1];
				}
			}

			this.dispatchEvent(new NwAnalyticsEvent(NwAnalyticsEvent.VIEW, data));
		}
	}
);
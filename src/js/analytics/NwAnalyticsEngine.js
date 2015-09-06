OJ.importJs('nw.analytics.NwAnalytics');
OJ.importJs('oj.data.OjArray');
OJ.importJs('oj.events.OjActionable');


OJ.extendClass(
	'NwAnalyticsEngine', [OjActionable],
	{
		'_queue' : null,  '_processing' : false,


		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);

			this._queue = new OjArray();

			if(!this._static._HAS_LIBRARY){
				this._loadLibrary();
			}

			this._init();
		},


		// utility functions
		'_init' : function(){

		},

		'_loadLibrary' : function(){
			this._static._HAS_LIBRARY = true;
		},

		'_processActionItem' : function(evt){
			return false;
		},

		'_processItem' : function(evt){
			return false;
		},

		'_processQueue' : function(){
			if(this._processing){
				return;
			}

			this._processing = true;

			var ln = this._queue.length,
				item, func;

			for(; ln--;){
				func = '_processItem';
				item = this._queue.getItemAt(ln);

				switch(item.type){
					case NwAnalyticsEvent.ACTION:
						func = '_processActionItem';
					break;

					case NwAnalyticsEvent.MESSAGE:
						func = '_processMessageItem';
					break;

					case NwAnalyticsEvent.VIEW:
						func = '_processViewItem';
					break;
				}

				if(this[func](item)){
					this._queue.removeItemAt(ln);
				}
			}

			this._processing = false;
		},

		'_processMessageItem' : function(evt){
			return false;
		},

		'_processViewItem' : function(evt){
			return false;
		},


		// event listeners
		'_onAnalyticsEvent' : function(evt){
			this._queue.addItemAt(evt, 0);

			this._processQueue();
		},


		// public functions
		'disable' : function(){
			Analytics.removeEventListener(NwAnalyticsEvent.ACTION, this, '_onAnalyticsEvent');
			Analytics.removeEventListener(NwAnalyticsEvent.MESSAGE, this, '_onAnalyticsEvent');
			Analytics.removeEventListener(NwAnalyticsEvent.VIEW, this, '_onAnalyticsEvent');
		},

		'enable' : function(){
			Analytics.addEventListener(NwAnalyticsEvent.ACTION, this, '_onAnalyticsEvent');
			Analytics.addEventListener(NwAnalyticsEvent.MESSAGE, this, '_onAnalyticsEvent');
			Analytics.addEventListener(NwAnalyticsEvent.VIEW, this, '_onAnalyticsEvent');
		},

		'log' : function(){

		},

		'track' : function(event, data){
			this._onAnalyticsEvent(new NwAnalyticsEvent(NwAnalyticsEvent.TACK_EVENT, event, data));
		}
	},
	{
		'_HAS_LIBRARY' : false
	}
);
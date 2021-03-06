OJ.importJs('nw.analytics.NwAnalyticsEngine');


OJ.extendClass(
	'NwGoogleAnalytics', [NwAnalyticsEngine],
	{
		'_get_props_' : {
			'key' : null,
			'namespace' : null
		},

		'_name' : null,


		'_constructor' : function(key, namespace){
			this._key = key;
			this._namespace = namespace;

			this._super(NwAnalyticsEngine, '_constructor', arguments);
		},

		'_call' : function(){
			var args = arguments;

			if(this._name){
				args[0] = this._name + '.' + args[0];
			}

			window.ga.apply(window.ga, args);
		},

		'_init' : function(){
			var params = {},
				trackers = window.ga.getAll ? window.ga.getAll() : null;

			if(!isEmpty(trackers)){
				params.name = this._name = this.oj_id;
			}

			window.ga('create', this._key, this._namespace, params);
		},

		'_loadLibrary' : function(){
			this._super(NwAnalyticsEngine, '_loadLibrary', []);

			var w = window;
			w.GoogleAnalyticsObject = 'ga';

			w.ga = function(){
				(w.ga.q = w.ga.q || []).append(arguments);
			};
			w.ga.l = 1 * new Date();

			OJ.loadJs('//www.google-analytics.com/analytics.js', true);
		},

		'_processActionItem' : function(evt){
			var action = evt.data,
				category = action.category,
				params = action.params,
				args = {
					'eventCategory'  : category ? category : 'misc',
					'eventAction'    : action.name,
					'nonInteraction' : !action.isBounce
				};

			if(params){
				var key;

				for(key in params){
					args.eventLabel = key;
					args.eventValue = parseInt(params[key]);

					break;
				}
			}

			this._send('event', args);

			return true;
		},

		'_processViewItem' : function(evt){
			var action = evt.data,
				args = {
					'page' : action.path,
					'title' : action.title
				};

			this._send('pageview', args);

			return true;
		},

		'_send' : function(hitType, args){
			args.hitType = hitType;

			this._call('send', args);
		}

//		'_processQueue' : function(){
//			var ln = this._queue.numItems(),
//				item, data;
//
//			for(;ln--;){
//				item = this._queue.getItemAt(ln);
//				data = item.getData();
//
//				this._call(
//					this.getId() + '.send', 'event',
//					data.category ? data.category : 'misc',
//					item.getAction(),
//					data.label ? data.label : null,
//					data.value ? data.value : null,
//					data.isBounce ? data.isBounce : true
//				);
//			}
//		}
	}
);
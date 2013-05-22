OJ.importJs('nw.nav.NwNavRoute');
OJ.importJs('oj.nav.OjNavController');
OJ.importJs('oj.utils.OjHistoryManager');

OJ.importCss('nw.nav.NwNavController');


'use strict';

OJ.extendClass(
	OjComponent, 'NwNavController',
	OJ.implementInterface(
		OjINavController,
		{
			'_props_' : {
				'routing' : null
			},

			'_active' : null, '_active_index' : -1,  '_active_view' : null,


			'_constructor' : function(/*stack, routing*/){
				this._super('NwNavController', '_constructor', []);

				// setup the display
				this.setVertAlign(OjStyleElement.MIDDLE);

				// setup vars
				this._history = [];

				// process the arguments
				var ln = arguments.length;

				if(ln){
					this.setStack(arguments[0]);

					if(ln > 1){
						this.setRouting(arguments[1]);
					}
				}

				HistoryManager.addEventListener(HistoryManager.CHANGE, this, '_onHashChange');
			},

			'_destructor' : function(){
				HistoryManager.removeEventListener(HistoryManager.CHANGE, this, '_onHashChange');

				this._cleanupStack();

				if(this._routing){
					this._routing.removeEventListener(OjEvent.CHANGE, this, '_onRoutingChange');

					var url = HistoryManager.get();
					url.setHashParam(this.getId(), null);

					OJ.open(url);
				}

				return this._super('NwNavController', '_destructor', arguments);
			},


			'_getDefaultRoute' : function(){
				return this._routing;
			},

			'_getRouteByPath' : function(path, routes){
				var ln, route, children = [], quality, rtrn  = {};

				// check top level routes
				for(ln = routes.length; ln--;){
					route = routes[ln];

					if(quality = route.pathMatchQuality(path)){
						if(!rtrn[quality]){
							rtrn[quality] = route;
						}

						if(quality == 1){
							return rtrn;
						}
					}

					children = route.getItems().concat(children);
				}

				// check children routes
				if(children.length){
					return OJ.merge(rtrn, this._getRouteByPath(path, children));
				}

				return rtrn;
			},

			'_load' : function(path, route){
				traceGroup('View Load "' + path + '"');

				// create and insert the view
				this._active_view = route.getView();

				if(!this._stack.hasElm(this._active_view)){
					this._stack.addElm(this._active_view);
				}

				this._stack.setActive(this._active_view);

				// listen for then when the loader has completed its tasks
				this._active_view.addEventListener(NwNavView.LOAD, this, '_onViewLoadComplete');

				// load it!
				// todo calculate load args
				this._active_view.load.apply(this._active_view, [path, path.charAt(0) == '/' ? path.substring(1).split('/') : path.split('/')]);

				// save the route
				this._active = route;

				this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
			},

			'_refreshStack' : function(){
				// if we have a stack then we need to update it
				if(this._stack){
					// remove any items from the stack that are no longer part of the set routing
					var ln = this._stack.numElms(), route;

					for(; ln--;){
						route = this._stack.getElmAt(ln).getRoute();


						if(this._routing && (this._routing == route || this._routing.hasChildRoute(route))){
							continue;
						}

						this._stack.removeElmAt(ln);
					}

					if(this._routing && !this._active){
						this._onHashChange(null);
					}
				}
			},


			'_onHashChange' : function(evt){
				if(this._routing){
					var param = this.getId();
					var url = HistoryManager.get();
					var path = url.getHashParam(param);
					var route = this._getDefaultRoute();

					if(path){
						route = this.getRouteByPath(path);
					}
					else{
						path = route.getPath();
					}

					if(!this._active || this._active != route){
						// make sure we recognize this route
						if(route){
							if(!this._stack){
								return;
							}

							this._load(path, route);
						}
						// if not then send them back to the previous active route
						// if there is one
						else if(this._active){
							this.loadRoute(this._active);
						}
					}
				}
			},

			'_onRoutingLoad' : function(evt){
				// check to see if we need to update the cache
				this.loadRoute(evt.getTarget(), evt.getArguments());
			},

			'_onRoutingChange' : function(evt){
				this._refreshStack();
			},

			'_onViewLoadComplete' : function(evt){
				traceGroup();

				if(!this._active_view){
					return;
				}

				// unbind the listener that called this
				this._active_view.removeEventListener(NwNavView.LOAD, this, '_onViewLoadComplete');
			},

/*
			'backward' : function(){
				var r = this._routing;

				if(!r){
					return;
				}

				if(--this._active_index < 0){
					this._active_index = r.numItems() - 1;
				}

				this.loadRoute(this._routing.getItemAt(this._active_index));
			},

			'forward' : function(){
				var r = this._routing;

				if(!r){
					return;
				}

				if(++this._active_index >= r.numItems()){
					this._active_index = 0;
				}

				this.loadRoute(this._routing.getItemAt(this._active_index));
			},
*/
			'loadPath' : function(path){
				// make sure the url is up to date with the route we are loading
				var url = HistoryManager.get();
				url.setHashParam(this.getId(), path);

				OJ.open(url);
			},

			'loadRoute' : function(route/*, args*/){
				this.loadPath(route.pathWithArguments(arguments.length > 1 ? arguments[1] : []));
			},

			'getRouteByPath' : function(path){
				if(!this._routing){
					return null;
				}

				var matches = this._getRouteByPath(path, this._routing.getItems());

				if(matches['1']){
					return matches['1'];
				}

				var rank, best = 99999;

				for(rank in matches){
					if(best > (rank = parseInt(rank))){
						best = rank;
					}
				}

				if(best == 99999 && this._routing.pathIsMatch(path)){
					return this._routing;
				}

				return matches[best];
			},


			'getActive' : function(){
				return this._active;
			},

			'getActiveIndex' : function(){
				return this._active_index;
			},

			'setRouting' : function(routing){
				if(this._routing == routing){
					return;
				}

				if(this._routing){
					this._routing.removeEventListener(NwNavRouteEvent.LOAD, this, '_onRoutingLoad');
				}

				if(this._routing = routing){
					this._routing.addEventListener(NwNavRouteEvent.LOAD, this, '_onRoutingLoad');
					this._routing.addEventListener(NwNavRouteEvent.CHANGE, this, '_onRoutingChange');
				}

				this._refreshStack();
			},

			'setStack' : function(stack){
				if(this._stack == stack){
					return;
				}

				if(this._stack){
					this._cleanupStack();
				}

				this._stack = stack;

				this._setupStack();
			}
		}
	)
);
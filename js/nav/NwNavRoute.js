OJ.importJs('oj.data.OjCollection');
OJ.importJs('nw.nav.NwNavRouteEvent');


'use strict';

OJ.extendClass(
	OjActionable, 'NwNavRoute',
	OJ.implementInterface(
		OjICollection,
		{
			'_props_' : {
				'arguments'     : null,
				'icon'          : null,
				'parent'        : null,
				'path'          : null,
				'items'         : null,
				'title'         : null,
				'viewClassName' : null,
				'viewClassPath' : null
			},

			'_active' : false,  '_path_match' : null,  '_view' : null,


			'_constructor' : function(path/*, title, icon, view_class_path, view_class_name, sub_routes*/){
				this._super('NwNavRoute', '_constructor', []);

				this.setPath(path);

				var ln = arguments.length;

				if(ln > 1){
					this.setTitle(arguments[1]);

					if(ln > 2){
						this.setIcon(arguments[2]);

						if(ln > 3){
							this.setViewClassPath(arguments[3]);

							if(ln > 4){
								this.setViewClassName(arguments[4]);

								if(ln > 5){
									this.setItems(arguments[5]);
								}
							}
						}
					}
				}
			},

			'_destructor' : function(){
				OJ.destroy(this._items);

				return this._super('NwNavRoute', '_destructor', arguments);
			},


			'_onItemAdd' : function(evt){
				evt.getItem().setParent(this);

				this.dispatchEvent(new NwNavRouteEvent(NwNavRouteEvent.CHANGE));
			},

			'_onItemRemove' : function(evt){
				evt.getItem().setParent(null);

				this.dispatchEvent(new NwNavRouteEvent(NwNavRouteEvent.CHANGE));
			},

			'_onItemReplace' : function(evt){
				evt.getItem().setParent(this);

				evt.getOldItem().setParent(null);

				this.dispatchEvent(new NwNavRouteEvent(NwNavRouteEvent.CHANGE));
			},


			// Item Management Functions
			'_getItemByPath' : function(path, routes){
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

			'_prepareItems' : function(){
				if(this._items){
					return;
				}

				this._items = new OjCollection();
				this._items.setAllowDuplicate(false);
				this._items.addEventListener(OjCollectionEvent.ITEM_ADD, this, '_onItemAdd');
				this._items.addEventListener(OjCollectionEvent.ITEM_REMOVE, this, '_onItemRemove');
				this._items.addEventListener(OjCollectionEvent.ITEM_REPLACE, this, '_onItemReplace');
			},

			'defaultItem' : function(){
				return this.numItems() ? this.getItemAt(0) : null;
			},

			'getItemByPath' : function(path){
				var matches = this.numItems() ? this._getItemByPath(path, this.getItems()) : {};

				if(matches['1']){
					return matches['1'];
				}

				var rank, best = 99999;

				for(rank in matches){
					if(best > (rank = parseInt(rank))){
						best = rank;
					}
				}

				return best == 99999 ? null : matches[best];
			},


			'dispatchEvent' : function(evt){
				// add in route bubbling
				this._super('NwNavRoute', 'dispatchEvent', arguments);

				if(this._parent){
					this._parent.dispatchEvent(evt);
				}
			},

			'hasChildRoute' : function(route){
				var ln = this.numItems(), sub_route;

				for(; ln--;){
					sub_route = this.getItemAt(ln);

					if(sub_route == route){
						return true;
					}
				}

				ln = this.numItems();

				for(; ln--;){
					sub_route = this.getItemAt(ln);

					if(sub_route.hasChildRoute(route)){
						return true;
					}
				}

				return false;
			},

			'hasParentRoute' : function(route){
				var parent = this;

				while(parent && (parent = parent.getParent())){
					if(parent == route){
						return true;
					}
				}

				return false;
			},

			'isActive' : function(/*active*/){
				if(arguments.length && this._active != arguments[0]){
					this._active = arguments[0];
				}

				return this._active;
			},

			'load' : function(/*... args*/){
				this.dispatchEvent(new NwNavRouteEvent(NwNavRouteEvent.LOAD, Array.array(arguments)));
			},

			'pathIsMatch' : function(path){
				if(path){
					var matches = path.match(this._path_match);

					return matches && matches.length && matches[0] == path;
				}

				return false;
			},

			'pathMatchQuality' : function(path){
				if(this._path == path){
					return 1;
				}

				if(this.pathIsMatch(path)){
					return 2 + Math.abs(this._path.split('/').length - path.split('/').length);
				}

				return 0;
			},

			'pathWithArguments' : function(args){
				var path = this._path;

				if(args.length){
					var parts = path.split('/'), i, j = 0, ln = parts.length, ln2 = args.length;

					for(i = 0; i < ln; i++){
						if(parts[i] == '*'){
							parts[i] = j < ln2 ? args[j++] : '';
						}
					}

					path = parts.join('/');
				}

				return path;
			},


			// Getter & Setter Functions
			'setIcon' : function(icon){
				if(this._icon != icon){
					this._icon = icon;
				}
			},

			'setParent' : function(parent){
				if(this._parent != parent){
					this._parent = parent;
				}
			},

			'setPath' : function(path){
				if(this._path != path){
					this._path = path;

					this._path_match = path.replace(/\*/g, '[^ ]*');
				}
			},

			'setTitle' : function(title){
				if(this._title != title){
					this._title = title;
				}
			},

			'getView' : function(){
				if(this._view || !this._viewClassName || !this._viewClassPath){
					return this._view;
				}

				// get the view class string
				var view_class = OJ.toClass(this._viewClassName);

				if(!view_class){
					// make sure we have the necessary class files loaded
					OJ.importJs(this._viewClassPath);

					view_class = OJ.toClass(this._viewClassName);
				}

				this._view = new view_class(this);

				return this._view;
			}
		}
	)
);
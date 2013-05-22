OJ.importJs('oj.nav.OjView');
OJ.importJs('nw.app.NwAppManager');


'use strict';

OJ.extendClass(
	OjView, 'NwNavView',
	{
		'_get_props_' : {
			'route' : null
		},


		'_constructor' : function(route){
			this._super('NwNavView', '_constructor', []);

			this._route = route;

			if(!this._title && false){
				this._title = route.getTitle();
			}
		},

		'_destructor' : function(){
			this._route = null;

			return this._super('NwNavView', '_destructor', arguments);
		},


		'getBackPath' : function(){
			var route = AppManager.getActiveRoute().getParent();

			return route ? route.getPath() : '/';
		}
	}
);
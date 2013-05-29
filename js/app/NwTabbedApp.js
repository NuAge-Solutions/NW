OJ.importJs('nw.app.NwApp');
OJ.importJs('nw.nav.NwNavRoute');
OJ.importJs('nw.nav.NwTabNavController');
OJ.importJs('oj.components.OjStack');


'use strict';

OJ.extendClass(
	NwApp, 'NwTabbedApp',
	{
		'_routing' : null,


		'_constructor' : function(){
			this._super('NwTabbedApp', '_constructor', arguments);

			// setup the stack
			this.addChild(this.stack = new OjStack(OjStack.FADE, 250));
			this.stack.addCss('stack');

			// setup the nav controller
			this.addChild(this.nav = new NwTabNavController(this.stack));
			this.nav.setId('nav');
			this.nav.addCss('nav');
			this.nav.addEventListener(OjEvent.CHANGE, this, '_onViewChange');

			// setup the routing
			this._routing = new NwNavRoute('/', 'Home');
		},

		'_setupNavRouting' : function(){
			this.nav.setRouting(this._routing);
		},


		'_onViewChange' : function(evt){

		},


		'init' : function(){
			var session = this._super('NwTabbedApp', 'init', arguments);

			this._setupNavRouting();

			return session;
		},

		'load' : function(route/*|path*/){
			if(isString(route) || (isObjective(route) && route.is('OjUrl'))){
				this.nav.loadPath(route);
			}
			else{
				this.nav.loadRoute(route);
			}
		}
	}
);
OJ.importJs('nw.app.NwApp');
//OJ.importJs('nw.nav.NwNavRoute');
OJ.importJs('oj.nav.OjTabNavController');
OJ.importJs('oj.nav.OjNavStack');


'use strict';

OJ.extendClass(
	'NwTabbedApp', [NwApp],
	{
		'_routing' : null,


		'_constructor' : function(){
			this._super(NwApp, '_constructor', arguments);

			// setup the stack
			if(!this.stack){
				var s = new OjNavStack(OjStack.FADE, 250)
				s.addCss(['stack']);

				this.addChild(this.stack = s);
			}

			this.container = this.stack;

			// setup the nav controller
			if(!this.nav){
				var n = new OjTabNavController();
				n.addCss(['nav']);

				this.addChild(this.nav = n);
			}

			this.nav.addEventListener(OjEvent.CHANGE, this, '_onViewChange');


			// setup the routing
//			this._routing = new NwNavRoute('/', 'Home');
		},

		'_setupNavRouting' : function(){
//			this.nav.setRouting(this._routing);
		},


		'_onViewChange' : function(evt){

		},


		'init' : function(){
			var session = this._super(NwApp, 'init', arguments);

			this.nav.setStack(this.stack);

//			this._setupNavRouting();

			return session;
		},

		'load' : function(route/*|path*/){
//			if(isString(route) || (isObjective(route) && route.is('OjUrl'))){
//				this.nav.loadPath(route);
//			}
//			else{
//				this.nav.loadRoute(route);
//			}
		}
	}
);
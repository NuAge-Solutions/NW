OJ.importJs('nw.apps.NwApp');

OJ.importJs('oj.components.OjStack');


OJ.extendClass(
	'NwFlowedApp', [NwApp],
	{
		'nav' : null,  '_routing' : null,  'stack' : null,


		'_constructor' : function(){
			this._super(NwApp, '_constructor', arguments);

			// setup the stack
			this.stack = new OjStack(OjStack.SLIDE_HORZ, 250);
			this.stack.addCss('stack');

			this.addChild(this.stack);

			// setup the nav controller
			this.nav = new NwFlowNavController(this.stack);
			this.nav.id = 'nav';
			this.nav.addCss('nav');

			this.insertChild(this.nav, 0);

			// setup the routing
			this._routing = new NwNavRoute('/', 'Home')
		},

		'init' : function(){
			var session = this._super(NwApp, 'init', arguments);

			if(this.nav){
				this.nav.routing = this._routing;
			}

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
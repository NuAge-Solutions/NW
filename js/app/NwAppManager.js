OJ.importJs('nw.app.NwApp');
OJ.importJs('nw.app.NwSession');
OJ.importJs('nw.utils.NwCacheManager');

OJ.importJs('oj.events.OjActionable');
OJ.importJs('oj.events.OjEvent');


'use strict';

OJ.extendManager(
	'AppManager', OjActionable, 'NwAppManager',
	{
		'_props_' : {
			'app' : null,
			'session' : null,
			'user' : null
		},

		'_oj_ready' : false,


		'_constructor' : function(){
			this._super('NwAppManager', '_constructor', arguments);

			// listen for when the OJ is ready
			if(OJ.isReady()){
				this._onOjReady(null);
			}
			else{
				OJ.addEventListener(OjEvent.READY, this, '_onOjReady');
			}
		},


		'_initApp' : function(){
			if(this._oj_ready && this._app && OJ.isSupported()){
				// init the app and get the session session
				this._session = this._app.init();
			}
		},

		'_onOjReady' : function(evt){
			if(!this._oj_ready){
				this._oj_ready = true;

				OJ.removeEventListener(OjEvent.READY, this, '_onOjReady');

				this._initApp();
			}
		},


		'apiRequest' : function(method, params/*, method = GET, async = true*/){
			if(!this._app){
				throw new Error('No application initialized.');
			}

			return this._app.apiRequest.apply(this._app, arguments);
		},

		'getSession' : function(){
			return this._app.getSession();
		},

		'getUser' : function(){
			var session = this.getSession();

			return session ? session.getUser() : null;
		},

		'hideLoading' : function(){
			this._app.hideLoading();
		},

		'init' : function(app){
			if(arguments.length){
				this._app = arguments[0];

				this._initApp();
			}

			return this;
		},

		'isLoggedIn' : function(){
			return this._app.isLoggedIn();
		},

		'login' : function(){
			return this._app.login.apply(this._app, arguments);
		},

		'logout' : function(){
			return this._app.logout.apply(this._app, arguments);
		},

		'showLoading' : function(/*message, icon*/){
			this._app.showLoading.apply(this._app, arguments);
		},

		'userIsAdmin' : function(/*user*/){
			var user = arguments.length ? arguments[0] : this.getUser();
			var roles = user ? user.getRoles() : null;

			return roles && roles.indexOf('admin') > -1;
		}
	}
);


// register special tags for handeling app components
OjStyleElement.registerComponentTag('app', function(dom){
	var cls = window[dom.getAttribute('class-name')];

	var app = new cls();

	AppManager.init(app);

	return app;
});
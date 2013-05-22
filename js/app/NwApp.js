OJ.importJs('nw.app.NwSession');
OJ.importJs('nw.window.NwWindowManager');
OJ.importJs('nw.net.NwUrlLoader');
OJ.importJs('nw.net.NwUrlRequest');
OJ.importJs('nw.utils.NwCacheManager');
OJ.importJs('oj.nav.OjView');
OJ.importJs('oj.events.OjMouseEvent');
OJ.importJs('oj.fx.OjFade');
OJ.importJs('oj.fx.OjResize');
OJ.importJs('oj.fx.OjTweenEvent');
OJ.importJs('oj.fx.OjTweenSet');
OJ.importJs('oj.net.OjRpc');

OJ.importCss('nw.app.NwApp');


'use strict';

OJ.extendClass(
	OjView, 'NwApp',
	{
		'_get_props_' : {
			'maxWidth'  : null,
			'maxHeight' : null,
			'minWidth'  : 320,
			'minHeight' : 320,
			'session'   : null,
			'systemBar' : 'appSystemBarDefault', // NwApp.SYSTEM_BAR_DEFAULT
			'url'       : null
		},

		'_api_endpoint' : '/',  '_api_request_type' : OjUrlRequest.QUERY_STRING,  '_api_response_type' : null,

		'_has_mobile_layout' : false,  '_has_tablet_layout' : false,

		'_orientations' : null,  '_ready' : false,  '_scale' : 1,  '_timer' : null,

		// the acl object will serve as a first-level permission control system to prevent users from doing things they shouldn't
		// ultimately the final level of permission control should be done on the server side
		'_acl' : null,


		'_constructor' : function(/*properties*/){
			this._super('NwApp', '_constructor', arguments);

			// setup the url
			var url = HistoryManager.get();
			this._url = url.getProtocol() + '://' + url.getHost();

			// mobile settings
			if(
				(OJ.isMobile() && this._has_mobile_layout) ||
				(OJ.isTablet() && this._has_tablet_layout)
			){
				this.setSystemBar(NwApp.SYSTEM_BAR_DEFAULT);

				this._scale = OJ.getPixelRatio();

				OJ.meta('viewport', 'initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no');
				OJ.meta('apple-mobile-web-app-capable', 'yes');
			}

			// orientation settings
			if(this._orientations){
				NW.setSupportedOrientations(this._orientations);
			}

			// size settings
			if(this._minWidth && this._minHeight){
				NW.setMinSize(this._minWidth, this._minHeight);
			}

			if(this._maxWidth && this._maxHeight){
				NW.setMaxSize(this._maxWidth, this._maxHeight);
			}

			// setup the acl
			this._acl = {};
		},


		// helper functions
		'_buildApiUrl' : function(method){
			return this._api_endpoint + String.string(method);
		},

		'_login' : function(){
			this.dispatchEvent(new OjEvent(NwApp.LOGIN));

			AppManager.dispatchEvent(new OjEvent(NwApp.LOGIN));
		},

		'_loginFail' : function(){
			this.dispatchEvent(new OjEvent(NwApp.LOGIN_FAIL));

			AppManager.dispatchEvent(new OjEvent(NwApp.LOGIN_FAIL));
		},

		'_logout' : function(){
			this.dispatchEvent(new OjEvent(NwApp.LOGOUT));

			AppManager.dispatchEvent(new OjEvent(NwApp.LOGOUT));
		},

		'_logout_fail' : function(){
			this.dispatchEvent(new OjEvent(NwApp.LOGOUT_FAIL));

			AppManager.dispatchEvent(new OjEvent(NwApp.LOGOUT_FAIL));
		},

		'_makeSession' : function(){
			return new NwSession();
		},


		// event handler functions
		'_onSaveSession' : function(evt){
			CacheManager.setData(this.className(), this._session);
		},

		'_onSessionChange' : function(evt){
			this._timer.restart();
		},


		// utility functions
		'apiRequest' : function(method, params/*, method = GET, async = true*/){
			var ln = arguments.length;

			var loader = new NwUrlLoader(
				new NwUrlRequest(this._buildApiUrl(method), params, this._api_request_type, ln > 2 ? arguments[2] : OjUrlRequest.GET),
				ln > 3 ? arguments[3] : true
			);
			loader.setContentType(this._api_response_type);

			return loader;
		},

		'hideLoading' : function(){
			return this._hideOverlay();
		},

		// this gets called by the app manager to let the app know all is ready to go
		'init' : function(){
			if(!(this._session = CacheManager.getData(this.className()))){
				this._session = this._makeSession();
			}

			// add change listener on the session so we know when to save it
			this._timer = new OjTimer(500, 1);
			this._timer.addEventListener(OjTimer.COMPLETE, this, '_onSaveSession');

			this._session.addEventListener(OjEvent.CHANGE, this, '_onSessionChange');

			// ready the app visually
			this.redraw();

			// return the session
			return this._session;
		},

		'isLoggedIn' : function(){
			return !isNull(this._session) && !isEmpty(this._session.getToken());
		},

		'login' : function(){ },

		'logout' : function(){ },

		'showLoading' : function(/*message, icon*/){
			return this._showOverlay.apply(this, arguments);
		},


		// Getter & Setter Functions
		'setSystemBar' : function(value){
			this._systemBar = value;

			if(NwApp.OS == NwApp.IOS){
				var system_bar;

				switch(this._systemBar){
					case NwApp.SYSTEM_BAR_BLACK:
						system_bar = 'black';
						break;

					case NwApp.SYSTEM_BAR_BLACK_NONE:
					case NwApp.SYSTEM_BAR_BLACK_TRANS:
						system_bar = 'black-translucent';
						break;

					default:
						system_bar = 'default';
						break;
				}

				OJ.meta('apple-mobile-web-app-status-bar-style', system_bar);
			}
		}
	},
	{
		// Event Constants
		'LOGIN'       : 'onLogin',
		'LOGIN_FAIL'  : 'onLoginFail',
		'LOGOUT'      : 'onLogout',
		'LOGOUT_FAIL' : 'onLogoutFail',

		// System Bar Constants
		'SYSTEM_BAR_BLACK'       : 'appSystemBarBlack',
		'SYSTEM_BAR_BLACK_TRANS' : 'appSystemBarBlackTranslucent',
		'SYSTEM_BAR_DEFAULT'     : 'appSystemBarDefault',
		'SYSTEM_BAR_NONE'        : 'appSystemBarNone'
	}
);
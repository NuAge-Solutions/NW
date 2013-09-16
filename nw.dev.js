'use strict';

OJ.definePackage(
  'Nw',
  {
    '_alerts' : {},  '_is_native' : false,  '_use_http' : false,
    '_scroll_top' : 0,  '_scroll_left' : 0, '_keyboard_visible' : false,
//    '_analytics' : null,  '_callbacks' : {},  '_gateway' : null,  '_old_trace' : null,

    'CONFIRM' : 'nwConfirm',
    'STATUS_BAR_CHANGE' : 'onStatusBarChange',
    'STATUS_BAR_NONE' : -1,
    'STATUS_BAR_DEFAULT' : 0,
    'STATUS_BAR_BLACK_TRANSLUCENT' : 1,
    'STATUS_BAR_BLACK_OPAQUE' : 2,
    'PORTRAIT' : 1,
    'PORTRAIT_UPSIDE_DOWN' : 2,
    'LANDSCAPE_LEFT' : 3,
    'LANDSCAPE_RIGHT' : 4,

    '_call' : function(func, params){
      var context;
      if(isFunction(this[func])){
        func = (context = this)[func];
      }
      else{
        var parts = func.split('.');
        if(parts.length == 1){
          context = window;
        }
        else{
          parts.pop();
          context = OJ.stringToVar(parts);
        }
        func = OJ.stringToVar(func);
      }
      if(context && isFunction(func)){
        return toJson(OjObject.exportData(func.apply(context, params ? params : [])));
      }
      return null;
    },
    '_isReady' : function(){
      return this.comm('ready');
    },
    '_triggerEvent' : function(evt, data){
  //				trace(evt, data);
      this.dispatchEvent(new NwEvent(evt, false, false, data));
    },
    '_trace' : function(obj/*, ...objs*/){
      if(OJ.getMode() != OJ.DEV){
        return;
      }
      var ln = arguments.length, i;
      if(ln < 2){
        NW.trace(obj);
      }
      else{
        var ary = [];
        for(i = 0; i < ln; i++){
          NW.trace(arguments[i]);
        }
      }
    },

    '_onKeyboardHide' : function(evt){
      this._keyboard_visible = false;
      OJ.setScrollTop(this._scroll_top);
      OJ.setScrollLeft(this._scroll_left);
    },
    '_onKeyboardShow' : function(evt){
      if(!this._keyboard_visible){
        this._scroll_top = OJ.getScrollTop();
        this._scroll_left = OJ.getScrollLeft();
      }
      this._keyboard_visible = true;
    },
    '_onOrientationChange' : function(evt){
      // if not native lock the orientation in
      if(!this._is_native){
        var orientationEvent = OjOrientationEvent;
  //					if(
  //						(o == orientationEvent.LANDSCAPE_LEFT )
  //					){
  //
  //					}
  //					else if(evt.getOrientation() == OjOrientationEvent.LANDSCAPE_RIGHT){
  //
  //					}
      }
    },

    // utility functions
    'comm' : function(method/*, params=[], async=false*/){
      var parts,
          ln = arguments.length,
          async = ln > 2 ? arguments[2] : false,
          params = ln > 1 ? arguments[1] : [],
          comm = 'nw',
          context = window,
          i = 0;

      if(this._use_http){
        return (new NwRpc('http://native.web/comm', method, params, OjRpc.JSON, async)).load();
      }
      parts = method.split('.');
      for(ln = parts.length; i < ln; i++){
        context = context[comm];
        comm = context[parts[i]];
      }
      if(!async){
        return comm.apply(context, params);
      }
      setTimeout(function(){ comm.apply(context, params); }, 1);
    },
    'isNative' : function(/*gateway*/){
      if(arguments.length){
        if(this._is_native = !isEmpty(this._gateway = arguments[0])){
          OJ.addCss(['is-native']);
          if(OJ.isReady()){
            this._isReady();
          }
          // override the default trace functionality
  //						if(!this._old_trace){
  //							this._old_trace = window.trace;
  //						}
  //
  //						window.trace = this._trace;
          // override the default safari functionality
          document.documentElement.style.webkitTouchCallout =
          document.body.style.webkitTouchCallout =
          document.body.style.KhtmlUserSelect = 'none';
          document.documentElement.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
        }
        else{
          if(this._old_trace){
            window.trace = this._old_trace;
            this._old_trace = null;
          }
        }
      }
      return this._is_native;
    },
    'trace' : function(obj){
      if(this._is_native){
        return this.comm('trace', [obj]);
      }
    },
    'trackTimed' : function(event, params){
      // todo: add tracking of timed event
    },
    'useHttp' : function(){
      return this._use_http;
    },

    // these are at the end for compilation reasons
    '_onOjLoad' : function(evt){
      this._super(OjPackage, '_onOjLoad', arguments);
      // detect if iOS
      if(OJ.getOs() == OJ.IOS){
        this._use_http = true;
      }
      // detect if native
      var url = HistoryManager.get();
      if(url.getHost() == 'native.web'){
        this.isNative(url.getQueryParam('nw-gateway'))
      }
                            },
    '_onOjReady' : function(evt){
      this._super(OjPackage, '_onOjReady', arguments);
      if(this._is_native){
        this._isReady();
      }
      else{
        OJ.addEventListener(OjOrientationEvent.CHANGE, this, '_onOrientationChange');
      }
    },

    // config functions
    'getGateway' : function(){
      return this._gateway;
    },
    'getMaxSize' : function(){
      if(!this._is_native){
        return null;
      }
      return this.comm('maxSize');
    },
    'setMaxSize' : function(width, height){
      if(this._is_native){
        return this.comm('maxSize', [width, height]);
      }
    },
    'getMinSize' : function(){
      if(!this._is_native){
        return null;
      }
      return this.comm('minSize');
    },
    'setMinSize' : function(width, height){
      if(this._is_native){
        this.comm('minSize', [width, height]);
      }
    },
    'getSupportedOrientations' : function(){
      if(!this._is_native){
        return null;
      }
      return this.comm('supportedOrientations');
    },
    'setSupportedOrientations' : function(orientations){
      if(this._is_native){
        this.comm('supportedOrientations', [orientations]);
      }
    }
  }
);

OJ.extendClass(
	'NwSession', [OjActionable],
	{
		'_props_' : {
			'data'  : null,
			'token' : null,
			'user'  : null
		},
		'_class_path' : 'nw.app.NwSession',

		'_constructor' : function(/*token, data*/){
			this._super(OjActionable, '_constructor', []);
			this._data = {};
			var ln = arguments.length;
			if(ln){
				this.setToken(arguments[0]);
				if(ln > 1){
					this.setData(arguments[1]);
				}
			}
		},

		// Utility Functions
		'exportData' : function(){
			var obj = this._super(OjActionable, 'exportData', arguments);
			obj.data = this._data ? OjObject.exportData(this._data) : {};
			obj.token = this._token;
			obj.user = this._user ? this._user.exportData() : null;
			return obj;
		},
		'importData' : function(obj){
			this._data = obj && obj.data ? OjObject.importData(obj.data) : {};
			this._token = obj && obj.token ? obj.token : null;
			this._user = obj && obj.user ? OjObject.importData(obj.user) : null;
		},
		'save' : function(){
			this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
		},

		// Getter & Setter Functions
		'get' : function(key){
			return this._data[key];
		},
		'set' : function(key, val){
			if(this._data[key] == val){
				return;
			}
			this._data[key] = val;
			this.save();
		},
		'unset' : function(key){
			delete this._data[key];
			this.save();
		},

		'setData' : function(val){
			if(this._data == val){
				return;
			}
			this._data = val ? val : {};
			this.save();
		},
		'setToken' : function(val){
			if(this._token == val){
				return;
			}
			this._token = val;
			this.save();
		},
		'setUser' : function(val){
			if(this._user == val){
				return;
			}
			this._user = val;
			this.save();
		}
	}
);


OJ.extendClass(
	'NwActionCard', [OjAlert],
	{
		'_props_' : {
			'actions'       : null,
			'allowMultiple' : false
		},
		'_template' : '<div><div var=underlay></div><div var=pane><button var=cancelBtn on-click=_onCancelClick>Cancel</button></div></div>',

		'_constructor' : function(/*btns, title, cancel_lbl = "Cancel", cancel_icon = null*/){
			var args = arguments,
				ln = args.length;
			this._super(OjAlert, '_constructor', []);
			// process arguments
			if(ln){
				this.setActions(args[0]);
				if(ln > 1){
					this.setTitle(args[1]);
					if(ln > 2){
						this.setCancelLabel(args[2]);
						if(ln > 3){
							this.setCancelIcon(args[3]);
						}
					}
				}
			}
		},
		'_destructor' : function(/*depth = 0*/){
			var args = arguments,
				depth = args.length ? args[0] : 0;
			this._unset(['title', 'actions', 'cancelBtn']);
			return this._super('OjModal', '_destructor', arguments);
		},

		'_onActionItemClick' : function(evt){
			var alrt = OjAlertEvent;
			if(!this._allowMultiple){
				this.dispatchEvent(new alrt(alrt.BUTTON_CLICK, evt.getIndex()));
				WindowManager.hide(this);
			}
		},

		'setActions' : function(val){
			var actions = this._actions;
			if(actions == val){
				return;
			}
			if(actions){
				actions.setParent(null);
				actions.removeEventListener(OjListEvent.ITEM_CLICK, this, '_onActionItemClick');
			}
			this.pane.addChildAt(actions = this._actions = val, this.pane.numChildren() - 1);
			if(actions){
				actions.addEventListener(OjListEvent.ITEM_CLICK, this, '_onActionItemClick');
			}
		},
		'getCancelLabel' : function(){
			return this.cancelBtn.getLabel();
		},
		'setCancelLabel' : function(val){
			this.cancelBtn.setLabel(val);
		},
		'getCancelIcon' : function(){
			return this.cancelBtn.getIcon();
		},
		'setCancelIcon' : function(val){
			this.cancelBtn.setIcon(val);
		},
		'getTitle' : function(){
			var title = this.title;
			return title ? title.getText() : null;
		},
		'setTitle' : function(val){
			if(val){
				if(!this.title){
					this.title = new OjLabel(val);
					this.title.addCss(['title']);
					this.pane.addChildAt(this.title, 0);
				}
				this.title.setText(val);
			}
			else{
				this._unset('title');
			}
		}
	}
);


OJ.extendComponent(
	'NwActionButton', [OjItemRenderer],
	{
		'_template' : '<div><button var=btn></button></div>',

		'_redrawData' : function(){
			if(this._super(OjItemRenderer, '_redrawData', arguments)){
				this.btn.setText(this._data);
				return true;
			}
			return false;
		}
	}
);


OJ.extendManager(
	'WindowManager', 'NwWindowManager', [OjWindowManager],
	{
		'_props_' : {
			'actionCardClass' : NwActionCard
		},

		'_actionCard' : function(buttons/*, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
			var args = arguments;
				args[0] = new OjList(buttons, NwActionButton);
			return this.makeActionCard.apply(this, args);
		},
		'_isMobileAC' : function(modal){
			return modal.is('NwActionCard') && OJ.isMobile();
		},
		'_transIn' : function(modal){
			this._super(OjWindowManager, '_transIn', arguments);
			if(this._isMobileAC(modal)){
				var h = modal.pane.getHeight(),
					y = modal.pane.getY();
				modal.pane.setY(y + h);
				// transition the modal
				var move = new OjMove(modal.pane, OjMove.Y, y, 250, OjEasing.OUT);
				move.start();
			}
		},
		'_transOut' : function(modal){
			this._super(OjWindowManager, '_transOut', arguments);
			if(this._isMobileAC(modal)){
				var h = modal.pane.getHeight(),
					y = modal.pane.getY();
				// transition the modal
				var move = new OjMove(modal.pane, OjMove.Y, y + h, 250, OjEasing.OUT);
				move.start();
			}
		},

		'alert' : function(message/*, title, buttons, cancel_label*/){
			var alrt = this.makeAlert.apply(this, arguments);
			// if app is not running natively then just call the regular alert
			if(NW.isNative()){
				var comm = this.comm('alert', [alrt.getContent(), alrt.getTitle(), alrt.getButtons(), alrt.getCancelLabel()]);
//				this._alerts[comm.getId()] = alrt;
				return comm.load();
			}
			else{
				this.show(alrt);
			}
			return alrt;
		},
		'actionCard' : function(buttons/*, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
			var card = this._actionCard.apply(this, arguments);
			if(isUndefined(NW.actionCard(card))){
				this.show(card);
			}
			return card;
		},
		'browser' : function(url, title/*, width, height*/){
			if(NW.isNative()){
				return this.comm('browser', Array.array(arguments)).load();
			}
			return this._super(OjWindowManager, 'browser', arguments);
		},
		'call' : function(phone){
			if(NW.isNative()){
				return this.comm('call', Array.array(arguments)).load();
			}
			return this._super(OjWindowManager, 'call', arguments);
		},
		'email' : function(email){
			if(NW.isNative()){
				return this.comm('email', [email]).load();
			}
			return this._super(OjWindowManager, 'email', arguments);
		},
		'makeActionCard' : function(/*actions, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
			return this._actionCardClass.makeNew(arguments);
		},
		'position' : function(modal){
			if(this._isMobileAC(modal)){
				var w = modal.getWidth(),
					h = modal.getHeight(),
					w2 = modal.getPaneWidth(),
					h2 = modal.getPaneHeight();
				modal.pane.setX((w - w2) / 2);
				modal.pane.setY(h - h2);
				return;
			}
			this._super(OjWindowManager, 'position', arguments);
		},
		'txt' : function(phone, message){
			if(NW.isNative()){
				return this.comm('txt', Array.array(arguments)).load();
			}
			return this._super(OjWindowManager, 'txt', arguments);
		}
	}
);


OJ.extendClass(
	'NwUrlLoader', [OjUrlLoader],
	{
		'_async' : true,  '_is_multipart' : false,
		'_loadMultiPartRequest' : function(){
			if(NW.isNative()){
				this._is_multipart = true;
				return this._load();
			}
			this._super(OjUrlLoader, '_loadMultiPart', arguments);
		},
		'_xhrFormat' : function(){
			if(this._is_multipart){
				this._xhr.setRequestHeader('content-type', OjUrlLoader.JSON);
				return;
			}
			this._super(OjUrlLoader, '_xhrFormat', arguments);
		},
		'_xhrOpen' : function(){
			if(this._is_multipart){
				return this._xhr.open(OjUrlRequest.POST, 'http://native.web/request', this._async);
			}
			this._super(OjUrlLoader, '_xhrOpen', arguments);
		},
		'_xhrSend' : function(){
			if(this._is_multipart){
				return this._xhr.send(toJson({
					'url'     : this._request.toString(),
					'headers' : this._request.getHeaders(),
					'method'  : this._request.getMethod(),
					'data'    : this._request.getData(),
					'files'   : this._request.getFiles()
				}));
			}
			this._super(OjUrlLoader, '_xhrSend', arguments);
		}
	}
);


OJ.extendClass(
	'NwUrlRequest', [OjUrlRequest],
	{
		'_props_' : {
			'priority' : 0,
			'method'   : OjUrlRequest.POST,
			'weight'   : 0
		},
		'_constructor' : function(){
			this._super(OjUrlRequest, '_constructor', arguments);
			this.setContentType(OjUrlRequest.JSON);
		}
	}
);


OJ.extendManager(
	'CacheManager', 'NwCacheManager', [OjCacheManager],
	{
		'_is_native' : false,

		'_constructor' : function(manager){
			this._super(OjCacheManager, '_constructor', arguments);
			// determine which set of functions to use based on the systems capabilities
			if(this._is_native = NW.isNative()){
//				this.getData = this.getNativeData;
//				this.setData = this.setNativeData;
//				this.unsetData = this.unsetNativeData;
			}
			this._policies = manager._policies;
			this._cache_size = manager._cache_size;
		},

		'getNativeData' : function(key){
		},
		'setNativeData' : function(key, value){
		},
		'unsetNativeData' : function(key){
		}
	}
);


OJ.defineClass(
  'NwIApp',
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
    '_has_mobile_layout' : false,  '_has_tablet_layout' : false,  '_is_logged_in' : false,
    '_orientations' : null,  '_ready' : false,  '_scale' : 1,  '_timer' : null,
    // the acl object will serve as a first-level permission control system to prevent users from doing things they shouldn't
    // ultimately the final level of permission control should be done on the server side
    '_acl' : null,

    '_init' : function(){
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
        OJ.meta('viewport', 'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no');
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
      this._is_logged_in = true;
      this.dispatchEvent(new OjEvent(NwApp.LOGIN));
      AppManager.dispatchEvent(new OjEvent(NwApp.LOGIN));
    },
    '_loginFail' : function(){
      this._is_logged_in = false;
      this.dispatchEvent(new OjEvent(NwApp.LOGIN_FAIL));
      AppManager.dispatchEvent(new OjEvent(NwApp.LOGIN_FAIL));
    },
    '_logout' : function(){
      this._is_logged_in = false;
      this.dispatchEvent(new OjEvent(NwApp.LOGOUT));
      AppManager.dispatchEvent(new OjEvent(NwApp.LOGOUT));
    },
    '_logoutFail' : function(){
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
      return this._is_logged_in;
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
  }
);

OJ.extendClass(
	'NwApp', [OjView, NwIApp],
  {
    '_constructor' : function(/*properties*/){
      this._super(OjView, '_constructor', arguments);
      this._init();
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


OJ.extendManager(
	'AppManager', 'NwAppManager', [OjActionable],
	{
		'_props_' : {
			'app' : null,
			'session' : null,
			'user' : null
		},
		'_oj_ready' : false,  '_ready' : false,

		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);
			// listen for when the OJ is ready
			if(OJ.isReady()){
				this._onOjReady(null);
			}
			else{
				OJ.addEventListener(OjEvent.READY, this, '_onOjReady');
			}
		},

		'_initApp' : function(){
			if(this._oj_ready && this._app && OJ.isSupported() && !this._ready){
				this._ready = true;
				// init the app and get the session session
				this._session = this._app.init();
				// let everyone know we are inited
				this.dispatchEvent(new OjEvent(OjEvent.INIT))
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
		'isReady' : function(){
			return this._ready;
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


OJ.extendClass(
	'NwEvent', [OjEvent],
	{
		'_get_props_' : {
			'data' : null
		},

		'_constructor' : function(type/*, bubbles = false, cancelable = false, data = null*/){
			var ln = arguments.length;
			this._super(OjEvent, '_constructor', ln > 3 ? [].slice.call(arguments, 0, 3) : arguments);
			if(ln > 3){
				this._data = arguments[3];
			}
		}
	}
);


OJ.extendClass(
	'NwRpc', [OjRpc],
	{
		'_get_props_' : {
			'gateway' : null
		},

		'_constructor' : function(url, method, params/*, content_type, async*/){
			this._super(OjRpc, '_constructor', arguments);
			this._request.getData()['gateway'] = NW.getGateway();
		}
	}
);


OJ.extendClass(
	'NwAnalyticsData', [OjObject],
	{
		'_props_' : {
			'date' : null
		},

		'_constructor' : function(){
			this._super(OjObject, '_constructor', []);
			this._date = new Date();
		}
	}
);


OJ.extendClass(
	'NwAnalyticsAction', [NwAnalyticsData],
	{
		'_props_' : {
			'category' : null,
			'isBounce' : false,
			'params'   : null,
			'name'     : null
		},

		'_constructor' : function(name/*, category, params, is_bounce*/){
			this._super(NwAnalyticsData, '_constructor', []);
			this.setName(name);
			var args = arguments,
				ln = args.length;
			if(ln > 1){
				this.setCategory(args[1]);
				if(ln > 2){
					this.setParams(args[2]);
					if(ln > 3){
						this.setIsBounce(args[3]);
					}
				}
			}
		}
	}
);


OJ.extendClass(
	'NwAnalyticsEvent', [OjEvent],
	{
		'_get_props_' : {
			'data'  : null
		},

		'_constructor' : function(type, data){
			this._super(OjEvent, '_constructor', [type, false, true]);
			this._data = data;
		}
	},
	{
		'ACTION'   : 'onAnalyticsAction',
		'MESSAGE'  : 'onAnalyticsMessage',
		'VIEW'     : 'onAnalyticsView'
	}
);


OJ.extendClass(
	'NwAnalyticsMessage', [NwAnalyticsData],
	{
		'_props_' : {
		},

		'_constructor' : function(){
			this._super(NwAnalyticsData, '_constructor', []);
		}
	}
);


OJ.extendClass(
	'NwAnalyticsView', [NwAnalyticsData],
	{
		'_props_' : {
			'title' : null,
			'path'   : null
		},

		'_constructor' : function(/*path, title*/){
			this._super(NwAnalyticsData, '_constructor', []);
			var args = arguments,
				ln = args.length;
			if(ln){
				this.setPath(args[0]);
				if(ln > 1){
					this.setTitle(args[1]);
				}
			}
		},

		'setPath' : function(val){
			if(this._path == val){
				return;
			}
			if((this._path = val) && val.charAt(0) != '/'){
				this._path = '/' + val;
			}
		}
	}
);


OJ.extendManager(
	'Analytics', 'NwAnalytics', [OjActionable],
	{
		'_constructor' : function(/*manager*/){
			this._super(OjActionable, '_constructor', []);
		},
		'enableEngine' : function(engine){
			engine.enable();
		},
		'disableEngine' : function(engine){
			engine.disable();
		},
		'log' : function(msg){
			this.dispatchEvent(
				new NwAnalyticsEvent(
					NwAnalyticsEvent.MESSAGE,
					new NwAnalyticsMessage(msg)
				)
			);
		},
		'trackEvent' : function(action/*, category, params, is_bounce*/){
			var args = arguments,
				ln = args.length,
				data = new NwAnalyticsAction(action);
			if(ln > 1){
				data.setCategory(args[1]);
				if(ln > 2){
					data.setParams(args[2]);
					if(ln > 3){
						data.setIsBounce(args[3]);
					}
				}
			}
			this.dispatchEvent(new NwAnalyticsEvent(NwAnalyticsEvent.ACTION, data));
		},
		'trackView' : function(/*path, title*/){
			var args = arguments,
				ln = args.length,
				data = new NwAnalyticsView();
			if(ln){
				data.setPath(args[0]);
				if(ln > 1){
					data.setTitle(args[1]);
				}
			}
			this.dispatchEvent(new NwAnalyticsEvent(NwAnalyticsEvent.VIEW, data));
		}
	}
);


OJ.extendClass(
	'NwAnalyticsEngine', [OjActionable],
	{
		'_queue' : null,  '_processing' : false,

		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);
			this._queue = new OjCollection();
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
			var ln = this._queue.numItems(),
				item, func;
			for(; ln--;){
				func = '_processItem';
				item = this._queue.getItemAt(ln);
				switch(item.getType()){
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
				params.name = tthis._name = this.id();
			}
			window.ga('create', this._key, this._namespace, params);
		},
		'_loadLibrary' : function(){
			this._super(NwAnalyticsEngine, '_loadLibrary', []);
			var w = window;
			w.GoogleAnalyticsObject = 'ga';
			w.ga = function(){
				(w.ga.q = w.ga.q || []).push(arguments);
			};
			w.ga.l = 1 * new Date();
			OJ.loadJs('//www.google-analytics.com/analytics.js', true);
		},
		'_processActionItem' : function(evt){
			var action = evt.getData(),
				category = action.getCategory(),
				params = action.getParams(),
				args = {
					'eventCategory'  : category ? category : 'misc',
					'eventAction'    : action.getName(),
					'nonInteraction' : !action.getIsBounce()
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
			var action = evt.getData(),
				args = {
					'page' : action.getPath(),
					'title' : action.getTitle()
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
)


OJ.extendComponent(
  'NwTray', [OjComponent],
  {
    '_props_' : {
      'actuator' : null,
      'allowSlide' : false,
      'tray' : null
    },
    '_template' : '<div><div var=tray></div><div var=container></div></div>',
    // '_tray_anim' : null,

    '_constructor' : function(/*actuator, allowSlide = false unless native and mobile*/){
      this._super(OjComponent, '_constructor', []);
      this._processArguments(arguments, {
        'setActuator' : undefined,
        'setAllowSlide' : OJ.isMobile() && NW.isNative()
      });
    },

    '_startTrayAnim' : function(tray_amount, content_amount){
			var easing = OjEasing.STRONG_OUT,
				  dir = OjMove.X;
			this._stopTrayAnim();
			this._tray_anim = new OjTweenSet(
				new OjMove(this.tray, dir, tray_amount, 250, easing),
				new OjMove(this.container, dir, content_amount, 250, easing)
			);
			this._tray_anim.start();
		},
		'_stopTrayAnim' : function(){
			this._unset('_tray_anim');
		},
    '_updateActuatorListeners' : function(action){
      if(this._actuator){
        this._actuator[action + 'EventListener'](OjMouseEvent.CLICK, this, '_onActuatorClick');
      }
    },
    '_updateContainerListeners' : function(action){
      this.container[action + 'EventListener'](OjMouseEvent.DOWN, this, '_onTrayBlur');
    },
    '_updateDragListeners' : function(action){
      if(this._actuator){
        this._actuator[action + 'EventListener'](OjDragEvent.START, this, '_onActuatorDragStart');
        this._actuator[action + 'EventListener'](OjDragEvent.MOVE, this, '_onActuatorDragMove');
      }
    },

    '_onActuatorClick' : function(evt){
      this.toggleTray();
    },
    '_onActuatorDragMove' : function(evt){
    },
    '_onActuatorDragStart' : function(evt){
    },
		'_onTrayBlur' : function(evt){
			this.hideTray();
		},

    'hideTray' : function(){
        var amount = this.getWidth() * -.6;
        if(this.tray.getX() == amount){
          return;
        }
        this._startTrayAnim(amount, 0);
        this._updateContainerListeners(OjActionable.REMOVE);
    },
    'showTray' : function(){
//        if(!this.tray.getX()){
//            return;
//        }
        this._startTrayAnim(0, this.getWidth() * .6);
    },

    'toggleTray' : function(/*val*/){
        var w = this.getWidth(),
            val = arguments.length? arguments[0] : this.container.getX();
        if(val < w * .3){
            this.showTray();
        }
        else{
            this.hideTray();
        }
    },
    'setActuator' : function(val){
      if(this._actuator ==  val){
        return;
      }
      this._updateActuatorListeners(OjActionable.REMOVE);
      this._updateDragListeners(OjActionable.REMOVE);
      this._actuator = val;
      this._updateActuatorListeners(OjActionable.ADD);
      if(this._allowSlide){
        this._updateDragListeners(OjActionable.ADD);
      }
    },
    'setAllowSlide' : function(val){
      if(this._allowSlide == val){
        return;
      }
      this._updateDragListeners((this._allowSlide = val) ? OjActionable.ADD : OjActionable.REMOVE);
    },
    'setTray' : function(val){
      this.tray.removeAllChildren();
      if(this._tray = val){
        this.tray.addChild(val);
      }
    },
    'getTrayPosition' : function(){
      return this.container.getX();
    },
    'setTrayPosition' : function(val){
      var w = this.getWidth() * .6;
      this.tray.setX(Math.max(Math.min(val - w, 0), -(w)));
      this.container.setX(Math.min(Math.max(val, 0), w));
//      this._updateContainerListeners(OjActionable.ADD);
    }
  },
  {
    '_TAGS' : ['tray']
  }
);

OJ.extendComponent(
  'NwTrayApp', [NwTray, NwIApp],
  {
    '_constructor' : function(){
      this._super(NwTray, '_constructor', arguments);
      this._init();
    }
	}
);


OJ.extendClass(
	'NwMarquee', [OjComponent],
	{
		// properties & vars
		'_props_' : {
			'buttonMode'        : null,
			'interval'          : 0,
			'nextButtonIcon'    : null,
			'nextButtonLabel'   : 'Next >',
			'prevButtonIcon'    : null,
			'prevButtonLabel'   : '< Prev'
		},
		'_template' : '<div><div var=prerender></div><stack var=container></stack></div>',
//		'_timer' : null,  'nextBtn' : null,  'prevBtn' : null,

		// Construction & Destruction Functions
		'_constructor' : function(/*items, transition, item_renderer*/){
			this._super(OjComponent, '_constructor', []);
			var args = arguments,
				ln = args.length;
			// setup the stack
			this.container.setAllowLooping(true);
			this.container.addEventListener(OjMouseEvent.OVER, this, '_onMouseOver');
			this.container.addEventListener(OjMouseEvent.OUT, this, '_onMouseOut');
			this.container.addEventListener(OjStackEvent.CHANGE_COMPLETE, this, '_onChange');
			// setup stack
			if(ln){
				if(ln > 1){
					if(ln > 2){
						this.setItemRenderer(args[2]);
					}
					this.setTransition(args[1]);
				}
				this.setItems(args[0]);
			}
			// setup the timer
			this._timer = new OjTimer(this._interval * 1000, 0);
			this._timer.addEventListener(OjTimer.TICK, this, '_onTimerTick');
			// set the default button mode
			this.setButtonMode(NwMarquee.HIDE_BUTTONS);
		},
		'_destructor' : function(){
			this._unset('_timer');
			return this._super(OjComponent, '_destructor', arguments);
		},

		'_setIsDisplayed' : function(displayed){
			if(this._is_displayed == displayed){
				return;
			}
			this._super(OjComponent, '_setIsDisplayed', arguments);
			if(this._is_displayed){
				if(this._timer.isPaused()){
					this.start();
				}
				this.redraw();
			}
			else if(this._timer.isRunning()){
				this._timer.pause();
			}
		},

		// Helper Functions
		'_redrawButtons' : function(){
			if(this._is_displayed){
				if(this.prevBtn){
					this.prevBtn.setIsDisabled(!this._allowLooping && this._current_index <= 0);
				}
				if(this.nextBtn){
					this.nextBtn.setIsDisabled(!this._allowLooping && this._current_index >= this.numElms() - 1);
				}
				return true;
			}
			return false;
		},

		// Event Handler Functions
		'_onChange' : function(evt){
			var stack = this.container,
				index = evt.getIndex(), item;
			this.prerender.setChildren(
				[
					(item = stack.getElmAt(index - 1)) == stack.getActive() ? null : stack.renderItem(item),
					(item = stack.getElmAt(index + 1)) == stack.getActive() ? null : stack.renderItem(item)
				]
			);
		},
		'_onTimerTick' : function(evt){
			this.next();
		},
		'_onMouseOut' : function(evt){
			if(this._timer.getState() == OjTimer.PAUSED){
				this.start();
			}
		},
		'_onMouseOver' : function(evt){
			if(this._timer.isRunning()){
				this._timer.pause();
			}
		},
		'_onNextClick' : function(evt){
			this.next();
		},
		'_onPrevClick' : function(evt){
			this.prev();
		},

		// Utility Functions
		'next' : function(){
			if(this._timer.isRunning()){
				this._timer.restart();
			}
			this.container.next();
		},
		'prev' : function(){
			if(this._timer.isRunning()){
				this._timer.restart();
			}
			this.container.prev();
		},
		'start' : function(){
			if(this._interval){
				this._timer.start();
			}
		},
		'stop' : function(){
			this._timer.stop();
		},

		// Getter & Setter Functions
		'getAllowLooping' : function(){
			return this.container.getAllowLooping();
		},
		'setAllowLooping' : function(allow_looping){
			this.container.setAllowLooping(allow_looping);
			this._redrawButtons();
		},
		'getAlwaysTrans' : function(){
			return this.container.getAlwaysTrans();
		},
		'setAlwaysTrans' : function(val){
			return this.container.setAlwaysTrans(val);
		},
		'setButtonMode' : function(val){
			if(this._buttonMode == val){
				return;
			}
			if(this._buttonMode){
				this.removeCss([this._buttonMode]);
			}
			this.addCss([this._buttonMode = val]);
			if(this._buttonMode == this._static.HIDE_BUTTONS){
				this.removeChild(this.prevBtn);
				this.removeChild(this.nextBtn);
			}
			else{
				if(!this.prevBtn){
					this.prevBtn = new OjButton(this._prevButtonLabel, this._prevButtonIcon);
					this.prevBtn.addCss(['prevBtn']);
					this.prevBtn.addEventListener(OjMouseEvent.CLICK, this, '_onPrevClick');
				}
				this.addChild(this.prevBtn);
				if(!this.nextBtn){
					this.nextBtn = new OjButton(this._nextButtonLabel, this._nextButtonIcon);
					this.nextBtn.addCss(['nextBtn']);
					this.nextBtn.addEventListener(OjMouseEvent.CLICK, this, '_onNextClick');
				}
				this.addChild(this.nextBtn);
			}
		},
		'setInterval' : function(interval){
			this._interval = interval;
			this._timer.setDuration(interval * 1000);
		},
		'setIsDisabled' : function(val){
			if(this._isDisabled == val){
				return;
			}
			this._super(OjComponent, 'setIsDisabled', arguments);
			if(this._isDisabled && this._timer.isRunning()){
				this._timer.pause();
			}
			else if(!this._isDisabled && this._timer.isPaused()){
				this.start();
			}
		},
		'getItemRenderer' : function(){
			return this.container.getItemRenderer();
		},
		'setItemRenderer' : function(val){
			this.container.setItemRenderer(val);
		},
		'getItems' : function(){
			return this.container.getElms();
		},
		'setItems' : function(val){
			this.container.setElms(val);
		},
		'setNextButtonIcon' : function(icon){
			if(this._nextButtonIcon == icon){
				return;
			}
			this._nextButtonIcon = icon;
			if(this.nextBtn){
				this.nextBtn.setIcon(icon);
			}
		},
		'setNextButtonLabel' : function(lbl){
			if(this._nextButtonLabel == lbl){
				return;
			}
			this._nextButtonLabel = lbl;
			if(this.nextBtn){
				this.nextBtn.setLabel(lbl);
			}
		},
		'setPrevButtonIcon' : function(icon){
			if(this._prevButtonIcon == icon){
				return;
			}
			this._prevButtonIcon = icon;
			if(this.prevBtn){
				this.prevBtn.setIcon(icon);
			}
		},
		'setPrevButtonLabel' : function(lbl){
			if(this._prevButtonLabel == lbl){
				return;
			}
			this._prevButtonLabel = lbl;
			if(this.prevBtn){
				this.prevBtn.setLabel(lbl);
			}
		},
		'getTransition' : function(){
			return this.container.getTransition();
		},
		'setTransition' : function(val){
			return this.container.setTransition(val);
		}
	},
	{
		// static
		'HIDE_BUTTONS'  : 'hide-buttons',
		'HOVER_BUTTONS' : 'hover-buttons',
		'SHOW_BUTTONS'  : 'show-buttons'
	}
);


OJ.extendClass(
	'NwCarousel', [NwMarquee],
	{
		'_props_' : {
			'viewSize' : 50
		},
		'_allow_loop' : false,  '_current_pos' : 0,  '_index' : null,
		'_offset' : 0,  '_tween' : null,  '_view_offset' : 0,  '_visable_size' : 0,

		'_constructor' : function(/*data, item_renderer*/){
			this._index = {};
			this._super(NwMarquee, '_constructor', arguments);
		},

		'_redrawPosition' : function(pos){
			if(!this._collection){
				return;
			}
			// get all the vars/values needed to make this happen
			var i, index, x, view, start, stop,
				offset = this._offset + this._view_offset,
				max = this._collection.numItems(), elms = this.container.getChildren();
			// calculate which views to show and where they view goes
			if(pos < 0){
				start = Math.ceil((pos - offset) / this._viewSize);
				stop = Math.ceil((pos + offset) / this._viewSize);
			}
			else{
				start = Math.signedCeil((pos - offset) / this._viewSize);
				stop = Math.signedCeil((pos + offset) / this._viewSize);
			}
			for(i = start; i < stop; i++){
				if(i < 0){
					if(this._allow_loop){
						x = i * this._viewSize;
						index = (max - 1) + (i % max);
					}
					else{
						index = 0;
						x = 0;
					}
				}
				else if(i < max){
					x = (index = i) * this._viewSize;
				}
				else{
					if(this._allow_loop){
						index = i % max;
					}
					else{
						index = max - 1;
					}
					x = i * this._viewSize;
				}
				if(view = this.getElmAt(index)){
					view.setX(x + this._offset - this._view_offset - pos);
					view.setWidth(this._viewSize);
					if(this.container.hasChild(view)){
						elms.splice(elms.indexOf(view), 1);
					}
					else{
						view.addEventListener(OjMouseEvent.CLICK, this, '_onViewClick');
						this.container.addChild(view);
					}
					// store the index
					this._index[view.id()] = i;
				}
			}
			// remove any old views
			i = elms.length;
			while(i--){
				elms[i].removeEventListener(OjMouseEvent.CLICK, this, '_onViewClick');
				this.container.removeChild(elms[i]);
			}
			// set the new position as current
			this._current_pos = pos;
		},

		'redraw' : function (){
			if(this._super(NwMarquee, 'redraw', arguments)){
				this._visable_size = this.container.getWidth();
				this._offset = this._visable_size / 2;
				this._view_offset = this._viewSize / 2;
				this._allow_loop = this._visable_size < this.numElms() * this._viewSize;
				this._redrawPosition(this._current_pos);
				return true;
			}
			return false;
		},

		'_onTweenTick' : function(evt){
			this._redrawPosition(evt.getValue());
		},
		'_onViewClick' : function(evt){
			this.setActiveIndex(this._index[evt.getCurrentTarget().id()]);
		},

		'setActiveIndex' : function(val){
			var w = null, h = null, direction = null;
			if(this._activeIndex == val && this._active){
				return;
			}
			// if we don't have an active then no need to animate
			if(!this._active){
				this._activeIndex = val;
				this._active = this.getElmAt(val);
				this._redrawPosition(val * this._viewSize);
				return;
			}
			var total = this.numElms();
			// setup the animation here
			this._tween = new OjTween(this._current_pos, (this._current_index = val) * this._viewSize, 300, OjEasing.OUT);
			this._tween.addEventListener(OjTweenEvent.TICK, this, '_onTweenTick');
			val = val % total;
			// set the active
			if(val < 0){
				val = total + val;
			}
			this._activeIndex = val;
			if(this._active = this.getElmAt(val)){
				// start the animation
				this._tween.start();
			}
			else{
				this._activeIndex = -1;
			}
		}
	}
);


OJ.extendClass(
	'NwLayout', [OjActionable],
	{
		'_props_' : {
			'hSpacing' : 0,
			'target'   : null,
			'vSpacing' : 0
		},
		// '_layouts' : null,

		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);
			this._layouts = {};
		},

		'_recalculateLayoutItem' : function(index, item){
			if(this._layouts[index]){
				return this._layouts[index];
			}
			return this._layouts[index] = item.getRect();
		},

		'recalculateLayout' : function(index){
			if(!this._target){
				return;
			}
			var i = index, elm, layout, rendered = false,
				ln = this._target.numElms();
			for(; i < ln; i++){
				elm = this._target.renderItemAt(i);
				rendered = !elm.parent();
				if(rendered){
					OJ.render(elm);
				}
				layout = this._recalculateLayoutItem(i, elm);
				if(rendered){
					elm.parent(null);
				}
				elm.setX(layout.getLeft());
				elm.setY(layout.getTop());
			}
		},
		'getVisible' : function(rect){
			var ln = this._target.numElms(),
				visible = [];
			for(; ln--;){
				if(rect.hitTestRect(this._layouts[ln])){
					visible.push(ln)
				}
			}
			return visible;
		},

		'getItemRectAt' : function(index){
			return this._layouts[index];
		},
		'setTarget' : function(val){
			if(this._target == val){
				return;
			}
			this._target = val;
			this.recalculateLayout(0);
		}
	}
);

window.NwILayoutable = {
};


OJ.extendClass(
	'NwColumnLayout', [NwLayout],
	{
		'_props_' : {
			'numCols' : 1
		},
		// '_col_widths' : null

		'_constructor' : function(/*num_cols = 1*/){
			this._super(NwLayout, '_constructor', []);
			this._col_widths = [0];
			var args = arguments;
			if(args.length){
				this.setNumCols(args[0]);
			}
		},

		'_recalculateLayoutItem' : function(index, item){
			var layout = this._super(NwLayout, '_recalculateLayoutItem', arguments),
				x, y;
			// detect if this is the first item
			if(!index){
				// if it is then its at (0, 0)
				x = y = 0;
			}
			else{
				var col = index % this._numCols,
					w = !this._col_widths[col] || index < this._numCols ? item.getWidth() : this._col_widths[col],
					prev = index < this._numCols ? null : this._layouts[index - this._numCols];
				// store the col width
				this._col_widths[col] = w;
				// calculate the x and y
				x = (col * w) + (col  * this._hSpacing);
				y = prev ? prev.getBottom() + this._vSpacing : 0;
			}
			// set the x and y for the item
			layout.setLeft(x);
			layout.setTop(y);
			return layout;
		},

		'setNumCols' : function(val){
			val = Math.max(val, 0);
			if(this._numCols == val){
				return;
			}
			this._numCols = val;
			this._col_widths = [];
			for(; val--;){
				this._col_widths.push(0);
			}
			this.recalculateLayout(0);
		}
	}
);


OJ.extendComponent(
	'NwScrollPane', [OjView],
	OJ.implementInterface(
		OjICollectionComponent,
		{
			'_props_' : {
				'layout'      : null,
				'allowScroll' : 'both' // NwScrollPane.BOTH
			},
			'_custom_scroll' : OJ.isTouchCapable() && (OJ.isMobile() || OJ.isTablet()),
			'_multiplier' : 2,  '_lastScroll' : 0,
//			'_scrollPosX' : 0,  '_scrollPosX' : 0

			'_constructor' : function(/*layout=new NwColumnLayout(1)*/){
				var args = arguments;
//				if(this._custom_scroll){
//					this._template = 'nw.components.NwScrollPane';
//				}
				this._super(OjView, '_constructor', []);
				// run the collection component setup
				this._setup();
				// figure out what events to listen for
//				if(this._custom_scroll){
////					this.addEventListener(OjDragEvent.START, this, '_onPaneScrollStart');
////					this.addEventListener(OjDragEvent.DRAG, this, '_onPaneScrollMove');
//					this.addEventListener(OjDragEvent.END, this, '_onPaneScrollEnd');
//				}
//				else{
					this.addEventListener(OjScrollEvent.SCROLL, this, '_onPaneScroll');
//				}
                // add a hack for the touch event bug with mobile safari
                if(OJ.isMobile() && OJ.getBrowser() == OJ.SAFARI){
                    this.addEventListener(OjMouseEvent.CLICK, this, '_onMobileSafariClick');
                }
				// setup the elm function overrides
				this._dims = [];
				this.setLayout(args.length ? args[0] : new NwColumnLayout());
				if(OJ.isMobile()){
					this._multiplier = 4;
				}
			},
			'_destructor' : function(){
				// run the collection component teardown
				this._teardown();
				this._super(OjView, '_destructor', arguments);
			},

			'_canScrollX' : function(){
				return this._allowScroll == this._static.X || this._allowScroll == this._static.BOTH;
			},
			'_canScrollY' : function(){
				return this._allowScroll == this._static.Y || this._allowScroll == this._static.BOTH;
			},

			'_onPaneScroll' : function(evt){
				var now = (new Date()).getTime();
				if(now - this._lastScroll > 5){
					this._lastScroll = now;
					this.redraw();
				}
			},
			'_onPaneScrollStart' : function(evt){
//				this._scrollX = this.content.getX();
//				this._scrollY = this.content.getY();
			},
			'_onPaneScrollMove' : function(evt){
//				var max_x = this._canScrollX() ? this.getWidth() - this.content.getWidth() : 0,
//					max_y = this._canScrollY() ? this.getHeight() - this.content.getHeight() : 0;
//				trace(this._scrollY + evt.getDeltaY(), this.getHeight(), this.content.getHeight());
//				this.content.setX(Math.max(Math.min(this._scrollX + evt.getDeltaX(), 0), max_x));
//				this.content.setY(Math.max(Math.min(this._scrollY + evt.getDeltaY(), 0), max_y));
//
//				this.redraw();
			},
			'_onPaneScrollEnd' : function(evt){
//				trace(evt);
			},
            '_onMobileSafariClick' : function(evt){
                // this is a hack for a bug with safari and not registering touches on previously hidden elements
            },

			'addEventListener' : function(type, target, func){
				this._super(OjView, 'addEventListener', arguments);
                this._addItemListener(type);
			},
			'removeEventListener' : function(type, target, func){
				this._super(OjView, 'removeEventListener', arguments);
				this._removeItemListener(type);
			},
			'redraw' : function(){
				if(this._super(OjView, 'redraw', arguments)){
					// redraw the visible items
					var container = this.container,
						y = this.getScrollY(), h = this.getHeight(),
						visible = this._layout.getVisible(
							new OjRect(
								this.getScrollX() - container.getX(), y - container.getY(),
								this.getWidth() * this._multiplier, h * this._multiplier
							)
						),
						ln = container.numChildren(),
						i;
					// figure which of the existing will stay and go
					for(; ln--;){
						if((i = visible.indexOf(this.indexOfElm(container.getChildAt(ln)))) == -1){
							container.removeChildAt(ln);
						}
						else{
							visible.splice(i, 1);
						}
					}
					// add all the new items
					for(ln = visible.length; ln--;){
						container.addChild(this.renderItemAt(visible[ln]));
					}
					// check to see if the footer is visible
					// note: footer needs to be first since we recycle the h var for header
					if(this.footer){
						if(y + h < this.footer.getY()){
							if(this._footer.parent()){
							}
						}
						else{
							this.footer.addChild(this._footer);
							this.footer.setHeight(OjStyleElement.AUTO);
						}
					}
					// check to see if the header is visible
					if(this.header){
						if(y > (h = this.header.getHeight())){
							if(this._header.parent()){
								this.header.setHeight(h);
								this.header.removeAllChildren();
							}
						}
						else{
							this.header.addChild(this._header);
							this.header.setHeight(OjStyleElement.AUTO);
						}
					}
					return true;
				}
				return false;
			},

			// Event Handler Functions
			'_onItemAdd' : function(evt){
				this._onItemChange(evt);
			},
			'_onItemChange' : function(evt){
				this._layout.recalculateLayout(evt.getIndex());
				this.container.setHeight(this._layout.getItemRectAt(this.numElms() - 1).getBottom());
				this.redraw();
			},
			'_onItemMove' : function(evt){
				this._super(OjView, '_onItemMove', arguments);
				this._onItemChange(evt);
			},
			'_onItemRemove' : function(evt){
				this._super(OjView, '_onItemRemove', arguments);
				this._onItemChange(evt);
			},
			'_onItemReplace' : function(evt){
				this._super(OjView, '_onItemReplace', arguments);
				this._onItemChange(evt);
			},

			// getter & setter functions
			'setLayout' : function(val){
				if(this._layout == val){
					return;
				}
				(this._layout = val).setTarget(this);
			}
			//,
//			'getScrollX' : function(){
//				return this._custom_scroll ? this.content.getX() * -1 : this._super(OjView, 'getScrollX', arguments);
//			},
//			'setScrollX' : function(val){
//				if(this._custom_scroll){
//					return this.content.setX(-1 * val);
//				}
//
//				this._super(OjView, 'setScrollX', arguments);
//			},
//
//			'getScrollY' : function(){
//				return this._custom_scroll ? this.content.getY() * -1 : this._super(OjView, 'getScrollY', arguments);
//			},
//			'setScrollY' : function(val){
//				if(this._custom_scroll){
//					return this.content.setY(-1 * val);
//				}
//
//				this._super(OjView, 'setScrollY', arguments);
//			}
		}
	),
	{
		'_TAGS' : ['scrollpane'],
		'BOTH' : 'x',
		'X'    : 'x',
		'Y'    : 'y'
	}
);


OJ.extendClass(
	'NwDataEvent', [OjEvent],
	{
		'_get_props_' : {
			'data'    : null,
			'oldData' : null
		},

		'_constructor' : function(type/*, data = null, old_data = null, bubbles = false, cancelable = false*/){
			var cancelable, bubbles = cancelable = false, ln = arguments.length;
			if(ln > 1){
				this._data = arguments[1];
				if(ln > 2){
					this._oldData = arguments[2];
					if(ln > 3){
						bubbles = arguments[3];
						if(ln > 4){
							cancelable = arguments[4];
						}
					}
				}
			}
			this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);
		}
	},
	{
		'CHANGE'      : 'onDataChange',
		'DELETE'      : 'onDataDelete',
		'LOAD'        : 'onDataLoad',
		'SAVE'        : 'onDataSave'
	}
);


OJ.extendClass(
	'NwDataErrorEvent', [OjErrorEvent],
	{
		'_get_props_' : {
			'data'    : null
		},

		'_constructor' : function(type/*, data, text = null, code = 0, bubbles = false, cancelable = false*/){
			var args = Array.array(arguments),
				ln = args.length;
			if(ln > 1){
				this._data = args[1];
				args.splice(1, 1);
			}
			this._super(OjErrorEvent, '_constructor', args);
		}
	},
	{
		'DELETE' : 'onDataDeleteError',
		'LOAD'   : 'onDataLoadError',
		'SAVE'   : 'onDataSaveError'
	}
);


OJ.extendClass(
	'NwProperty', [OjObject],
	{
		'_props_' : {
			'default'         : null,
			'defaultValue'    : null,
			'label'           : null,
			'max'             : 1,
			'min'             : 0,
			'readCallback'    : null,
			'readPermission'  : '*',
			'required'        : false,
			'writeCallback'   : null,
			'writePermission' : '*'
		},
		'_get_props_' : {
			'name' : null
		},

		'_constructor' : function(/*settings*/){
			this._super(OjObject, '_constructor', []);
			if(arguments.length){
				var key, func, settings = arguments[0];
				for(key in settings){
					func = 'set' + key.ucFirst();
					if(isFunction(this[func])){
						this[func](settings[key]);
					}
				}
			}
		},
		'_exportValue' : function(value, old_value, mode){
			return value;
		},
		'_formatter' : function(func, value/*, old_value, mode*/){
			var ln = arguments.length,
				old_value = ln > 2 ? arguments[2] : null,
				mode = ln > 3 ? arguments[3] : NwData.DEFAULT;
			if(this._max != 1){
				var old_ln = isArray(old_value) ? old_value.length : 0;
				if(!isArray(value)){
					return [func.call(this, value, old_ln ? old_value[0] : null, mode)];
				}
				var ary = [];
				for(var i = value.length; i--;){
					ary.unshift(func.call(this, value[i], i < old_ln ? old_value[i] : null, mode));
				}
				return ary;
			}
			return func.call(this, value, old_value, mode);
		},
		'_importValue' : function(value, old_value, mode){
			return value;
		},
		'_valueIsValid' : function(value){
			return true;
		},

		'exportValue' : function(value, mode){
			return this._formatter(this._exportValue, value, null, mode);
		},
		'importValue' : function(value, old_value, mode){
			return this._formatter(this._importValue, value, old_value, mode);
		},
		'makeInput' : function(/*dom_elm|input*/){
			var input;
			if(arguments.length && isObjective(input = arguments[0])){
				// don't do anything
			}
			else{
				
				input = new OjTextInput(this._name, this._label, this._defaultValue);
			}
			input.setDefault(this._default);
			input.setRequired(this._required);
			return input;
		},
		'setup' : function(obj, key, u_key){
			// setup the name
			this._name = key;

			// setup the getter & setter
			var getter = 'get' + u_key,
				setter = 'set' + u_key;
			// setup the getter function if one doesn't already exist
			if(!obj[getter]){
				obj[getter] = function(){
					return this._static.getProperty(key).value(this, key);
				};
			}
			// setup the setter function if one doesn't already exist
			if(!obj[setter]){
				obj[setter] = function(val){
					this._static.getProperty(key).value(this, key, val);
				};
			}
		},
		'userCanRead' : function(user, data){
			return this._readPermission && user.hasPermission(this._readPermission) &&
				(!this._readCallback || this._readCallback(user, data, this));
		},
		'userCanWrite' : function(user, data){
			return this._writePermission && user.hasPermission(this._writePermission) &&
				(!this._writeCallback || this._writeCallback(user, data, this));
		},
		'value' : function(obj, key/*, val*/){
			var args = arguments;
			return obj.property.apply(obj, Array.array(args).slice(1));
		},
		'valueIsValid' : function(value){
			if(this._max == 1){
				return this._valueIsValid(value) && (!this._min || isSet(value));
			}
			if(!isArray(value)){
				return false;
			}
			var count = 0;
			for(var i = value.length; i--;){
				if(!this._valueIsValid(value[i])){
					return false;
				}
				count++;
			}
			return !this._min || !(count < this._min);
		},

		'setMax' : function(val){
			this._max = Math.max(val, 0);
		},
		'setMin' : function(val){
			this._min = Math.max(val, 0);
		}
	}
);

// register special tags for inputs representing the applicable data property
OjStyleElement.registerComponentTag('datainput', function(dom){
	var source = dom.getAttribute('source').split('.');
	dom.removeAttribute('source');
	return OJ.stringToClass(source[0]).DEFINITION[source[1]].makeInput(dom);
});
OjStyleElement.registerComponentTag('datainputs', function(dom){
	var source = dom.getAttribute('source'),
		inputs = OjStyleElement(),
		def = OJ.stringToClass(source).DEFINITION,
		key;
	dom.removeAttribute('source');
	for(key in def){
		inputs.addChild(def[key].makeInput());
	}
	return inputs;
});


OJ.extendClass(
	'NwUuidProperty', [NwProperty],
	{}
);


OJ.extendClass(
	'NwData', [OjActionable],
	{
		// Compiler Functions
		'_post_compile_' : function(context){
			NwData.registerDataType(this._static.TYPE, this._class_name);
			var def = this._static.DEFINITION,
				e_map = this._static.EXPORT_MAP,
				i_map = (this._static.IMPORT_MAP = Object.clone(this._static.IMPORT_MAP)),
				key;
			// setup the definition
			for(key in def){
				// setup the data functions for the property
				def[key].setup(this, key, key.ucFirst());
			}
			// make sure the import/export map is synced
			for(key in e_map){
				i_map[e_map[key]] = key;
			}
			this._static.CACHE = {};
			this._static._BACKLOG = [];
		},

		// Properties & Variables
//		'_data' : null,  '_dirty' : null,  '_keyword_cache' : null,
//
//		'_loader' : null,  '_is_loaded' : false,

		// Construction & Destruction Functions
		'_constructor' : function(/*data, mode*/){
			this._super(OjActionable, '_constructor', []);
			this._data = {};
			this._dirty = [];
			this._keyword_cache = {};
			// import any data if present and don't dispatch any change events
			// since no one could be listening at this point
			var ln = arguments.length;
			if(ln){
				this._prevent_dispatch = true;
				this.importData(arguments[0], ln > 1 ? arguments[1] : NwData.DEFAULT);
				this._prevent_dispatch = false;
			}
		},

		// Helper Functions
		'_addToDirty' : function(prop){
			if(this._dirty && this._dirty.indexOf(prop) == -1){
				this._dirty.push(prop);
			}
		},
		'_exportValue' : function(prop, mode){
			if(this._static.hasProperty(prop)){
				return this._static.DEFINITION[prop].exportValue(this._data[prop], mode);
			}
			return this._data[prop];
		},
		'_getDeleteRequest' : function(method/*, params*/){
			var args = Array.prototype.splice.call(arguments, 0);
			if(args.length < 2){
				var params = {};
				params[this._static.PRIMARY_KEY] = this.primarKey();
				args.push(params);
			}
			var ldr = this._getRequest(this._translateDeleteParam, args);
			ldr.getRequest().setType(OjUrlRequest.POST);
			return ldr;
		},
		'_getLoadRequest' : function(method/*, params*/){
			var args = Array.prototype.splice.call(arguments, 0);
			if(args.length < 2){
				var params = {};
				params[this._static.PRIMARY_KEY] = this.primaryKey();
				args.push(params);
			}
			return this._getRequest(this._translateLoadParam, args);
		},
		'_getRequest' : function(translate_func, args){
			if(args.length > 1){
				var key, translated, val, prop,
					obj = {};
				for(key in args[1]){
					translated = translate_func.call(this, key);
					if(translated){
						val = this._exportValue(key, NwData.API);
						// if the value is an object then we need to check the flatten property flag
						if(isObject(val) && (prop = this._static.getProperty(key)).getFlatten()){
							for(key in val){
								translated = translate_func.call(this, prop.getNamespace() + '.' + key);
								if(translated){
									obj[translated] = val[key];
								}
							}
						}
						else{
							obj[translated] = val;
						}
					}
				}
				args[1] = obj;
			}
			return AppManager.apiRequest.apply(AppManager, args);
		},
		'_getSaveRequest' : function(/*method, params*/){
			var args = Array.array(arguments);
			if(args.length < 2){
				if(this.isNew()){
					args.push(Object.clone(this._data));
				}
				else{
					var i = this._dirty.length,
						params = {};
					params[this._static.PRIMARY_KEY] = this.primaryKey();
					for(; i--;){
						params[this._dirty[i]] = this._data[this._dirty[i]];
					}
					args.push(params);
				}
			}
			var ldr = this._getRequest(this._translateSaveParam, args);
			ldr.getRequest().setMethod(OjUrlRequest.POST);
			return ldr;
		},
		'_importValue' : function(prop, value, mode){
			if(this._static.hasProperty(prop)){
				var func = 'set' + prop.ucFirst();
				value = this._static.DEFINITION[prop].importValue(value, this.property(prop), mode);
				if(func != 'setnull' && this[func]){
					this[func](value);
				}
				else{
					this.property(prop, value);
				}
				// if we are not in api mode then remove from dirty
				if(mode == NwData.API){
					var index = this._dirty.indexOf(prop);
					if(index != -1){
						this._dirty.splice(index, 1);
					}
				}
				return;
			}
			// check to see if this prop is a flattened value
			var index = prop.indexOf('.');
			if(index > 0){
				var data = {};
				data[prop.substr(index + 1)] = value;
				this._importValue(prop.substr(0, index), data, mode);
			}
		},
		'_processDeleteData' : function(data){
		},
		'_processLoadData' : function(data){
			// todo: clean out stale data on load data import
			this.importData(data, NwData.API);
		},
		'_processSaveData' : function(data){
			this.importData(data, NwData.API);
		},
		'_resetLoader' : function(){
			if(this._loader){
				this._loader.cancel();
				this._loader = null;
			}
		},
		'_translateDeleteParam' : function(param){
			var map = this._static.EXPORT_MAP;
			return map[param] ? map[param] : param;
		},
		'_translateLoadParam' : function(param){
			var map = this._static.EXPORT_MAP;
			return map[param] ? map[param] : param;
		},
		'_translateSaveParam' : function(param){
			var map = this._static.EXPORT_MAP;
			return map[param] ? map[param] : param;
		},

		// Event Handler Functions
		'_onDelete' : function(evt){
			this._is_loaded = false;
			this.primaryKey(null);
			this._processDeleteData(this._loader.getData());
			this._unset('_loader');
			this.dispatchEvent(new NwDataEvent(NwDataEvent.DELETE));
			this._static.dispatchEvent(new NwDataEvent(NwDataEvent.DELETE, this));
		},
		'_onDeleteFail' : function(evt){
			this._unset('_loader');
			this.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.DELETE));
			this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.DELETE, this));
		},
		'_onLoad' : function(evt){
			this._is_loaded = true;
			this._processLoadData(this._loader.getData());
			this._unset('_loader');
			this.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD));
			this._static.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD, this));
		},
		'_onLoadFail' : function(evt){
			this._unset('_loader');
			this.dispatchEvent(new NwDataEvent(NwDataErrorEvent.LOAD));
			this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.LOAD, this));
		},
		'_onSave' : function(evt){
			if(evt){
				var ldr = evt.getTarget(),
					response = ldr.getData();
				// if this is an rpc call then we can automatically check if there was an error
				if(ldr.is('OjRpc')){
					if(!response || response.error){
						return this._onSaveFail(evt);
					}
					response = response.result;
				}
				this._processSaveData(response);
				// make sure we clear out all applicable dirty flags
				var index, key,
					data = ldr.getRequest().getData(),
					map = this._static.EXPORT_MAP;
				for(key in data){
					index = this._dirty.indexOf(map[key]);
					if(index != -1){
						this._dirty.splice(index, 1);
					}
				}
				// destroy the loader if we don't need it anymore
				if(this._loader == ldr){
					this._unset('_loader');
				}
			}
			this.dispatchEvent(new NwDataEvent(NwDataEvent.SAVE, this));
			this._static.dispatchEvent(new NwDataEvent(NwDataEvent.SAVE, this));
		},
		'_onSaveFail' : function(evt){
			var code, message;
			if(evt){
				var ldr = this._loader,
				response = ldr.getData();
				// if this is an rpc call then we can automatically check if there was an error
				if(ldr.is('OjRpc') && response){
					code = response.error.code;
					message = response.error.message
				}
				this._unset('_loader');
			}
			this.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.SAVE, this, message, code));
			this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.SAVE, this, message, code));
		},

		// Utility Functions
		'clone' : function(){
			var obj = this._super(OjActionable, 'clone', []);
			obj.importData(this._data, NwData.CLONE);
			return obj;
		},
		'delete' : function(){
			this._resetLoader();
			this._loader = this._getDeleteRequest();
			this._loader.addEventListener(OjEvent.COMPLETE, this, '_onDelete');
			this._loader.addEventListener(OjEvent.FAIL, this, '_onDeleteFail');
			this._loader.load();
		},
		'exportData' : function(/*mode*/){
			var key, mkey, obj, prop, val,
				mode = arguments.length ? arguments[0] : NwData.DEFAULT,
				is_default = mode == NwData.DEFAULT,
				map = this._static.EXPORT_MAP;
			if(is_default){
				obj = this._super(OjActionable, 'exportData', arguments);
			}
			else{
				obj = {};
				if(!this.isNew()){
					obj[this._static.PRIMARY_KEY] = this.primaryKey();
				}
			}
			for(key in this._data){
				if(is_default || this._dirty.indexOf(key) != -1){
					val = this._exportValue(key, mode);
					// if the value is an object then we need to check the flatten property flag
					if(isObject(val) && (prop = this._static.getProperty(key)).getFlatten()){
						for(key in val){
							if(key == '_class_name'){
								continue;
							}
							mkey = prop.getNamespace() + '.' + key;
							obj[map[mkey] ? map[mkey] : mkey] = val[key];
						}
					}
					else{
						obj[map[key] ? map[key] : key] = val;
					}
				}
			}
			return obj;
		},
		'importData' : function(data/*, mode*/){
			var key,
				mode = arguments.length > 1 ? arguments[1] : NwData.DEFAULT,
				map = this._static.IMPORT_MAP,
				primary = this._static.PRIMARY_KEY;
			for(key in data){
				if(mode == NwData.CLONE && key == primary){
					continue;
				}
				this._importValue(map[key] ? map[key] : key, data[key], mode);
			}
		},
		'isDirty' : function(){
			return this._dirty.length > 0;
		},
		'isLoaded' : function(){
			return this._is_loaded;
		},
		'isNew' : function(){
			return isEmpty(this.primaryKey());
		},
		'primaryKey' : function(/*key_value*/){
			if(arguments.length){
				this.property(this._static.PRIMARY_KEY, arguments[0]);
			}
			return this._data[this._static.PRIMARY_KEY];
		},
		'keywordScore' : function(keyword){
			var keywords = [], score = 0;
			if(isArray(keyword)){
				keywords = keyword;
			}
			else{
				keywords.push(keyword);
			}
			var key, ln = keywords.length;
			while(ln-- > 0){
				for(key in this._keyword_cache){
					if(this._keyword_cache[key]){
						score += this._keyword_cache[key].count(keywords[ln].toLowerCase()) / (ln + 1);
					}
				}
			}
			return score;
		},
		'load' : function(/*reload=false*/){
			var args = arguments,
				ln = args.length,
				reload = ln ? args[0] : false;
			if(this._is_loaded && !reload){
				return;
			}
			this._resetLoader();
			this._is_loaded = false;
			this._loader = this._getLoadRequest();
			this._loader.addEventListener(OjEvent.COMPLETE, this, '_onLoad');
			this._loader.addEventListener(OjEvent.FAIL, this, '_onLoadFail');
			this._loader.load();
		},
		'property' : function(prop/*, val*/){
      var args = arguments,
				prev = this._data[prop];
			if(args.length > 1){
				var val = args[1];
				if(prev != val){
					// update the dirty flag
					this._addToDirty(prop);
					var evt = new NwDataEvent(NwDataEvent.CHANGE, val, prev);
					this._data[prop] = val;
					var def = this._static.DEFINITION;
					if(def && def[prop] && def[prop].is('OjTextProperty')){
						this._keyword_cache[prop] = value ? value.toLowerCase() : null;
					}
					this.dispatchEvent(evt);
				}
			}
			return prev;
		},
		'save' : function(){
			// check to see if we even need to make a save
			if(!this.isNew() && isEmpty(this._dirty)){
				this._onSave(null);
				return;
			}
			this._resetLoader();
			this._loader = this._getSaveRequest();
			this._loader.addEventListener(OjEvent.COMPLETE, this, '_onSave');
			this._loader.addEventListener(OjEvent.FAIL, this, '_onSaveFail');
			this._loader.load();
		},
		'title' : function(){
			return null;
		},

		// Getter & Setter functions
		'getId' : function(){
			return this._data['id'];
		},
		'setId' : function(val){
			var id = this.getId();
			if(id){
				delete this._static.CACHE[id];
			}
			this.property('id', val);
			if(val){
				this._static.CACHE[val] = this;
			}
		}
	},
	{
		'API'     : 'api',
		'CLONE'   : 'clone',
		'DEFAULT' : 'default',

		'CACHE' : {},
		'DEFINITION' : {
			'id' : new NwUuidProperty()
		},
		'EXPORT_MAP' : {},
		'IMPORT_MAP' : {},
		'PRIMARY_KEY' : 'id',
		'TYPE' : 'Data',
		'TYPES' : {},

		// Static Protected Functions
		'_BACKLOG' : [],
		'_onAppManagerInit' : function(evt){
			AppManager.removeEventListener(OjEvent.INIT, this, '_onAppManagerInit');
			var i = 0,
				ln = this._BACKLOG.length,
				record;
			for(i; i < ln; i++){
				record = this._BACKLOG[i];
				this[record[0]].apply(this, record[1]);
			}
			delete this._BACKLOG;
		},
		'_backlogCall' : function(method, args){
			if(AppManager.isReady()){
				return false;
			}
			AppManager.addEventListener(OjEvent.INIT, this, '_onAppManagerInit');
			this._BACKLOG.push([method, args]);
			return true;
		},
		'_callApi' : function(url, data, method, onComplete, onFail){
			if(this._backlogCall('_callApi', arguments)){
				return;
			}
			return this._callApiWithRequest(AppManager.apiRequest(url, data, method), onComplete, onFail);
		},
		'_callApiWithRequest' : function(req, onComplete, onFail){
			req.addEventListener(OjEvent.COMPLETE, this, onComplete);
			req.addEventListener(OjEvent.FAIL, this, onFail);
			req.load();
			return req;
		},
		'_onApiFail' : function(evt, type, data/*, message, code*/){
			var args = arguments,
				ln = args.length;
			if(evt){
				evt = OJ.destroy(evt);
			}
			this.dispatchEvent(
				new NwDataErrorEvent(
					type, data,
					ln > 3 ? args[3] : null,
					ln > 4 ? args[4] : null
				)
			);
		},
		'_onApiLoad' : function(evt, type, data/*, key, old_data*/){
			var args = arguments,
				ln = args.length,
				key = ln > 3 ? args[3] : null;
			if(evt){
				var d = this.importData(evt.getTarget().getData(), NwData.API);
				if(key){
					this[data][key] = d;
				}
				else{
					this[data] = d;
				}
				evt = OJ.destroy(evt);
			}
			this.dispatchEvent(
				new NwDataEvent(
					type,
					key ? this[data][key] : this[data],
					ln > 4 ? args[4] : null
				)
			);
		},

		// Static Public Functions
		'addEventListener' : function(type, context, callback){
			EventManager.addEventListener(this, type, context, callback);
		},
		'dispatchEvent' : function(evt){
			if(this._prevent_dispatch){
				return;
			}
			EventManager.dispatchEvent(this, evt);
		},
		'get' : function(id){
			if(!this.CACHE[id]){
				var c = this;
				var data = new c();
				data.setId(id);
			}
			return this.CACHE[id];
		},
		'getProperty' : function(prop){
			return this.DEFINITION[prop];
		},
		'hasEventListener' : function(type){
			return EventManager.hasEventListener(this, type);
		},
		'hasProperty' : function(key){
			return !isUndefined(this.DEFINITION[key]);
		},
		'id' : function(){
			if(!this.CLASS_NAME){
				this.CLASS_NAME = OJ.classToString(this);
			}
			return this.CLASS_NAME;
		},
		'importData' : function(data/*, mode*/){
			var args = arguments,
				mode = args.length > 1 ? args[1] : NwData.DEFAULT;
			if(isArray(data)){
				var ln = data.length;
				while(ln-- > 0){
					data[ln] = this.importData(data[ln], mode);
				}
				return data;
			}
			if(isObject(data)){
				var c = data['_class_name'] ? OJ.stringToClass(data['_class_name']) : this;
				if(c){
					var obj, id = data[this.PRIMARY_KEY];
					if(id && c.CACHE[id]){
						obj = c.CACHE[id];
					}
					else{
						obj = new c();
					}
					obj.importData(data, mode);
					return obj;
				}
			}
			return null;
		},
		'load' : function(id /*, refresh*/){
			if(!id){
				return null;
			}
			var data = this.get(id);
			if(data.isLoaded() && (arguments.length == 1 || !arguments[1])){
				this.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD, data));
			}
			else{
				data.load();
			}
			return data;
		},
		'registerDataType' : function(type, class_name){
			if(!NwData.TYPES[type]){
				NwData.TYPES[type] = class_name;
			}
		},
		'removeAllListeners' : function(){
			return EventManager.removeAllListeners(this);
		},
		'removeEventListener' : function(type, context, callback){
			EventManager.removeEventListener(this, type, context, callback);
		},
		'typeToClass' : function(type){
			if(NwData.TYPES[type]){
				return OJ.stringToClass(NwData.TYPES[type]);
			}
			return null;
		}
	}
);


OJ.extendClass(
	'NwDataForm', [OjForm],
	{}
);


OJ.extendClass(
	'NwDataItemRenderer', [OjItemRenderer],
	{
		'_onDataChange' : function(evt){
			this._redrawData();
		},

		'setData' : function(data){
			if(this._data){
				this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}
			this._super(OjItemRenderer, 'setData', arguments);
			if(this._data){
				this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}
		}
	}
);


OJ.extendClass(
	'NwDataListItem', [OjListItem],
	{
		'_redrawData' : function(){
			this.content.setText(this._data.title());
		}
	}
);


OJ.extendClass(
	'NwDataView', [OjView],
	{}
);

OJ.extendClass(
	'NwLinkData', [OjActionable],
	{
		'_active' : false, '_url' : null,  '_title' : null,  '_icon' : null,

		'_constructor' : function(/*title, url, icon*/){
			this._super(OjActionable, '_constructor', []);
			var ln = arguments.length;
			if(ln){
				this.setTitle(arguments[0]);
				if(ln > 1){
					this.setUrl(arguments[1]);
					if(ln > 2){
						this.setIcon(arguments[2]);
					}
				}
			}
		},

//	    'isActive' : function(/*active*/){
//			if(arguments.length && this._active != arguments[0]){
//				this._active = arguments[0];
//
//				this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
//			}
//
//			return this._active;
//		},
		'getIcon' : function(){
			return this._icon;
		},
		'setIcon' : function(icon){
			if(this._icon != icon){
				this._icon = icon;
				this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
			}
		},
		'getUrl' : function(){
			return this._calculated_url;
		},
		'setUrl' : function(path){
			if(this._url != path){
				this._url = path;
				this._recalculatePath();
			}
		},
		'getTitle' : function(){
			return this._title;
		},
		'setTitle' : function(title){
			if(this._title != title){
				this._title = title;
				this.dispatchEvent(new OjEvent(OjEvent.CHANGE));
			}
		}
	}
);


OJ.extendClass(
	'NwDateProperty', [NwProperty],
	{
		'_max_date' : null,  '_min_date' : null,
		'_processValue' : function(value){
			if(!isDate(value)){
				value = new Date(value);
			}
			if(this._max_date && value > this._max_date){
				value = new Date(this._max_date.getTime());
			}
			if(this._min_date && value < this._min_date){
				value = new Date(this._min_date.getTime());
			}
			return value;
		},
		'_valueIsValid' : function(value){
			return isDate(value) &&
				(!this._min_date || value >= this._min_date) &&
				(!this._max_date || value >= this._max_date);
		},
		'getMaxLength' : function(){
			return this._max_date;
		},
		'setMaxLength' : function(val){
			this._max_date = !this._min_date || val > this._min_date ? val : this._min_date;
		},
		'getMinDate' : function(){
			return this._min_date;
		},
		'setMinDate' : function(val){
			this._min_date = !this._max_date || val < this._max_date ? val : this._max_date;
		}
	}
);


OJ.extendClass(
	'NwNumberProperty', [NwProperty],
	{
		'_max_value' : null,  '_min_value' : null,
		'_rounding' : 'round', // NwNumberProperty.ROUND,
		'_step' : 0,
		'_type' : 'float', // NwNumberProperty.FLOAT,

		'_processValue' : function(value){
			if(!isNumber(value)){
				value = parseFloat(value);
			}
			if(isSet(this._min_value)){
				value = Math.max(this._min_value, value);
			}
			if(isSet(this._max_value)){
				value = Math.min(this._max_value, value);
			}
			if(this._step){
				// todo: add logic for making sure the value is in step ;-)
			}
			if(this._type == NwNumberProperty.INT){
				value = this._round(value);
			}
			return value;
		},
		'_round' : function(value){
			if(this._rounding == NwNumberProperty.CEIL){
				return Math.ceil(value);
			}
			if(this._rounding == NwNumberProperty.FLOOR){
				return Math.floor(value);
			}
			return Math.round(value);
		},
		'_valueIsValid' : function(value){
			if(
				!isNumber(value) ||
					(this._type == NwNumberProperty.INT && !isInt(value)) ||
					(isSet(this._min_value) && value < this._min_value) ||
					(isSet(this._max_value) && value > this._max_value)
				){
				return false;
			}
			// todo: add step validation
			return true;
		},

		'getType' : function(){
			return this._type;
		},
		'setType' : function(val){
			this._type = val;
		},
		'getMaxValue' : function(){
			return this._max_value;
		},
		'setMaxValue' : function(val){
			this._max_value = val;
		},
		'getMinValue' : function(){
			return this._min_value;
		},
		'setMinValue' : function(val){
			this._min_value = val;
		}
	},
	{
		'FLOAT' : 'float',
		'INT'   : 'int',
		'CEIL'  : 'ceil',
		'FLOOR' : 'floor',
		'ROUND' : 'round'
	}
);


OJ.extendClass(
	'NwRailsData', [NwData],
	{
		'_getDeleteRequest' : function(method/*, params*/){
			var ldr = this._super(NwData, '_getDeleteRequest', [method, arguments.length > 1 ? arguments[1] : null]);
			ldr.getRequest().setContentType(OjUrlRequest.QUERY_STRING);
			return ldr;
		},
		'_getLoadRequest' : function(method/*, params*/){
			var ldr = this._super(NwData, '_getLoadRequest', [method, arguments.length > 1 ? arguments[1] : null]);
			ldr.getRequest().setContentType(OjUrlRequest.QUERY_STRING);
			return ldr;
		},
		'_getSaveRequest' : function(method/*, params*/){
			var ldr = this._super(NwData, '_getSaveRequest', arguments);
			ldr.getRequest().setContentType(OjUrlRequest.QUERY_STRING);
			return ldr;
		},
		'_translateSaveParam' : function(param){
			if(
				param == 'id' || param == 'created' || param == 'modified' ||
				param == '_class_name' || param == '_class_path'
			){
				return null;
			}
			return this._super(NwData, '_translateSaveParam', arguments);
		}
	},
	{
		'DEFINITION' : {
			'id'         : new NwNumberProperty(),
			'created'    : new NwDateProperty(),
			'modified'   : new NwDateProperty()
		},
		'EXPORT_MAP' : {
			'created'  : 'created_at',
			'modified' : 'updated_at'
		},
		'TYPE' : 'RailsData',

		'import' : function(data){
			if(isArray(data)){
				var ln = data.length;
				while(ln-- > 0){
					data[ln] = this.importData(data[ln]);
				}
				return data;
			}
			if(isObject(data)){
				var keys = Object.keys(data);
				var ln = keys.length;
				var c = this;
				if(ln == 1){
					c = NwData.typeToClass(keys[0]);
					data = data[keys[0]];
				}
				if(c){
					var obj, id = data[c.PRIMARY_KEY];
					if(id && c.CACHE[id]){
						obj = c.CACHE[id];
					}
					else{
						obj = new c();
					}
					obj.importData(data);
					return obj;
				}
			}
			return null;
		}
	}
);


OJ.extendClass(
	'NwTextProperty', [NwProperty],
	{
		'_props_' : {
			'minLength' : 0,
			'maxLength' : 255
		},

		'_processValue' : function(value){
			if(!isString(value)){
				value = String(value);
			}
			if(this._maxLength && value.length > this._maxLength){
				value = value.substr(0, this._maxLength);
			}
			if(this._minLength && value.length < this._minLength){
				value = null;
			}
			return value;
		},
		'_valueIsValid' : function(value){
			if(!this._minLength && isNull(value)){
				return true;
			}
			value = String(value);
			return (!this._minLength || value.length >= this._minLength) &&
				(!this._maxLength || value.length <= this._maxLength);
		},
		'makeInput' : function(/*dom_elm|input*/){
			var input = this._super(NwProperty, 'makeInput', arguments);
			input.setMinLength(this._minLength);
			input.setMaxLength(this._maxLength);
			return input;
		},

		'setMaxLength' : function(val){
			this._maxLength = Math.max(val, 0);
		},
		'setMinLength' : function(val){
			this._minLength = Math.max(val, 0);
		}
	}
);


window.NwIUser = {
	'hasPermission' : function(perm){
		if(perm == '*' || this.isAdmin()){
			return true;
		}
		var roles = this.getRoles();
		if(roles){
			for(var i = roles.length; i; i--){
				if(AppManager.roleHasPermission(roles[i], perm)){
					return true;
				}
			}
		}
		return false;
	},
	'isAdmin' : function(){
		return AppManager.userIsAdmin(this);
	}
};
OJ.extendClass(
	'NwUser', [NwData],
	NwIUser,
	{
		'DEFINITION' : {
			'id'            : new NwNumberProperty(),
			'name'          : new NwTextProperty(),
			'roles'         : new NwTextProperty()
		},
		'TYPE' : 'User'
	}
);


OJ.extendClass(
	'NwRailsUser', [NwRailsData],
	OJ.implementInterface(
		NwIUser,
		{}
	),
	{
		'DEFINITION' : OJ.merge(
			{},
			NwUser.DEFINITION,
			NwRailsData.DEFINITION
		),
		'TYPE' : 'User'
	}
);


OJ.extendClass(
	'NwBooleanProperty', [NwProperty],
	{
		'_exportValue' : function(value, old_value, mode){
			return value ? 1 : 0;
		},
		'_processValue' : function(value, old_value, mode){
			return isTrue(value);
		}
	}
);


OJ.extendClass(
	'NwEmailProperty', [NwTextProperty],
	{
		'_props_' :{
			'maxLength' : 254,
			'minLength' : 3
		},

		'makeInput' : function(dom){
			
			var input = new OjEmailInput(this._name, this._label, this._defaultValue);
			input.setDefault(this._default);
			input.setRequired(this._required);
			return input;
		},

		'setMaxLength' : function(val){
			throw new Error('Cannot set the max length of an email. This is a fixed value.');
		},
		'setMinLength' : function(val){
			throw new Error('Cannot set the min length of an email. This is a fixed value.');
		}
	}
);


OJ.extendClass(
	'NwFileProperty', [NwProperty],
	{}
);


OJ.extendClass(
	'NwMediaProperty', [NwFileProperty],
	{
		'_props_' : {
			'formats' : null,
			'missing' : null
		},

		'_constructor' : function(/*settings*/){
			this._formats = [];
			this._super(NwFileProperty, '_constructor', arguments);
		},
		'_setupFormatFunc' : function(obj, key, u_key, format){
			var u_format = format.ucFirst(),
				getter = 'get' + u_key + u_format,
				setter = 'set' + u_key + u_format;
			if(!obj[getter]){
				obj[getter] = function(){
					return this._static.getProperty(key).formatValue(this, key, format);
				};
			}
			if(!obj[setter]){
				obj[setter] = function(val){
					this._static.getProperty(key).formatValue(this, key, format, val);
				};
			}
		},

		'formatValue' : function(obj, key, format){
			var args = arguments,
				is_setter = args.length > 3,
				media = obj.property(key);
			if(is_setter){
				if(!media){
					obj['set' + key.ucFirst()](media = {});
				}
				return media[format] = args[3];
			}
			if(!media){
				return null;
			}
			media = media[format];
			if(!media && this._missing){
				if(isString(this._missing)){
					return this._missing;
				}
				media = this._missing[format];
			}
			return media;
		},
		'setup' : function(obj, key, u_key){
			this._super(NwFileProperty, 'setup', arguments);
			var ln = this._formats.length;
			for(; ln--;){
				this._setupFormatFunc(obj, key, u_key, this._formats[ln]);
			}
		}
	}
);


OJ.extendClass(
	'NwObjectProperty', [NwProperty],
	{
		'_props_' : {
			'flatten'   : false,
			'namespace' : null
		}
	}
);


OJ.extendClass(
	'NwReferenceProperty', [NwObjectProperty],
	{
		'_props_' : {
			'class'        : NwData,
			'allowNesting' : false
		},

		'_constructor' : function(cls /*, properties*/){
			this._super(NwObjectProperty, '_constructor', arguments.length > 1 ? [arguments[1]] : []);
			this.setClass(cls);
		},

		'_exportSubValue' : function(value, old_value, mode){
			if(value && isObjective(value)){
				return (this._allowNesting || this._flatten) ? value.exportData(mode) : value.primaryKey();
			}
			return value;
		},
		'_exportValue' : function(value, old_value, mode){
			if(this._max == 1){
				return this._exportSubValue(value, old_value, mode);
			}
			var ary = [], ln = value ? value.numItems() : 0;
			for(; ln--;){
				ary.unshift(
					this._exportSubValue(
						value.getItemAt(ln),
						old_value,
						mode
					)
				);
			}
			return ary;
		},
		'_formatter' : function(func, value/*, old_value, mode*/){
			var ln = arguments.length;
			return func.call(
				this,
				value,
				ln > 2 ? arguments[2] : null,
				ln > 3 ? arguments[3] : NwData.DEFAULT
			);
		},
		'_importSubValue' : function(value, old_value, mode){
			// if the value is null then just return that
			if(!value){
				return null;
			}
			// if value is of the proper oj class type then return it
			if(isObjective(value) && value.is(this._class)){
				return value;
			}
			// if we allow nesting and have an old value then we need to handle this special
			if((this._allowNesting || this._flatten) && old_value){
				if(isObject(value)){
					old_value.importData(value, mode);
				}
				else{
					old_value.primaryKey(value);
				}
				return old_value;
			}
			var cls = this.getClass();
			return isObject(value) ? cls.importData(value, mode) : cls.get(value);
		},
		'_importValue' : function(value, old_value, mode){
			if(this._max == 1){
				return this._importSubValue(value, old_value, mode);
			}
			var old_ln = old_value ? old_value.numItems() : 0,
				items = old_ln ? old_value : new OjCollection();
			if(isArray(value)){
				var ln = isArray(value) ? value.length : 0;
				ln = this._max == 0 ? ln : Math.min(ln, this._max);
				for(; ln--;){
					if(ln < old_ln){
						items.setItemAt(
							this._importSubValue(
								value[ln],
								items.getItemAt(ln),
								mode
							),
							ln
						);
					}
					else{
						items.addItemAt(
							this._importSubValue(value[ln], null, mode),
							old_ln
						);
					}
				}
				return items;
			}
			if(isObject(value)){
				var key, i;
				for(key in value){
					i = parseInt(key);
					if(!this._max || ary.length < this._max){
						if(i < old_ln){
							items.setItemAt(
								this._importSubValue(
									value[key],
									items.getItemAt(i),
									mode
								),
								i
							);
						}
						else{
							items.addItem(this._importSubValue(value[key], null, mode));
						}
					}
				}
				return items;
			}
			return (this._allowNesting || this._flatten) ? old_value : null;
		},

		'setup' : function(obj, key, u_key){
			// setup the name and namespace
			this._name = key;
			if(!this._namespace){
				this._namespace = key;
			}
			// setup the getter and setter funcs
			var getter = 'get' + u_key,
				setter = 'set' + u_key,
				ns = this._namespace.ucFirst(),
				on_change,
				is_sub = (this._allowNesting || this._flatten);

			// setup change listener function if one doesn't already exist
			on_change = 'on' + ns + 'Change';
			if(!obj[on_change]){
				obj[on_change] = function(evt){
					if(is_sub){
						this._addToDirty(key);
					}
				};
			}
			// setup the getter function if one doesn't already exist
			if(!obj[getter]){
				obj[getter] = function(){
					return this.property(key);
				};
			}
			// setup the setter function if one doesn't already exist
			if(!obj[setter]){
				obj[setter] = function(val){
					var prev = this.property(key);
					if(prev){
						if(prev.is('NwData')){
							prev.removeEventListener(NwDataEvent.CHANGE, this, on_change);
						}
						else if(prev.is('OjCollection')){
							prev.removeEventListener(OjCollectionEvent.ITEM_ADD, this, on_change);
							prev.removeEventListener(OjCollectionEvent.ITEM_MOVE, this, on_change);
							prev.removeEventListener(OjCollectionEvent.ITEM_REMOVE, this, on_change);
							prev.removeEventListener(OjCollectionEvent.ITEM_REPLACE, this, on_change);
						}
					}
					this.property(key, val);
					if(val){
						if(val.is('NwData')){
							val.addEventListener(NwDataEvent.CHANGE, this, on_change);
						}
						else if(val.is('OjCollection')){
							val.addEventListener(OjCollectionEvent.ITEM_ADD, this, on_change);
							val.addEventListener(OjCollectionEvent.ITEM_MOVE, this, on_change);
							val.addEventListener(OjCollectionEvent.ITEM_REMOVE, this, on_change);
							val.addEventListener(OjCollectionEvent.ITEM_REPLACE, this, on_change);
						}
					}
				};
			}
			// if we only allow one or don't have a namespace
			// don't add the extra reference management functions
			if(this._max == 1 || !this._namespace){
				return;
			}
			// setup the add function if one doesn't already exist
			var func;
			func = 'add' + ns;
			if(!obj[func]){
				obj[func] = function(item){
					var items = this.property(key);
					if(!items){
						this.property(key, items = new OjCollection());
					}
					if(is_sub){
						item.addEventListener(NwDataEvent.CHANGE, this, on_change);
					}
					this._addToDirty(key);
					return items.addItem(item);
				};
			}
			// setup the addAt function if one doesn't already exist
			func += 'At';
			if(!obj[func]){
				obj[func] = function(item, index){
					var items = this.property(key);
					if(!items){
						this.property(key, items = new OjCollection());
					}
					if(is_sub){
						item.addEventListener(NwDataEvent.CHANGE, this, on_change);
					}
					this._addToDirty(key);
					return items.addItemAt(item, index);
				};
			}
			// setup the getAt function if one doesn't already exist
			func = 'get' + ns + 'At';
			if(!obj[func]){
				obj[func] = function(index){
					var items = this.property(key);
					if(!items){
						return null;
					}
					return items.getItemAt(index);
				};
			}
			// setup the has function if one doesn't already exist
			func = 'has' + ns;
			if(!obj[func]){
				obj[func] = function(item){
					var items = this.property(key);
					return items ? items.hasItem(item) : false;
				};
			}
			// setup the indexOf function if one doesn't already exist
			func = 'indexOf' + ns;
			if(!obj[func]){
				obj[func] = function(item){
					var items = this.property(key);
					return items ? items.indexOfItem(item) : -1;
				};
			}
			// setup the num function if one doesn't already exist
			func = 'num' + OJ.pluralize(ns);
			if(!obj[func]){
				obj[func] = function(){
					var items = this.property(key);
					return items ? items.numItems() : 0;
				};
			}
			// setup the remove function if one doesn't already exist
			func = 'remove' + ns;
			if(!obj[func]){
				obj[func] = function(item){
					var items = this.property(key);
					if(!items){
						return item;
					}
					if(is_sub){
						item.removeEventListener(NwDataEvent.CHANGE, this, on_change);
					}
					this._addToDirty(key);
					return items.removeItem(item);
				};
			}
			// setup the removeAt function if one doesn't already exist
			func += 'At';
			if(!obj[func]){
				obj[func] = function(index){
					var items = this.property(key);
					if(!items){
						return null;
					}
					if(is_sub){
						item.removeEventListener(NwDataEvent.CHANGE, this, on_change);
					}
					this._addToDirty(key);
					return items.removeItemAt(index);
				};
			}
		},
		'getClass' : function(){
			return OJ.toClass(this._class);
		}
	}
);


OJ.extendClass(
	'NwUrlProperty', [NwTextProperty],
	{}
);

OJ.extendComponent(
	'NwSelector', [OjSelector],
	{
		'_props_' : {
			'summaryRenderer' : null
		},
		'_selectOption' : function(option, data){
			this._super(OjSelector, '_selectOption', arguments);
			if(this.summary){
				this.summary.setData(this._value.clone());
			}
		},
		'_unselectOption' : function(option, data){
			this._super(OjSelector, '_unselectOption', arguments);
			if(this.summary){
				this.summary.setData(this._value.clone());
			}
		},

		'_onSummaryClick' : function(evt){
			if(isEmpty(this.getOptions())){
				return;
			}
			WindowManager.show(
				WindowManager.makeActionCard(this.input, this._label)
			);
		},

		'setSummaryRenderer' : function(val){
			if(this._summaryRenderer == val){
				return;
			}
			if(this.summary){
				this.stem.replaceChild(this.summary, this.input);
				this._unset('summary');
			}
			if(this._summaryRenderer = val){
				this.stem.replaceChild(this.input, this.summary = new val(this, this._value));
				this.summary.addEventListener(OjMouseEvent.CLICK, this, '_onSummaryClick');
			}
		}
	}
)





OJ.extendManager(
	'Facebook', 'NwFacebook', [OjActionable],
	{
		'LOGIN'      : 'onFbLogin',
		'LOGIN_FAIL' : 'onFbLoginFail',
		'LOGOUT'     : 'onFbLogout',
		'UPDATE'     : 'onFbUpdate',
		'ABOUT'                 : 'user_about_me',
		'ACTIVITIES'            : 'user_activities',
		'ADS'                   : 'ads_management',
		'APP_ACTIONS'           : function(app_namespace){
			return 'user_actions:' + app_namespace;
		},
		'BIRTHDAY'              : 'user_birthday',
		'CHAT'                  : 'xmpp_login',
		'CHECK_INS'             : 'user_checkins',
		'CHECK_INS_PUBLISH'     : 'publish_checkins',
		'EDUCATION'             : 'user_education_history',
		'EMAIL'                 : 'email',
		'EVENT_CREATE'          : 'create_event',
		'EVENT_RSVP'            : 'rsvp_event',
		'EVENTS'                : 'user_events',
		'FRIEND_LISTS'          : 'read_friendlists',
		'FRIEND_LISTS_MANAGE'   : 'manage_friendlists',
		'FRIEND_REQUESTS'       : 'read_requests',
		'GAMES_ACTIVITY'        : 'user_games_activity',
		'GROUPS'                : 'user_groups',
		'HOMETOWN'              : 'user_hometown',
		'INSIGHTS'              : 'read_insights',
		'INTERESTS'             : 'user_interests',
		'LIKES'                 : 'user_likes',
		'LOCATION'              : 'user_location',
		'MAILBOX'               : 'read_mailbox',
		'MANAGE_PAGES'          : 'manage_pages',
		'MUSIC_ACTIONS'         : 'user_actions.music',
		'NEWS_ACTIONS'          : 'user_actions.news',
		'NOTES'                 : 'user_notes',
		'NOTIFICATIONS'         : 'manage_notifications',
		'PHOTOS'                : 'user_photos',
		'PRESENCE'              : 'user_online_presence',
		'PUBLISH_ACTIONS'       : 'publish_actions',
		'QUESTIONS'             : 'user_questions',
		'RELATIONSHIPS'         : 'user_relationships',
		'RELATIONSHIP_DETAILS'  : 'user_relationship_details',
		'RELIGION_POLITICS'     : 'user_religion_politics',
		'STATUS'                : 'user_status',
		'STREAM'                : 'read_stream',
		'STREAM_PUBLISH'        : 'publish_stream',
		'SUBSCRIPTIONS'         : 'user_subscriptions',
		'VIDEO_ACTIONS'         : 'user_actions.video',
		'VIDEOS'                : 'user_videos',
		'WEBSITE'               : 'user_website',
		'WORK_HISTORY'          : 'user_work_history',
		'FRIENDS_ABOUT'                 : 'friends_about_me',
		'FRIENDS_ACTIVITIES'            : 'friends_activities',
		'FRIENDS_APP_ACTIONS'           : function(app_namespace){
			return 'friends_actions:' + app_namespace;
		},
		'FRIENDS_BIRTHDAY'              : 'friends_birthday',
		'FRIENDS_CHECK_IN'              : 'friends_checkins',
		'FRIENDS_EDUCATION'             : 'friends_education_history',
		'FRIENDS_EVENTS'                : 'friends_events',
		'FRIENDS_GAMES_ACTIVITY'        : 'friends_games_activity',
		'FRIENDS_GROUP'                 : 'friends_groups',
		'FRIENDS_HOMETOWN'              : 'friends_hometown',
		'FRIENDS_INTERESTS'             : 'friends_interests',
		'FRIENDS_LIKES'                 : 'friends_likes',
		'FRIENDS_LOCATION'              : 'friends_location',
		'FRIENDS_MUSIC_ACTIONS'         : 'friends_actions.music',
		'FRIENDS_NEWS_ACTIONS'          : 'friends_actions.news',
		'FRIENDS_NOTES'                 : 'friends_notes',
		'FRIENDS_PHOTOS'                : 'friends_photos',
		'FRIENDS_PRESENCE'              : 'friends_online_presence',
		'FRIENDS_QUESTIONS'             : 'friends_questions',
		'FRIENDS_RELATIONSHIPS'         : 'friends_relationships',
		'FRIENDS_RELATIONSHIP_DETAILS'  : 'friends_relationship_details',
		'FRIENDS_RELIGION_POLITICS'     : 'friends_religion_politics',
		'FRIENDS_STATUS'                : 'friends_status',
		'FRIENDS_SUBSCRIPTIONS'         : 'friends_subscriptions',
		'FRIENDS_VIDEO_ACTIONS'         : 'friends_actions.video',
		'FRIENDS_VIDEOS'                : 'friends_videos',
		'FRIENDS_WEBSITE'               : 'friends_website',
		'FRIENDS_WORK_HISTORY'          : 'friends_work_history',

		'_get_props_' : {
			'session' : null
		},
		'_publish_permissions' : [
			'ads_management', 'publish_checkins', 'create_event',  'rsvp_event', 'manage_friendlists',
			'manage_pages', 'manage_notifications', 'publish_actions', 'publish_stream'
		],
		'_app_id' : null,  '_default_audience' : null,  '_ready' : false,

		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);
			// get the session data
			this._session = CacheManager.getData('fbSession');
			if(!this._session){
				this._session = {};
			}
			// add listener for when oj is ready
			if(OJ.isReady()){
				this._onOjReady(null);
			}
			else{
				OJ.addEventListener(OjEvent.READY, this, '_onOjReady');
			}
			// setup the facebook sdk includes
			if(NW.isNative()){
				NW.addEventListener(this.LOGIN, this, '_onLogin');
				NW.addEventListener(this.LOGIN_FAIL, this, '_onLoginFail');
				NW.addEventListener(this.LOGOUT, this, '_onLogout');
				NW.addEventListener(this.UPDATE, this, '_onUpdate');
			}
			else{
				// setup the init function
				window.fbAsyncInit = function() {
					Facebook.init();
				};
			}
		},
		'_destructor' : function(){
			NW.removeEventListener(this.LOGIN, this, '_onLogin');
			NW.removeEventListener(this.LOGOUT, this, '_onLogout');
			NW.removeEventListener(this.UPDATE, this, '_onUpdate');
			return this._super(OjActionable, '_destructor', arguments);
		},

		'_init' : function(){
			var url = HistoryManager.get();
			FB.Event.subscribe(
				'auth.statusChange',
				function(response) {
					Facebook._onStatusChange(response);
				}
			);
			FB.init({
				appId      : this._app_id,                  // App ID from the app dashboard
				channelUrl : '//' + url.getHost() +
					OJ.getRoot() + OJ.setting('assetsPath') +
					'/nw/social/fb_channel.php',            // Channel file for x-domain comms
				status     : true,                          // Check Facebook Login status
				xfbml      : true                           // Look for social plugins on the page
			});
			if(this._scope){
				this.login(this._scope);
				this._scope = null;
			}
		},
		'_login' : function(session){
			this._session = session;
			if(!NW.isNative()){
				CacheManager.setData('fbSession', this._session);
			}
			this.dispatchEvent(new OjEvent(this.LOGIN));
		},
		'_loginFail' : function(){
			this._session = null;
			if(!NW.isNative()){
				CacheManager.setData('fbSession', this._session);
			}
			this.dispatchEvent(new OjEvent(this.LOGIN_FAIL));
		},
		'_logout' : function(session){
			this._session = session;
			if(!NW.isNative()){
				CacheManager.setData('fbSession', this._session);
			}
			this.dispatchEvent(new OjEvent(this.LOGOUT));
		},

		'_onLogin' : function(evt){
			this._login(evt.getData());
		},
		'_onLoginFail' : function(evt){
			this._loginFail();
		},
		'_onLogout' : function(evt){
			this._logout(evt.getData());
		},
		'_onOjReady' : function(evt){
			this.removeEventListener(OjEvent.READY, this, '_onOjReady');
			// add the required root div
			OJ.addChildAt(new OjStyleElement('<div id="fb-root"></div>'), 0);
			// load the sdk
			OJ.loadJs('//connect.facebook.net/en_US/all.js', true, false);
		},
		'_onStatusChange' : function(response){
			if(response.authResponse){
				Facebook._login(response.authResponse);
			}
			else{
				Facebook._loginFail();
			}
		},
		'_onUpdate' : function(evt){
			// figure out how we want to handle updates
		},

		'init' : function(){
			this._ready = true;
			if(this._app_id){
				this._init();
			}
		},
		'login' : function(/*permissions, audience*/){
			var args = arguments,
				ln = args.length;
			if(NW.isNative()){
				NW.comm('fbLogin', Array.array(args)).load();
			}
			else{
				var scope = ln ? args[0].join(',') : null;
				if(FB){
					FB.login(Facebook._onStatusChange, {'scope' : scope});
				}
				else{
					this._scope = scope;
				}
			}
		},
		'logout' : function(){
			if(NW.isNative()){
				NW.comm('fbLogout', []).load();
			}
			else{
				// add js sdk implementation for non-native app instances
			}
		},
		// todo: NwFacebook - expand like button functionality
		'makeLikeButton' : function(/*url*/){
			var args = arguments,
				ln = args.length;
			var btn = new OjStyleElement('<span class="fb-like-btn"></span>');
			btn.dom().innerHTML =
				'<fb:like ' +
				'href="' + (ln ? args[0] : HistoryManager.get().toString()) + '"' +
				' send="false" show_faces="false" data-layout="button_count"' +
				'></fb:like>';
			if(window.FB){
				window.FB.XFBML.parse(btn.dom());
			}
			return btn;
		},
		'makeShareButton' : function(/*url*/){
			var args = arguments,
				ln = args.length;
			var btn = new OjLink(
				null,
				'https://www.facebook.com/sharer/sharer.php?u=' + (ln ? args[0] : HistoryManager.get().toString()).encodeUri(),
				WindowManager.WINDOW
			);
			btn.addCss(['fb-share-btn']);
			btn.setTargetWidth(626);
			btn.setTargetHeight(436);
			return btn;
		},

		'getAccessToken' : function(/*reload = false*/){
			var args = arguments,
				reload = args.length ? args[0] : false;
			if(this._session && this._session.accessToken && !reload){
				return this._session.accessToken;
			}
			var response;
			if(NW.isNative()){
				return (response = NW.comm('fbAccessToken', [], false).load()) && response.result ? this._session.accessToken = response.result : null;
			}
			else if(window.FB && (response = window.FB.getAuthResponse())){
				return response ? this._session.accessToken = response.accessToken : null;
			}
			return null;
		},
		'getAppId' : function(){
			if(this._app_id){
				return this._app_id;
			}
			else if(NW.isNative()){
				var response = NW.comm('fbAppId', [], false).load();
				return response && response.result ? this._app_id = response.result : null;
			}
			return null;
		},
		'setAppId' : function(app_id){
			if(app_id == this._app_id){
				return;
			}
			this._app_id = app_id;
			if(NW.isNative()){
				NW.comm('fbAppId', [this._app_id], true).load();
			}
			else if(this._ready){
				this._init();
			}
		},
		'getDefaultAudience' : function(){
			if(this._default_audience){
				return this._default_audience;
			}
			else if(NW.isNative()){
				var response = NW.comm('fbDefaultAudience', [], false).load();
				return response && response.result ? this._default_audience = response.result : null;
			}
			return null;
		},
		'setDefaultAudience' : function(default_audience){
			if(default_audience == this._default_audience){
				return;
			}
			this._default_audience = default_audience;
			if(NW.isNative()){
				NW.comm('fbDefaultAudience', [this._default_audience], true).load();
			}
		}
	}
);


OJ.extendManager(
	'Pinterest', 'NwPinterest', [OjActionable],
	{
		'_library_elm' : null,

		'makeShareButton' : function(img/*, url, description*/){
			var args = arguments,
				ln = args.length,
				desc = ln < 2 ? '' : OJ.pageTitle(),
				link = new OjLink(
					null,
					'https://pinterest.com/pin/create/button/?url=' +
						String.string(ln > 1 ? args[1] : HistoryManager.get()).encodeUri() +
						'&media=' +  String.string(img).encodeUri() +
						'&description=' +  String.string(ln > 2 ? args[2] : desc).encodeUri(),
					WindowManager.WINDOW
				);
			link.addCss(['pinterest-share-btn']);
			link.setTargetWidth(770);
			link.setTargetHeight(334);
			return link;
		}
	}
);


OJ.extendManager(
	'Twitter', 'NwTwitter', [OjActionable],
	{
		'_props_' : {
			'user' : null
		},

		'makeShareButton' : function(/*url, text, show_count=false, user, related, hashtags*/){
			var args = arguments,
				ln = args.length,
				user = ln > 3 ? args[3] : this._user,
				btn = new OjLink(
				'Tweet',
				'https://twitter.com/intent/tweet' +
				'?original_referer=' + String.string(ln ? args[0] : HistoryManager.get()).encodeUri() +
				'&text=' + String.string(ln > 1 ? args[1] : '').encodeUri().replace('%20', '+') +
				'&url=' + String.string(ln > 4 ? args[4] : '').encodeUri() +
				'&via=' + user.encodeUri(),
				WindowManager.WINDOW
			);
			btn.addCss(['twitter-share-btn']);
			btn.setTargetWidth(550);
			btn.setTargetHeight(420);
			return btn;
		}
	}
);

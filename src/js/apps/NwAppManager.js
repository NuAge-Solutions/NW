OJ.importJs('nw.apps.NwApp');
OJ.importJs('nw.apps.NwSession');
OJ.importJs('nw.utils.NwCacheManager');
OJ.importJs('nw.window.NwAppMessage');

OJ.importJs('oj.events.OjActionable');
OJ.importJs('oj.events.OjEvent');


OJ.extendManager(
	'AppManager', 'NwAppManager', [OjActionable],
	{
		'_props_' : {
            'messageClass' : NwAppMessage,
			'session' : null,
			'user' : null
		},

        '_get_props_' : {
            'app' : null,
            'is_logged_in' : null,
            'ready' : false
        },

		'_oj_ready' : false,

        '_loadings' : {},


        // internal methods
		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);

			// listen for when the OJ is ready
			if(OJ.is_ready){
				this._onOjReady(null);
			}
			else{
				OJ.addEventListener(OjEvent.READY, this, '_onOjReady');
			}
		},


		'_initApp' : function(){
            var self = this,
                app = self.app,
                evt = OjEvent;

			if(self._oj_ready && app && OJ.is_supported && !self._ready){
				self._ready = true;

				// init the app and get the session session
				app.init();

				// let everyone know we are inited
				self.dispatchEvent(new evt(evt.INIT))
			}
		},

		'_onOjReady' : function(evt){
            var self = this;

			if(!self._oj_ready){
				self._oj_ready = true;

				OJ.removeEventListener(OjEvent.READY, self, '_onOjReady');

				self._initApp();
			}
		},


		// public methods
		'init' : function(/*app*/){
			if(arguments.length){
				this._app = arguments[0];

				this._initApp();
			}

			return this;
		},


        // hud methods
        '_makeMessage' : function(message, title, icon){
            var cls = this.messageClass,
                msg = new cls(message, title);

            msg.paneWidth = 300;
            msg.paneHeight = 300;

            // show icon
            if(icon){
                msg.icon = icon + '.inverse.1x';
            }

            return msg;
        },

        '_numLoading' : function(){
            return Object.keys(this._loadings).length;
        },

        '_onLoadingPress' : function(){
            var self = this,
                loadings = self._loadings,
                ids = Object.keys(loadings),
                current = ids.last,
                cancelable = loadings[current][1];

            if(cancelable){
                cancelable();

                self.hideLoading(current);
            }
        },

        '_showMessage' : function(message, title, icon, duration){
            var self = this,
                msg, timer;

            // setup the new
            msg = self._makeMessage(message, title, icon);

            // show new
            msg.present();

            // setup & start the remove timer
            duration = isUnset(duration) ? 3000 : duration;

            if(duration){
                //self._msg_timer =
                timer = new OjTimer(duration);

                timer.on_complete = function(){
                    msg.cancel();
                };

                timer.start();
            }

            return msg;
        },


        'hideAllLoading' : function(){
            var self = this,
                loading = self._loading;

            if(!loading){
                return;
            }

            loading.cancel();

            self._loading = null;
            self._loadings = {};
        },

        'hideLoading' : function(id){
            var self = this,
                loading = self._loading,
                loadings = self._loadings,
                ids = Object.keys(loadings),
                ln = ids.length;

            if(!loading){
                return;
            }

            // if the id is the last one its the most current one and display needs to be updated
            if((!id || id == ids.last) && ln > 1){
                loading.title = loadings[ids[ln - 2]][0];
            }

            // remove the loading
            delete loadings[id || ids.last];

            // all loadings are gone reset
            if(!self._numLoading()){
                // delay the cancel just in case a new loading gets added into the mix
                setTimeout(function(){
                    if(!self._numLoading()){
                        loading.cancel();

                        self._loading = null;
                    }
                }, 10);

                self._loadings = {};
            }
		},

        'showError' : function(message, title, icon, duration){
            return this._showMessage(message, title || 'Error', icon || 'exclamation', duration);
        },

        'showLoading' : function(message, cancelable){
            var self = this,
                guid = OJ.guid(),
                loading = self._loading;

            // add this loading to the stack
            self._loadings[guid] = [message, cancelable];

            // update the loading message
            if(loading){
                loading.title = message;
            }
            else{
                self._loading = loading = self._makeMessage(null, message || 'Loading', 'circle-o-notch fa-spin');

                loading.cancelable = false;  // we want to manual control this

                loading.addEventListener(OjUiEvent.PRESS, self, '_onLoadingPress');

                loading.present();
            }

            return guid;
		},

        'showMessage' : function(message, title, icon, duration){
            return this._showMessage(message, title, icon, duration);
        },

        'showSuccess' : function(message, title, icon, duration){
            return this._showMessage(message, title || 'Success', icon || 'check', duration);
        },


        // app methods
        'apiRequest' : function(){
            var app = this.app;

			if(!app){
				throw new Error('No application initialized.');
			}

			return app.apiRequest.apply(app, arguments);
		},

		'login' : function(){
            var app = this.app;

			return app.login.apply(app, arguments);
		},

		'logout' : function(){
			var app = this.app;

			return app.logout.apply(app, arguments);
		},

        'newSession' : function(data){
            return this.app.newSession(data);
        },

        'newUser' : function(data){
            return this.app.newUser(data);
        },

		'userIsAdmin' : function(/*user*/){
			var user = arguments.length ? arguments[0] : this.user,
			    roles = user ? user.roles : null,
                admin = user.oj_class.ADMIN;

			return roles && roles.contains(admin);
		},


        // app properties
        '.is_logged_in' : function(){
			return this.app.is_logged_in;
		},

        '.db' : function(){
            return this.app.db;
        },

		'.session' : function(){
			return this.app.session;
		},
        '=session' : function(val){
            this.app.session = val;
        },

		'.user' : function(){
			var session = this.session;

			return session ? session.user : null;
		},
        '=user' : function(val){
            var session = this.session;

            if(session){
                session.user = val;
            }
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
OJ.importJs('nw.utils.NwCacheManager');

OJ.importCss('nw.social.NwFacebook');


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
            'access_token' : null,
            'session' : null
		},

		'_props_' : {
            'app_id' : null,
			'cookie' : false,
            'default_audience' : null,
			'frictionless_requests' : false,
			'hide_flash_callback' : null,
            'redirect_uri' : OJ.assetPath('nw.social', 'fb_login.html'),
			'sdk_source' : new OjUrl('//connect.facebook.net/en_US/sdk.js'),
			'status' : true,
			'version' : 'v2.3',
			'xfbml' : true
		},

		'_publish_permissions' : [
			'ads_management', 'publish_checkins', 'create_event',  'rsvp_event', 'manage_friendlists',
			'manage_pages', 'manage_notifications', 'publish_actions', 'publish_stream'
		],

		'_ready' : false,


		'_constructor' : function(){
            var self = this;

			self._super(OjActionable, '_constructor', []);

			// get the session data
			if(!(self._session = CacheManager.getData('fbSession'))){
				self._session = {};
			}

      		// setup the facebook sdk includes
			if(NW.isNative){
				NW.addEventListener(self.LOGIN, self, '_onLogin');
				NW.addEventListener(self.LOGIN_FAIL, self, '_onLoginFail');
				NW.addEventListener(self.LOGOUT, self, '_onLogout');
				NW.addEventListener(self.UPDATE, self, '_onUpdate');
			}
			else{
                // setup the init function
				window.fbAsyncInit = function() {
                    Facebook.init();
				};
			}

      		// listen for when the OJ is ready
			if(OJ.is_ready){
				self._onOjReady();
			}
			else{
				OJ.addEventListener(OjEvent.READY, self, '_onOjReady');
			}
		},

		'_destructor' : function(){
			NW.removeEventListener(this.LOGIN, this, '_onLogin');
			NW.removeEventListener(this.LOGOUT, this, '_onLogout');
			NW.removeEventListener(this.UPDATE, this, '_onUpdate');

			return this._super(OjActionable, '_destructor', arguments);
		},


		'_init' : function(){
            var self = this,
                fb = FB,
                scope = self._scope;

            fb.Event.subscribe(
				'auth.statusChange',
				function(response) {
					self._onStatusChange(response);
				}
			);

            fb.Canvas.setAutoGrow()

			fb.init({
				'appId' : self.app_id,
				'cookie' : self.cookie,
				'frictionlessRequests' : self.frictionless_requests,
				'hideFlashCallback' : self.hide_flash_callback,
				'status' : self.status,
				'version' : self.version,
				'xfbml' : self.xfbml
			});

			if(scope){
                self._scope = null;

                if(NW.isNative){
                    self.login(scope);
                }
                else{
                    fb.getLoginStatus(self._onStatusChange);
                }
			}
		},

		'_login' : function(session){
			this._session = session;

			if(!NW.isNative){
				CacheManager.setData('fbSession', this._session);
			}

			this.dispatchEvent(new OjEvent(this.LOGIN));
		},

		'_loginFail' : function(){
			this._session = null;

			if(!NW.isNative){
				CacheManager.setData('fbSession', this._session);
			}

			this.dispatchEvent(new OjEvent(this.LOGIN_FAIL));
		},

		'_logout' : function(session){
			this._session = session;

			if(!NW.isNative){
				CacheManager.setData('fbSession', this._session);
			}

			this.dispatchEvent(new OjEvent(this.LOGOUT));
		},


		'_onLogin' : function(evt){
			this._login(evt.data);
		},

		'_onLoginFail' : function(evt){
			this._loginFail();
		},

		'_onLogout' : function(evt){
			this._logout(evt.data);
		},

	    '_onOjReady' : function(evt){
            // load the sdk
			var sdk_source = this.sdk_source,
                root = new OjStyleElement();

            root.id = 'fb-root';

            OJ.prependChild(root);

			if(sdk_source){
				OJ.loadJs(sdk_source, true, true);
			}

			// cleanup event listener
			OJ.removeEventListener(OjEvent.READY, this, '_onOjReady');
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

			if(this.app_id){
				this._init();
			}
		},

		'login' : function(permissions, silent){
            if(NW.isNative){
				return NW.comm('fbLogin', Array.array(arguments)).load();
			}

            var self = this,
                scope = isArray(permissions) ? permissions.join(',') : permissions;

            // check for silent login
            if(silent){
                try {
                    FB.getLoginStatus(self._onStatusChange);
                }
                catch(e){
                    self._scope = scope;
                }

                return;
            }

            // check for webview that is not facebook in-app
            if(OJ.os == OJ.IOS && OJ.is_webview && navigator.userAgent.indexOf('FBAN') == -1){
                return window.open(
                    "https://www.facebook.com/dialog/oauth?client_id=" + self.app_id +
                    "&redirect_uri=" + self.redirect_uri +
                    "&scope=" + scope
                );
            }

            // try regular login
            try {
                FB.login(Facebook._onStatusChange, {'scope' : scope});
            }
            catch(e){
                self._scope = scope;
            }
		},

		'logout' : function(){
			if(NW.isNative){
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
			btn.dom.innerHTML =
				'<fb:like ' +
				'href="' + (ln ? args[0] : HistoryManager.get().toString()) + '"' +
				' send="false" show_faces="false" data-layout="button_count"' +
				'></fb:like>';

			if(window.FB){
				window.FB.XFBML.parse(btn.dom);
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

			btn.addCss('fb-share-btn');

			btn.targetWidth = 626;
			btn.targetHeight = 436;

			return btn;
		},

        'share' : function(url, callback){
            try{
                FB.ui(
                    {
                        display: 'popup',
                        href: url,
                        method: 'share'
                    },
                    callback
                );
            }
            catch(e){

            }
        },


		'.access_token' : function(/*reload = false*/){
			var args = arguments,
				reload = args.length ? args[0] : false;

			if(this._session && this._session.accessToken && !reload){
				return this._session.accessToken;
			}

			var response;

			if(NW.isNative){
				return (response = NW.comm('fbAccessToken', [], false).load()) && response.result ? this._session.accessToken = response.result : null;
			}
			else if(window.FB && (response = window.FB.getAuthResponse())){
				return response ? this._session.accessToken = response.accessToken : null;
			}

			return null;
		},

		'.app_id' : function(){
			if(this._app_id){
				return this._app_id;
			}
			else if(NW.isNative){
				var response = NW.comm('fbAppId', [], false).load();

				return response && response.result ? this._app_id = response.result : null;
			}

			return null;
		},
		'=app_id' : function(val){
            var self = this;

      		if(self._app_id == val){
				return;
			}

			self._app_id = val;

			if(NW.isNative){
				NW.comm('fbAppId', [val], true).load();
			}
			else if(self._ready){
				self._init();
			}
		},

		'.default_audience' : function(){
			if(this._default_audience){
				return this._default_audience;
			}
			else if(NW.isNative){
				var response = NW.comm('fbDefaultAudience', [], false).load();

				return response && response.result ? this._default_audience = response.result : null;
			}

			return null;
		},
		'=default_audience' : function(default_audience){
			if(default_audience == this._default_audience){
				return;
			}

			this._default_audience = default_audience;

			if(NW.isNative){
				NW.comm('fbDefaultAudience', [this._default_audience], true).load();
			}
		}
	}
);

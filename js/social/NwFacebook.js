OJ.importJs('nw.utils.NwCacheManager');
OJ.importJs('oj.events.OjActionable');
OJ.importJs('oj.dom.OjStyleElement');


'use strict';

OJ.extendManager(
	'Facebook', OjActionable, 'NwFacebook',
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
			this._super('NwFacebook', '_constructor', arguments);

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

			return this._super('NwFacebook', '_destructor', arguments);
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
			OJ.addJs('//connect.facebook.net/en_US/all.js', true);
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
				FB.login(
					Facebook._onStatusChange,
					{
						'scope' : ln ? args[0].join(',') : null
					}
				);
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

			var btn = new OjStyleElement('<span></span>');
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


		'getAccessToken' : function(){
			if(this._session && this._session.accessToken){
				return this._session.accessToken;
			}

			var response;

			if(NW.isNative()){
				return (response = NW.comm('fbAccessToken', [], false).load()) && response.result ? this._session.accessToken = response.result : null;
			}
			else if(response = FB.getAuthResponse()){
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
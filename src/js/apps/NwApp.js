OJ.importJs('nw.apps.NwSession');
OJ.importJs('nw.window.NwWindowManager');
OJ.importJs('nw.net.NwUrlLoader');
OJ.importJs('nw.net.NwUrlRequest');
OJ.importJs('nw.utils.NwCacheManager');

OJ.importCss('nw.apps.NwApp');


OJ.defineClass(
    'NwIApp',
    {
        '_get_props_' : {
            'db' : null,
            'is_logged_in' : null,
            'maxWidth' : null,
            'maxHeight' : null,
            'minWidth' : 320,
            'minHeight' : 320,
            'systemBar' : 'appSystemBarDefault', // NwApp.SYSTEM_BAR_DEFAULT
            'url' : null
        },

        '_props_' : {
            'session' : null
        },

        '_ready' : false, '_scale' : 1,  '_api_endpoint' : '', '_api_request_type' : OjUrlRequest.QUERY_STRING,

        '_has_mobile_layout' : false, '_has_tablet_layout' : false,

        '_session_class' : NwSession,

        // the acl object will serve as a first-level permission control system to prevent users from doing things they shouldn't
        // ultimately the final level of permission control should be done on the server side
        //'_acl' : null,
        //
        //'_orientations' : null,  '_api_response_type' : null,


        '_init' : function(){
            // setup the url
            var url = HistoryManager.get();
            this._url = url.protocol + '://' + url.host;

            // mobile settings
            if(
                (OJ.is_mobile && this._has_mobile_layout) ||
                (OJ.is_tablet && this._has_tablet_layout)
                ){
                this._scale = OJ.pixel_ratio;

                OJ.meta('viewport', 'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no');
                OJ.meta('apple-mobile-web-app-capable', 'yes');
            }

            // orientation settings
            if(this._orientations){
                NW.supportedOrientations = this._orientations;
            }

            // size settings
            if(this._minWidth && this._minHeight){
                NW.minSize = [this._minWidth, this._minHeight];
            }

            if(this._maxWidth && this._maxHeight){
                NW.maxSize = [this._maxWidth, this._maxHeight];
            }

            // init with the app manager
            AppManager.init(this);
        },


        // helper functions
        '_buildApiUrl' : function(method){
            var path = String.string(method);

            if(!path){
                path = '/'
            }
            else if(path.charAt(0) != '/'){
                path = '/' + path;
            }

            return this._api_endpoint + path;
        },

        '_login' : function(error){
            if(error){
                this.dispatchEvent(new OjEvent(NwApp.LOGIN_FAIL));

                AppManager.dispatchEvent(new OjEvent(NwApp.LOGIN_FAIL));
            }
            else{
                this.dispatchEvent(new OjEvent(NwApp.LOGIN));

                AppManager.dispatchEvent(new OjEvent(NwApp.LOGIN));
            }
        },

        '_logout' : function(error){
            if(error){
                this.dispatchEvent(new OjEvent(NwApp.LOGOUT_FAIL));

                AppManager.dispatchEvent(new OjEvent(NwApp.LOGOUT_FAIL));
            }
            else{
                this.dispatchEvent(new OjEvent(NwApp.LOGOUT));

                AppManager.dispatchEvent(new OjEvent(NwApp.LOGOUT));
            }
        },

        // event handler functions
        //'_onSaveSession' : function(evt){
        //    CacheManager.setData(this.oj_class_name, this._session);
        //},

        '_onSessionChange' : function(evt){
            try{
                var roles = this._session.user.roles,
                    list = this.cssList,
                    ln = list.length,
                    css;

                // remove old user roles
                for(; ln--;){
                    css = list[ln];

                    if(css.indexOf('user-role-') == 0){
                        list.removeAt(ln);
                    }
                }

                // add new user roles
                ln = roles.length

                for(; ln--;){
                    list.append('user-role-' + roles[ln]);
                }

                this.css = list;
            }
            catch(e){}

            CacheManager.setData(this.oj_class_name, this._session);
        },


        // utility functions
        'apiRequest' : function(endpoint, params, method, async){
            var loader = new NwUrlLoader(
                new NwUrlRequest(
                    this._buildApiUrl(endpoint), params, this._api_request_type, isUndefined(method) ? OjUrlRequest.GET : method
                ),
                isUnset(async) ? true : async
            );
            loader.contentType = this._api_response_type;

            return loader;
        },

        // this gets called by the app manager to let the app know all is ready to go
        'init' : function(){
            // setup the acl
            this._acl = {};

            // setup the session
            if(!(this.session = CacheManager.getData(this.oj_class_name))){
                this.session = this.newSession();
            }

            // ready the app visually
            this.redraw();
        },

        'login' : function(){
        },

        'logout' : function(){
        },

        'newSession' : function(data){
            var cls = this._session_class,
                session = new cls();

            if(data){
                session.importData(data);
            }

            if(!session.user){
                session.user = cls.newUser();
            }

            return session;
        },

        'newUser' : function(data){
            return this._session_class.newUser(data);
        },


        // Getter & Setter Functions
        '.is_logged_in' : function(){
            var session = this.session;

            return session && session.is_logged_in;
        },

        '=session' : function(val){
            if(this._session != val){
                if(this._session){
                    this._session.removeEventListener(OjEvent.CHANGE, this, '_onSessionChange');
                }

                if(this._session = val){
                    val.addEventListener(OjEvent.CHANGE, this, '_onSessionChange');

                    this._onSessionChange(null);
                }
            }

            return val;
        },

        '=systemBar' : function(value){
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

                    case NwApp.SYSTEM_BAR_LIGHT:
                        system_bar = 'light'
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
    'NwApp', [OjComponent, NwIApp],
    {
        '_constructor' : function(/*properties*/){
            this._init();  // this needs to happen first so that the app gets registered with the app manager

            this._super(OjComponent, '_constructor', arguments);
        }
    },
    {
        // Event Constants
        'LOGIN' : 'onLogin',
        'LOGIN_FAIL' : 'onLoginFail',
        'LOGOUT' : 'onLogout',
        'LOGOUT_FAIL' : 'onLogoutFail',

        // System Bar Constants
        'SYSTEM_BAR_BLACK' : 'appSystemBarBlack',
        'SYSTEM_BAR_BLACK_TRANS' : 'appSystemBarBlackTranslucent',
        'SYSTEM_BAR_DEFAULT' : 'appSystemBarDefault',
        'SYSTEM_BAR_LIGHT' : 'appSystemLight',
        'SYSTEM_BAR_NONE' : 'appSystemBarNone'
    }
);

OJ.importCss('nw.NW');
OJ.importCss('nw.FontAwesome');


OJ.extendClass(
    'NwManager', [OjActionable], {
        '_namespace' : 'nw',

        '_comm' : function(method, params){
            return NW.comm(this._namespace + '.' + method, params);
        }
    }
);


OJ.definePackage(
    'Nw',
    {
        '_get_props_' : {
            'isNative' : false,
            'isReady' : false,
            'userHttp' : false,
            'keyboardVisible' : false,
            'version' : 0
        },

        '_scroll_top' : 0, '_scroll_left' : 0,

//    '_analytics' : null,  '_callbacks' : {},  '_gateway' : null,


        'BACKGROUND_FETCH' : 'nwOnAppFetch',
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

        '_comm' : function(method, params, async){
            if(!params){
                params = [];
            }

            if(!async){
                async = true;
            }

            //if(this._useHttp){
            //    return (new NwRpc('http://native.web/comm', method, params, OjUrlRequest.JSON, async)).load();
            //}

            var comm = 'nw',
                context = window,
                i = 0,
                os = OJ.os,
                parts;

            if(os == OJ.IOS || os == OJ.OSX){
                context = window.webkit.messageHandlers[comm];
                comm = context.postMessage;
                params = [[method, params]]
            }
            else{
                parts = method.split('.');

                for(var ln = parts.length; i < ln; i++){
                    context = context[comm];

                    comm = context[parts[i]];
                }
            }

            if(async){
                return setTimeout(function(){
                    comm.apply(context, params);
                }, 1);
            }

            return comm.apply(context, params);
        },

        '_onNativeReady' : function(){
            var rtrn = this.comm('nw.ready');

            this._isReady = true;

            this.dispatchEvent(new OjEvent(OjEvent.READY));

            return rtrn;
        },

        '_triggerEvent' : function(evt, data){
            this.dispatchEvent(new NwEvent(evt, false, false, data));
        },

        '_onKeyboardHide' : function(evt){
            var self = this;

            self._keyboardVisible = false;

            OJ.scroll_top = self._scroll_top;
            OJ.scrol_left = self._scroll_left;
        },

        '_onKeyboardShow' : function(evt){
            var self = this;

            if(!self._keyboardVisible){
                self._scroll_top = OJ.scroll_top;
                self._scroll_left = OJ.scroll_left;
            }

            self._keyboardVisible = true;
        },

        '_onOrientationChange' : function(evt){
            // if not native lock the orientation in
            var orientationEvent = OjOrientationEvent;

            //					if(
            //						(o == orientationEvent.LANDSCAPE_LEFT )
            //					){
            //
            //					}
            //					else if(evt.getOrientation() == OjOrientationEvent.LANDSCAPE_RIGHT){
            //
            //					}
        },


        // utility functions
        'comm' : function(){},

        '=isNative' : function(val){
            if(arguments.length){
                if(this._isNative = !isEmpty(this._gateway = val)){
                    OJ.addCss('is-native');

                    this.comm = this._comm;

                    if(OJ.is_ready){
                        this._onNativeReady();
                    }

                    // override the default safari functionality
                    document.documentElement.style.webkitTouchCallout =
                    document.body.style.webkitTouchCallout =
                    document.body.style.KhtmlUserSelect = 'none';

                    document.documentElement.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
                }
                else{
                    this.comm = function(){};
                }
            }
        },

        'notify' : function(msg, title, date){
            this.comm('nw.notify', arguments, true);
        },

        'log' : function(obj){
            return this.comm('nw.log', [obj]);
        },

        'logTimed' : function(event, params){
            // todo: add tracking of timed event
        },

        // these are at the end for compilation reasons
        '_onOjLoad' : function(evt){
            this._super(OjPackage, '_onOjLoad', arguments);

            // detect if native
            var url = HistoryManager.get();

            this.isNative = (url.host == 'native.web') ? url.getQueryParam('nw-gateway') : window.__nw_gateway_id__;

            OJ.importJs('nw.apps.NwAppManager');
            OJ.importJs('nw.events.NwEvent');
            OJ.importJs('nw.net.NwRpc');
        },

        '_onOjReady' : function(evt){
            this._super(OjPackage, '_onOjReady', arguments);

            if(this.isNative){
                this._onNativeReady();
            }
            else{
                OJ.addEventListener(OjOrientationEvent.CHANGE, this, '_onOrientationChange');
            }
        },

        // config functions
        '.gateway' : function(){
            return this._gateway;
        },

        '.maxSize' : function(){
            return this.comm('nw.maxSize');
        },
        '=maxSize' : function(width, height){
            return this.comm('nw.maxSize', [width, height]);
        },

        '.minSize' : function(){
            return this.comm('nw.minSize');
        },
        '=minSize' : function(width, height){
            this.comm('nw.minSize', [width, height]);
        },

        '.statusBarStyle' : function(){
            return this.comm('nw.statusBarStyle');
        },
        '=statusBarStyle' : function(val){
            this.comm('nw.statusBarStyle', [val]);
        },

        '.supportedOrientations' : function(){
            return this.comm('nw.supportedOrientations');
        },

        '=supportedOrientations' : function(val){
            this.comm('nw.supportedOrientations', [val]);
        }
    }
);

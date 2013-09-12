OJ.importCss('nw.NW');


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

      OJ.importJs('nw.app.NwAppManager');
      OJ.importJs('nw.events.NwEvent');
      OJ.importJs('nw.net.NwRpc');
      OJ.importJs('oj.events.OjOrientationEvent');
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
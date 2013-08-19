OJ.importCss('nw.NW');


'use strict';

window.NW = (function Nw(){
	return new OjActionable(
		{
			'_alerts' : {},  '_analytics' : null,  '_callbacks' : {},  '_gateway' : null,  '_is_native' : false,

			'_scroll_top' : 0,  '_scroll_left' : 0, '_keyboard_visible' : false,

			'_old_trace' : null,


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


			// config functions
			'getGateway' : function(){
				return this._gateway;
			},

			'getMaxSize' : function(){
				if(!this._is_native){
					return null;
				}

				return this.comm('maxSize', [], false).load();
			},
			'setMaxSize' : function(width, height){
				if(this._is_native){
					this.comm('maxSize', [width, height]).load();
				}
			},

			'getMinSize' : function(){
				if(!this._is_native){
					return null;
				}

				return this.comm('minSize', [], false).load();
			},
			'setMinSize' : function(width, height){
				if(this._is_native){
					this.comm('minSize', [width, height]).load();
				}
			},

			'getSupportedOrientations' : function(){
				if(!this._is_native){
					return null;
				}

				return this.comm('supportedOrientations', [], false).load();
			},

			'setSupportedOrientations' : function(orientations){
				if(this._is_native){
					this.comm('supportedOrientations', [orientations]).load();
				}
			},


			// utility functions
			'comm' : function(method, params/*, async=true*/){
				return new NwRpc(
					'http://native.web/comm', method, params, OjRpc.JSON,
					arguments.length > 2 ? arguments[2] : true
				);
			},

			'isNative' : function(/*gateway*/){
				if(arguments.length){
					if(this._is_native = !isEmpty(this._gateway = arguments[0])){
						OJ.addCss(['is-native']);

						if(OJ.isReady()){
							this.comm('ready', []).load();
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
					return this.comm('trace', [obj]).load();
				}
			},

			'trackTimed' : function(event, params){
				// todo: add tracking of timed event
			},


			// these are at the end for compilation reasons
			'_onOjLoad' : function(evt){
				OJ.removeEventListener(OjEvent.LOAD, this, '_onOjLoad');

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
				OJ.removeEventListener(OjEvent.READY, this, '_onOjReady');

				if(this._is_native){
					this.comm('ready', []).load();
				}
				else{
					OJ.addEventListener(OjOrientationEvent.CHANGE, this, '_onOrientationChange');
				}
			}
		}
	);
})();


OJ.addEventListener(OjEvent.LOAD, NW, '_onOjLoad');
OJ.addEventListener(OjEvent.READY, NW, '_onOjReady');
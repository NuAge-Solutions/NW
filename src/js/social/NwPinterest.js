OJ.importCss('nw.social.NwPinterest');


OJ.extendManager(
	'Pinterest', 'NwPinterest', [OjActionable],
	{
		'_props_' : {
            'app_id' : null,
            'cookie' : true,
            'sdk_source' : new OjUrl('//assets.pinterest.com/sdk/sdk.js'),
        },

        '_constructor' : function(){
            var self = this;

			self._super(OjActionable, '_constructor', []);

			// setup the pinterest sdk includes
			if(NW.isNative){

			}
			else{
                window.pAsyncInit = function(){
                    Pinterest.init();
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


        '_init' : function(){
            var self = this,
                pdk = PDK;

            pdk.init({
                'appId' : self.app_id,
                'cookie' : self.cookie
            });
        },


        '_onOjReady' : function(evt){
            // load the sdk
			var self = this,
                sdk_source = self.sdk_source;

			if(sdk_source){
				OJ.loadJs(sdk_source, true, false);
			}

			// cleanup event listener
			OJ.removeEventListener(OjEvent.READY, self, '_onOjReady');
	    },


        'init' : function(){
            var self = this;

            self._ready = true;

			if(self.app_id){
				self._init();
			}
		},

        'pin' : function(image_url, note, url, callback){
            try{
                PDK.pin(image_url, note, url, callback);
            }
            catch(e){

            }
        },


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

			link.addCss('pinterest-share-btn');

			link.targetWidth = 770;
			link.targetHeight = 334;

			return link;
		},


        '.app_id' : function(){
            var self = this;

			if(self._app_id){
				return self._app_id;
			}
			else if(NW.isNative){
				var response = NW.comm('pdkAppId', [], false).load();

				return response && response.result ? self._app_id = response.result : null;
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
				NW.comm('pdkAppId', [val], true).load();
			}
			else if(self._ready){
				self._init();
			}
		}
	}
);
OJ.importJs('oj.events.OjActionable');

OJ.importCss('nw.social.NwTwitter');


OJ.extendManager(
	'Twitter', 'NwTwitter', [OjActionable],
	{
		'_props_' : {
            'sdk_source' : new OjUrl('//platform.twitter.com/widgets.js'),
        },


        '_constructor' : function(){
            var self = this;

			self._super(OjActionable, '_constructor', []);

			// setup the pinterest sdk includes
			if(NW.isNative){

			}
			else{
                window.twttr = {
                    '_e' : [],
                    'ready' : function(f) {
                        this._e.push(f);

                        Twitter.init();
                    }
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
            var self = this;


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

			btn.addCss('twitter-share-btn');

			btn.targetWidth = 550;
			btn.targetHeight = 420;

			return btn;
		},


        'tweet' : function(url, text, callback){
            var page_url = HistoryManager.get(),
                url = 'https://twitter.com/intent/tweet' +
				'?original_referer=' + String.string(page_url).encodeUri() +
				'&text=' + String.string(text || '').encodeUri().replace('%20', '+') +
				'&url=' + String.string(url || page_url).encodeUri();

            WindowManager.open(url, 'tweet', {
                'height' : 300,
                'location' : 0,
                'menubar' : 0,
                'modal' : 'yes',
                'resizeable' : 0,
                'status' : 0,
                'titlebar' : 0,
                'toolbar' : 0,
                'width' : 600
            });

        }
	}
);
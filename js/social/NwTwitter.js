OJ.importJs('oj.events.OjActionable');


'use strict';

OJ.extendManager(
	'Twitter', OjActionable, 'NwTwitter',
	{
		'_props_' : {
			'user' : null
		},


		'_constructor' : function(){
			this._super('NwTwitter', '_constructor', arguments);

			OJ.addJsFile('//platform.twitter.com/widgets.js', true, true);
		},




		'makeShareButton' : function(/*url, text, show_count=false, user, related, hashtags*/){
			var args = arguments,
				ln = args.length,
				user = ln > 3 ? args[3] : this._user;

			var btn = new OjStyleElement('<span></span>');
			btn.dom().innerHTML = '<a href="https://twitter.com/share" class="twitter-share-button"' +
				' data-url="' + String.string(ln ? args[0] : HistoryManager.get()) + '"' +
				(ln > 1 ? ' data-text="' + String.string(args[1]) + '"' : '') +
				(ln > 2 && args[2] ? '' : ' data-count="none"') +
				(user ? ' data-via="' + user + '"' : '') +
				(ln > 4 ? ' data-related="' + String.string(args[4]) + '"' : '') +
				(ln > 5 ? ' data-hashtags="' + String.string(args[5]) + '"' : '') +
				'>Tweet</a>';

			OJ.render(btn);

			if(window.twttr){
				twttr.widgets.load();
			}

			return btn;
		}
	}
);
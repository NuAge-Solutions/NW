OJ.importJs('oj.events.OjActionable');

OJ.importCss('nw.social.NwTwitter');


OJ.extendManager(
	'Twitter', 'NwTwitter', [OjActionable],
	{
		'_props_' : {
			'user' : null
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

			btn.addCss(['twitter-share-btn']);

			btn.setTargetWidth(550);
			btn.setTargetHeight(420);

			return btn;
		}
	}
);
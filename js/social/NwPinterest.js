OJ.importJs('oj.events.OjActionable');

OJ.importCss('nw.social.NwPinterest');

'use strict';

OJ.extendManager(
	'Pinterest', OjActionable, 'NwPinterest',
	{
		'_library_elm' : null,


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

			link.addCss(['pinterest-share-btn']);

			link.setTargetWidth(770);
			link.setTargetHeight(334);

			return link;
		}
	}
);
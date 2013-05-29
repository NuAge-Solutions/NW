OJ.importJs('oj.events.OjActionable');


'use strict';

OJ.extendManager(
	'Pinterest', OjActionable, 'NwPinterest',
	{
		'_library_elm' : null,


		'_constructor' : function(){
			this._super('NwPinterest', '_constructor', arguments);


		},

		'_reloadPins' : function(){
			if(this._library_elm && this._library_elm.parentNode){
				this._library_elm.parentNode.removeChild(this._library_elm);
			}

			this._library_elm = OJ.addJsFile('//assets.pinterest.com/js/pinit.js', true);
		},

		'makePinItButton' : function(img/*, url, description*/){
			var args = arguments,
				ln = args.length,
				desc = ln < 2 ? '' : OJ.pageTitle();

			var btn = new OjStyleElement('<span></span>');
			btn.dom().innerHTML =
				'<a href="//pinterest.com/pin/create/button/' +
					'?url=' + String.string(ln > 1 ? args[1] : HistoryManager.get()).encodeUri() +
					'&media=' +  String.string(img).encodeUri() +
					'&description=' +  String.string(ln > 2 ? args[2] : desc).encodeUri() +
				'" data-pin-do="buttonPin" data-pin-config="none"><img src="//assets.pinterest.com/images/pidgets/pin_it_button.png" /></a>';

			this._reloadPins();

			return btn;
		}
	}
);
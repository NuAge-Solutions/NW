OJ.importJs('oj.window.OjWindowManager');


'use strict';

OJ.extendManager(
	'WindowManager', OjWindowManager, 'NwWindowManager',
	{
		'alert' : function(title, message/*, buttons, cancel_label*/){
			var alrt = this._alert.apply(this, arguments);

			// if app is not running natively then just call the regular alert
			if(isUndefined(NW.alert(alrt))){
				this.show(alrt);
			}

			return alrt;
		},

		'browser' : function(url, title/*, width, height*/){
			var rtrn;

			if(isUndefined(rtrn = NW.browser(url, title, true))){
				return this._super('NwWindowManager', 'browser', arguments);
			}

			return rtrn;
		}
	}
);
OJ.importJs('oj.net.OjUrlRequest');


'use strict';

OJ.extendClass(
	'NwUrlRequest', [OjUrlRequest],
	{
		'_props_' : {
			'priority' : 0,
			'method'   : OjUrlRequest.POST,
			'weight'   : 0
		},

		'_constructor' : function(){
			this._super(OjUrlRequest, '_constructor', arguments);

			this.setContentType(OjUrlRequest.JSON);
		}
	}
);
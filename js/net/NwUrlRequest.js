OJ.importJs('oj.net.OjUrlRequest');


'use strict';

OJ.extendClass(
	OjUrlRequest, 'NwUrlRequest',
	{
		'_props_' : {
			'priority' : 0,
			'method'   : OjUrlRequest.POST,
			'weight'   : 0
		},

		'_constructor' : function(){
			this._super('NwUrlRequest', '_constructor', arguments);

			this.setContentType(OjUrlRequest.JSON);
		}
	}
);
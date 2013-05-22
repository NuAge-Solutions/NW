OJ.importJs('oj.net.OjRpc');

'use strict';

OJ.extendClass(
	OjRpc, 'NwRpc',
	{
		'_get_props_' : {
			'gateway' : null
		},


		'_constructor' : function(url, method, params/*, content_type, async*/){
			this._super('NwRpc', '_constructor', arguments);

			this._request.getData()['gateway'] = NW.getGateway();
		}
	}
);
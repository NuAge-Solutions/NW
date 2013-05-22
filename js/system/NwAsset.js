OJ.importJs('oj.net.OjRpc');


'use strict';

OJ.extendClass(
	OjObject, 'NwAsset',
	{
		'_props_' : {
			'source' : null
		},


		'_constructor' : function(/*source, lifespan, priority*/ ){
			this._super('NwRpc', '_constructor', arguments);

			this._request.getData()['gateway'] = NW.getGateway();
		}
	}
);
OJ.importJs('oj.net.OjUrlLoader');


'use strict';

OJ.extendClass(
	'NwUrlLoader', [OjUrlLoader],
	{
		'_async' : true,  '_is_multipart' : false,

		'_loadMultiPartRequest' : function(){
			if(NW.isNative()){
				this._is_multipart = true;

				return this._load();
			}

			this._super(OjUrlLoader, '_loadMultiPart', arguments);
		},

		'_xhrFormat' : function(){
			if(this._is_multipart){
				this._xhr.setRequestHeader('content-type', OjUrlLoader.JSON);

				return;
			}

			this._super(OjUrlLoader, '_xhrFormat', arguments);
		},

		'_xhrOpen' : function(){
			if(this._is_multipart){
				return this._xhr.open(OjUrlRequest.POST, 'http://native.web/request', this._async);
			}

			this._super(OjUrlLoader, '_xhrOpen', arguments);
		},

		'_xhrSend' : function(){
			if(this._is_multipart){
				return this._xhr.send(toJson({
					'url'     : this._request.toString(),
					'headers' : this._request.getHeaders(),
					'method'  : this._request.getMethod(),
					'data'    : this._request.getData(),
					'files'   : this._request.getFiles()
				}));
			}

			this._super(OjUrlLoader, '_xhrSend', arguments);
		}
	}
);
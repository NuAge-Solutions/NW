OJ.importJs('oj.utils.OjCacheManager');


'use strict';

OJ.extendManager(
	'CacheManager', OjCacheManager, 'NwCacheManager',
	{
		'_is_native' : false,


		'_constructor' : function(manager){
			this._super('NwCacheManager', '_constructor', []);

			// determine which set of functions to use based on the systems capabilities
			if(this._is_native = NW.isNative()){
//				this.getData = this.getNativeData;
//				this.setData = this.setNativeData;
//				this.unsetData = this.unsetNativeData;
			}

			this._policies = manager._policies;
			this._cache_size = manager._cache_size;
		},


		'getNativeData' : function(key){

		},

		'setNativeData' : function(key, value){

		},

		'unsetNativeData' : function(key){

		}
	}
);
OJ.importJs("oj.utils.OjCacheManager");"use strict";OJ.extendManager("CacheManager",OjCacheManager,"NwCacheManager",{_is_native:false,_constructor:function(a){this._super("NwCacheManager","_constructor",[]);if(this._is_native=NW.isNative()){}this._policies=a._policies;this._cache_size=a._cache_size},getNativeData:function(a){},setNativeData:function(a,b){},unsetNativeData:function(a){}});
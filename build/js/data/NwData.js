OJ.importJs("nw.app.NwAppManager");OJ.importJs("nw.data.NwDataEvent");OJ.importJs("nw.data.NwDataErrorEvent");OJ.importJs("nw.data.properties.NwProperty");OJ.importJs("nw.data.properties.NwUuidProperty");OJ.importJs("nw.net.NwUrlLoader");OJ.importJs("oj.events.OjActionable");"use strict";OJ.extendClass(OjActionable,"NwData",{_post_compile_:function(c){NwData.registerDataType(this._static.TYPE,this._class_name);var d=this._static.DEFINITION,e=this._static.EXPORT_MAP,a=(this._static.IMPORT_MAP=Object.clone(this._static.IMPORT_MAP)),b;for(b in d){d[b].setup(this,b,b.ucFirst())}for(b in e){a[e[b]]=b}this._static.CACHE={};this._static._BACKLOG=[]},_constructor:function(){this._super("NwData","_constructor",[]);this._data={};this._dirty=[];this._keyword_cache={};var a=arguments.length;if(a){this._prevent_dispatch=true;this.importData(arguments[0],a>1?arguments[1]:NwData.DEFAULT);this._prevent_dispatch=false}},_addToDirty:function(a){if(this._dirty&&this._dirty.indexOf(a)==-1){this._dirty.push(a)}},_exportValue:function(b,a){if(this._static.hasProperty(b)){return this._static.DEFINITION[b].exportValue(this._data[b],a)}return this._data[b]},_getDeleteRequest:function(d){var a=Array.prototype.splice.call(arguments,0);if(a.length<2){var c={};c[this._static.PRIMARY_KEY]=this.primarKey();a.push(c)}var b=this._getRequest(this._translateDeleteParam,a);b.getRequest().setType(OjUrlRequest.POST);return b},_getLoadRequest:function(c){var a=Array.prototype.splice.call(arguments,0);if(a.length<2){var b={};b[this._static.PRIMARY_KEY]=this.primaryKey();a.push(b)}return this._getRequest(this._translateLoadParam,a)},_getRequest:function(a,b){if(b.length>1){var c,e,f,g,d={};for(c in b[1]){e=a.call(this,c);if(e){f=this._exportValue(c,NwData.API);if(isObject(f)&&(g=this._static.getProperty(c)).getFlatten()){for(c in f){e=a.call(this,g.getNamespace()+"."+c);if(e){d[e]=f[c]}}}else{d[e]=f}}}b[1]=d}return AppManager.apiRequest.apply(AppManager,b)},_getSaveRequest:function(){var a=Array.array(arguments);if(a.length<2){if(this.isNew()){a.push(Object.clone(this._data))}else{var b=this._dirty.length,d={};d[this._static.PRIMARY_KEY]=this.primaryKey();for(;b--;){d[this._dirty[b]]=this._data[this._dirty[b]]}a.push(d)}}var c=this._getRequest(this._translateSaveParam,a);c.getRequest().setMethod(OjUrlRequest.POST);return c},_importValue:function(f,d,e){if(this._static.hasProperty(f)){var b="set"+f.ucFirst();d=this._static.DEFINITION[f].importValue(d,this.property(f),e);if(b!="setnull"&&this[b]){this[b](d)}else{this.property(f,d)}if(e==NwData.API){var a=this._dirty.indexOf(f);if(a!=-1){this._dirty.splice(a,1)}}return}var a=f.indexOf(".");if(a>0){var c={};c[f.substr(a+1)]=d;this._importValue(f.substr(0,a),c,e)}},_processDeleteData:function(a){},_processLoadData:function(a){this.importData(a,NwData.API)},_processSaveData:function(a){this.importData(a,NwData.API)},_resetLoader:function(){if(this._loader){this._loader.cancel();this._loader=null}},_translateDeleteParam:function(b){var a=this._static.EXPORT_MAP;return a[b]?a[b]:b},_translateLoadParam:function(b){var a=this._static.EXPORT_MAP;return a[b]?a[b]:b},_translateSaveParam:function(b){var a=this._static.EXPORT_MAP;return a[b]?a[b]:b},_onDelete:function(a){this._is_loaded=false;this.primaryKey(null);this._processDeleteData(this._loader.getData());this._unset("_loader");this.dispatchEvent(new NwDataEvent(NwDataEvent.DELETE));this._static.dispatchEvent(new NwDataEvent(NwDataEvent.DELETE,this))},_onDeleteFail:function(a){this._unset("_loader");this.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.DELETE));this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.DELETE,this))},_onLoad:function(a){this._is_loaded=true;this._processLoadData(this._loader.getData());this._unset("_loader");this.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD));this._static.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD,this))},_onLoadFail:function(a){this._unset("_loader");this.dispatchEvent(new NwDataEvent(NwDataErrorEvent.LOAD));this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.LOAD,this))},_onSave:function(a){if(a){var e=a.getTarget(),b=e.getData();if(e.is("OjRpc")){if(!b||b.error){return this._onSaveFail(a)}b=b.result}this._processSaveData(b);var c,d,f=e.getRequest().getData(),g=this._static.EXPORT_MAP;for(d in f){c=this._dirty.indexOf(g[d]);if(c!=-1){this._dirty.splice(c,1)}}if(this._loader==e){this._unset("_loader")}}this.dispatchEvent(new NwDataEvent(NwDataEvent.SAVE,this));this._static.dispatchEvent(new NwDataEvent(NwDataEvent.SAVE,this))},_onSaveFail:function(a){var e,d;if(a){var c=this._loader,b=c.getData();if(c.is("OjRpc")&&b){e=b.error.code;d=b.error.message}this._unset("_loader")}this.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.SAVE,this,d,e));this._static.dispatchEvent(new NwDataErrorEvent(NwDataErrorEvent.SAVE,this,d,e))},clone:function(){var a=this._super("NwData","clone",[]);a.importData(this._data,NwData.CLONE);return a},"delete":function(){this._resetLoader();this._loader=this._getDeleteRequest();this._loader.addEventListener(OjEvent.COMPLETE,this,"_onDelete");this._loader.addEventListener(OjEvent.FAIL,this,"_onDeleteFail");this._loader.load()},exportData:function(){var a,b,e,h,g,f=arguments.length?arguments[0]:NwData.DEFAULT,d=f==NwData.DEFAULT,c=this._static.EXPORT_MAP;if(d){e=this._super("NwData","exportData",arguments)}else{e={};if(!this.isNew()){e[this._static.PRIMARY_KEY]=this.primaryKey()}}for(a in this._data){if(d||this._dirty.indexOf(a)!=-1){g=this._exportValue(a,f);if(isObject(g)&&(h=this._static.getProperty(a)).getFlatten()){for(a in g){if(a=="_class_name"){continue}b=h.getNamespace()+"."+a;e[c[b]?c[b]:b]=g[a]}}else{e[c[a]?c[a]:a]=g}}}return e},importData:function(c){var a,e=arguments.length>1?arguments[1]:NwData.DEFAULT,d=this._static.IMPORT_MAP,b=this._static.PRIMARY_KEY;for(a in c){if(e==NwData.CLONE&&a==b){continue}this._importValue(d[a]?d[a]:a,c[a],e)}},isDirty:function(){return this._dirty.length>0},isLoaded:function(){return this._is_loaded},isNew:function(){return isEmpty(this.primaryKey())},primaryKey:function(){if(arguments.length){this.property(this._static.PRIMARY_KEY,arguments[0])}return this._data[this._static.PRIMARY_KEY]},keywordScore:function(a){var c=[],e=0;if(isArray(a)){c=a}else{c.push(a)}var b,d=c.length;while(d-->0){for(b in this._keyword_cache){if(this._keyword_cache[b]){e+=this._keyword_cache[b].count(c[d].toLowerCase())/(d+1)}}}return e},load:function(){var a=arguments,c=a.length,b=c?a[0]:false;if(this._is_loaded&&!b){return}this._resetLoader();this._is_loaded=false;this._loader=this._getLoadRequest();this._loader.addEventListener(OjEvent.COMPLETE,this,"_onLoad");this._loader.addEventListener(OjEvent.FAIL,this,"_onLoadFail");this._loader.load()},property:function(f){var b=arguments,c=this._data[f];if(b.length>1){var e=b[1];if(c!=e){this._addToDirty(f);var a=new NwDataEvent(NwDataEvent.CHANGE,e,c);this._data[f]=e;var d=this._static.DEFINITION;if(d&&d[f]&&d[f].is("OjTextProperty")){this._keyword_cache[f]=value?value.toLowerCase():null}this.dispatchEvent(a)}}return c},save:function(){if(!this.isNew()&&isEmpty(this._dirty)){this._onSave(null);return}this._resetLoader();this._loader=this._getSaveRequest();this._loader.addEventListener(OjEvent.COMPLETE,this,"_onSave");this._loader.addEventListener(OjEvent.FAIL,this,"_onSaveFail");this._loader.load()},title:function(){return null},getId:function(){return this._data.id},setId:function(a){var b=this.getId();if(b){delete this._static.CACHE[b]}this.property("id",a);if(a){this._static.CACHE[a]=this}}},{API:"api",CLONE:"clone",DEFAULT:"default",CACHE:{},DEFINITION:{id:new NwUuidProperty()},EXPORT_MAP:{},IMPORT_MAP:{},PRIMARY_KEY:"id",TYPE:"Data",TYPES:{},_BACKLOG:[],_onAppManagerInit:function(b){AppManager.removeEventListener(OjEvent.INIT,this,"_onAppManagerInit");var c=0,d=this._BACKLOG.length,a;for(c;c<d;c++){a=this._BACKLOG[c];this[a[0]].apply(this,a[1])}delete this._BACKLOG},_backlogCall:function(b,a){if(AppManager.isReady()){return false}AppManager.addEventListener(OjEvent.INIT,this,"_onAppManagerInit");this._BACKLOG.push([b,a]);return true},_callApi:function(a,b,e,c,d){if(this._backlogCall("_callApi",arguments)){return}return this._callApiWithRequest(AppManager.apiRequest(a,b,e),c,d)},_callApiWithRequest:function(a,b,c){a.addEventListener(OjEvent.COMPLETE,this,b);a.addEventListener(OjEvent.FAIL,this,c);a.load();return a},_onApiFail:function(a,c,e){var b=arguments,d=b.length;if(a){a=OJ.destroy(a)}this.dispatchEvent(new NwDataErrorEvent(c,e,d>3?b[3]:null,d>4?b[4]:null))},_onApiLoad:function(a,e,g){var b=arguments,f=b.length,c=f>3?b[3]:null;if(a){var h=this.importData(a.getTarget().getData(),NwData.API);if(c){this[g][c]=h}else{this[g]=h}a=OJ.destroy(a)}this.dispatchEvent(new NwDataEvent(e,c?this[g][c]:this[g],f>4?b[4]:null))},addEventListener:function(b,a,c){EventManager.addEventListener(this,b,a,c)},dispatchEvent:function(a){if(this._prevent_dispatch){return}EventManager.dispatchEvent(this,a)},get:function(d){if(!this.CACHE[d]){var b=this;var a=new b();a.setId(d)}return this.CACHE[d]},getProperty:function(a){return this.DEFINITION[a]},hasEventListener:function(a){return EventManager.hasEventListener(this,a)},hasProperty:function(a){return !isUndefined(this.DEFINITION[a])},id:function(){if(!this.CLASS_NAME){this.CLASS_NAME=OJ.classToString(this)}return this.CLASS_NAME},importData:function(d){var a=arguments,f=a.length>1?a[1]:NwData.DEFAULT;if(isArray(d)){var b=d.length;while(b-->0){d[b]=this.importData(d[b],f)}return d}if(isObject(d)){var h=d._class_name?OJ.stringToClass(d._class_name):this;if(h){var e,g=d[this.PRIMARY_KEY];if(g&&h.CACHE[g]){e=h.CACHE[g]}else{e=new h()}e.importData(d,f);return e}}return null},load:function(b){if(!b){return null}var a=this.get(b);if(a.isLoaded()&&(arguments.length==1||!arguments[1])){this.dispatchEvent(new NwDataEvent(NwDataEvent.LOAD,a))}else{a.load()}return a},registerDataType:function(a,b){if(!NwData.TYPES[a]){NwData.TYPES[a]=b}},removeAllListeners:function(){return EventManager.removeAllListeners(this)},removeEventListener:function(b,a,c){EventManager.removeEventListener(this,b,a,c)},typeToClass:function(a){if(NwData.TYPES[a]){return OJ.stringToClass(NwData.TYPES[a])}return null}});
OJ.importJs('nw.data.NwData');
OJ.importJs('nw.data.NwDataEvent');
OJ.importJs('nw.data.properties.NwObjectProperty');
OJ.importJs('oj.data.OjCollection');


'use strict';

OJ.extendClass(
	NwObjectProperty, 'NwReferenceProperty',
	{
		'_props_' : {
			'class'        : NwData,
			'allowNesting' : false
		},


		'_constructor' : function(cls /*, properties*/){
			this._super('NwReferenceProperty', '_constructor', arguments.length > 1 ? [arguments[1]] : []);

			this.setClass(cls);
		},


		'_exportSubValue' : function(value, old_value, mode){
			if(value && isObjective(value)){
				return (this._allowNesting || this._flatten) ? value.exportData(mode) : value.primaryKey();
			}

			return value;
		},

		'_exportValue' : function(value, old_value, mode){
			if(this._max == 1){
				return this._exportSubValue(value, old_value, mode);
			}

			var ary = [], ln = value ? value.numItems() : 0;

			for(; ln--;){
				ary.unshift(
					this._exportSubValue(
						value.getItemAt(ln),
						old_value,
						mode
					)
				);
			}

			return ary;
		},

		'_formatter' : function(func, value/*, old_value, mode*/){
			var ln = arguments.length;

			return func.call(
				this,
				value,
				ln > 2 ? arguments[2] : null,
				ln > 3 ? arguments[3] : NwData.DEFAULT
			);
		},

		'_importSubValue' : function(value, old_value, mode){
			// if the value is null then just return that
			if(!value){
				return null;
			}

			// if value is of the proper oj class type then return it
			if(isObjective(value) && value.is(this._class)){
				return value;
			}

			// if we allow nesting and have an old value then we need to handle this special
			if((this._allowNesting || this._flatten) && old_value){
				if(isObject(value)){
					old_value.importData(value, mode);
				}
				else{
					old_value.primaryKey(value);
				}

				return old_value;
			}

			var cls = this.getClass();

			return isObject(value) ? cls.importData(value, mode) : cls.get(value);
		},

		'_importValue' : function(value, old_value, mode){
			if(this._max == 1){
				return this._importSubValue(value, old_value, mode);
			}

			var old_ln = old_value ? old_value.numItems() : 0,
				items = old_ln ? old_value : new OjCollection();

			if(isArray(value)){
				var ln = isArray(value) ? value.length : 0;

				ln = this._max == 0 ? ln : Math.min(ln, this._max);

				for(; ln--;){
					if(ln < old_ln){
						items.setItemAt(
							this._importSubValue(
								value[ln],
								items.getItemAt(ln),
								mode
							),
							ln
						);
					}
					else{
						items.addItemAt(
							this._importSubValue(value[ln], null, mode),
							old_ln
						);
					}
				}

				return items;
			}

			if(isObject(value)){
				var key, i;

				for(key in value){
					i = parseInt(key);

					if(!this._max || ary.length < this._max){
						if(i < old_ln){
							items.setItemAt(
								this._importSubValue(
									value[key],
									items.getItemAt(i),
									mode
								),
								i
							);
						}
						else{
							items.addItem(this._importSubValue(value[key], null, mode));
						}
					}
				}

				return items;
			}

			return (this._allowNesting || this._flatten) ? old_value : null;
		},


		'setup' : function(obj, key, u_key){
			// setup the name and namespace
			this._name = key;

			if(!this._namespace){
				this._namespace = key;
			}

			// setup the getter and setter funcs
			var getter = 'get' + u_key,
				setter = 'set' + u_key,
				ns = this._namespace.ucFirst(),
				on_change,
				is_sub = (this._allowNesting || this._flatten);


			// setup change listener function if one doesn't already exist
			on_change = 'on' + ns + 'Change';

			if(!obj[on_change]){
				obj[on_change] = function(evt){
					if(is_sub){
						this._addToDirty(key);
					}
				};
			}

			// setup the getter function if one doesn't already exist
			if(!obj[getter]){
				obj[getter] = function(){
					return this.property(key);
				};
			}

			// setup the setter function if one doesn't already exist
			if(!obj[setter]){
				obj[setter] = function(val){
					var prev = this.property(key);

					if(prev){
						if(prev.is('NwData')){
							prev.removeEventListener(NwDataEvent.CHANGE, this, on_change);
						}
						else if(prev.is('OjCollection')){
							prev.removeEventListener(OjCollectionEvent.ITEM_ADD, this, on_change);
							prev.removeEventListener(OjCollectionEvent.ITEM_MOVE, this, on_change);
							prev.removeEventListener(OjCollectionEvent.ITEM_REMOVE, this, on_change);
							prev.removeEventListener(OjCollectionEvent.ITEM_REPLACE, this, on_change);
						}
					}

					this.property(key, val);

					if(val){
						if(val.is('NwData')){
							val.addEventListener(NwDataEvent.CHANGE, this, on_change);
						}
						else if(val.is('OjCollection')){
							val.addEventListener(OjCollectionEvent.ITEM_ADD, this, on_change);
							val.addEventListener(OjCollectionEvent.ITEM_MOVE, this, on_change);
							val.addEventListener(OjCollectionEvent.ITEM_REMOVE, this, on_change);
							val.addEventListener(OjCollectionEvent.ITEM_REPLACE, this, on_change);
						}
					}
				};
			}

			// if we only allow one or don't have a namespace
			// don't add the extra reference management functions
			if(this._max == 1 || !this._namespace){
				return;
			}

			// setup the add function if one doesn't already exist
			var func;

			func = 'add' + ns;

			if(!obj[func]){
				obj[func] = function(item){
					var items = this.property(key);

					if(!items){
						this.property(key, items = new OjCollection());
					}

					if(is_sub){
						item.addEventListener(NwDataEvent.CHANGE, this, on_change);
					}

					this._addToDirty(key);

					return items.addItem(item);
				};
			}

			// setup the addAt function if one doesn't already exist
			func += 'At';

			if(!obj[func]){
				obj[func] = function(item, index){
					var items = this.property(key);

					if(!items){
						this.property(key, items = new OjCollection());
					}

					if(is_sub){
						item.addEventListener(NwDataEvent.CHANGE, this, on_change);
					}

					this._addToDirty(key);

					return items.addItemAt(item, index);
				};
			}

			// setup the getAt function if one doesn't already exist
			func = 'get' + ns + 'At';

			if(!obj[func]){
				obj[func] = function(index){
					var items = this.property(key);

					if(!items){
						return null;
					}

					return items.getItemAt(index);
				};
			}

			// setup the has function if one doesn't already exist
			func = 'has' + ns;

			if(!obj[func]){
				obj[func] = function(item){
					var items = this.property(key);

					return items ? items.hasItem(item) : false;
				};
			}

			// setup the indexOf function if one doesn't already exist
			func = 'indexOf' + ns;

			if(!obj[func]){
				obj[func] = function(item){
					var items = this.property(key);

					return items ? items.indexOfItem(item) : -1;
				};
			}

			// setup the num function if one doesn't already exist
			func = 'num' + OJ.pluralize(ns);

			if(!obj[func]){
				obj[func] = function(){
					var items = this.property(key);

					return items ? items.numItems() : 0;
				};
			}

			// setup the remove function if one doesn't already exist
			func = 'remove' + ns;

			if(!obj[func]){
				obj[func] = function(item){
					var items = this.property(key);

					if(!items){
						return item;
					}

					if(is_sub){
						item.removeEventListener(NwDataEvent.CHANGE, this, on_change);
					}

					this._addToDirty(key);

					return items.removeItem(item);
				};
			}

			// setup the removeAt function if one doesn't already exist
			func += 'At';

			if(!obj[func]){
				obj[func] = function(index){
					var items = this.property(key);

					if(!items){
						return null;
					}

					if(is_sub){
						item.removeEventListener(NwDataEvent.CHANGE, this, on_change);
					}

					this._addToDirty(key);

					return items.removeItemAt(index);
				};
			}
		},

		'getClass' : function(){
			return OJ.toClass(this._class);
		}
	}
);
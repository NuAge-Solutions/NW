OJ.importJs('oj.components.OjItemRenderer');
OJ.importJs('oj.components.OjStack');


'use strict';

OJ.extendClass(
	OjStack, 'NwCollectionStack',
	{
		'_props_' : {
			'collection'   : null,
			'itemRenderer' : OjItemRenderer
		},


		// Construction & Destruction Functions
		'_constructor' : function(/*collection, item_renderer*/){
			this._super('NwCollectionStack', '_constructor', arguments);

			var ln = arguments.length;

			if(ln){
				if(ln > 1){
					this.setItemRenderer(arguments[1]);
				}

				this.setCollection(arguments[0]);
			}
		},

		'_destructor' : function(){
			// set items to null so we don't destroy a collection that was added
			this._items = null;

			return this._super('NwCollectionStack', '_destructor', arguments);
		},


		'_createView' : function(data){
			return new this._itemRenderer(this, data);
		},

		'_onDataAdd' : function(evt){

		},

		'_onDataMove' : function(evt){

		},

		'_onDataRemove' : function(evt){

		},

		'_onDataReplace' : function(evt){
			// store the new active
			this.container.getChildAt(evt.getIndex()).setData(this._active = evt.getItem());

//					this.dispatchEvent(new OjStackEvent(OjStackEvent.REPLACE, evt.getItem(), evt.getIndex()));
		},

		'addElm' : function(elm){
			throw new Error('Data Driven Component. Therefore addElm() is not permitted.');
		},

		'addElmAt' : function(elm, index){
			throw new Error('Data Driven Component. Therefore addElmAt() is not permitted.');
		},

		'getElmAt' : function(index){
			var data, elm = this._super('NwCollectionStack', 'getElmAt', arguments);

			if(!elm && this._collection && (data = this._collection.getItemAt(index))){
				this._items.setItemAt(elm = this._createView(data), index);
			}

			return elm;
		},

//				'getElms' : function(){
//					return this._callElmFunc('getElms', arguments);
//				},

		'moveElm' : function(){
			throw new Error('Data Driven Component. Therefore moveElm() is not permitted.');
		},

		'removeAllElms' : function(){
			throw new Error('Data Driven Component. Therefore removeAllElms() is not permitted.');
		},

		'removeElm' : function(elm){
			throw new Error('Data Driven Component. Therefore removeElm() is not permitted.');
		},

		'removeElmAt' : function(index){
			throw new Error('Data Driven Component. Therefore removeElmAt() is not permitted.');
		},

		'replaceElm' : function(target, replacement){
			throw new Error('Data Driven Component. Therefore replaceElm() is not permitted.');
		},

		'replaceElmAt' : function(elm, index){
			throw new Error('Data Driven Component. Therefore replaceElmAt() is not permitted.');
		},




		'setCollection' : function(collection){
			this._items.removeAllItems();

			// remove event listeners from old data object
			if(this._collection){
				this._collection.removeEventListener(OjCollectionEvent.ITEM_ADD, this, '_onDataAdd');
				this._collection.removeEventListener(OjCollectionEvent.ITEM_MOVE, this, '_onDataMove');
				this._collection.removeEventListener(OjCollectionEvent.ITEM_REMOVE, this, '_onDataRemove');
				this._collection.removeEventListener(OjCollectionEvent.ITEM_REPLACE, this, '_onDataReplace');
			}

			// setup the new data object
			if(this._collection = OjCollection.collection(collection)){
				// add the event listeners for changes to the collection
				this._collection.addEventListener(OjCollectionEvent.ITEM_ADD, this, '_onDataAdd');
				this._collection.addEventListener(OjCollectionEvent.ITEM_MOVE, this, '_onDataMove');
				this._collection.addEventListener(OjCollectionEvent.ITEM_REMOVE, this, '_onDataRemove');
				this._collection.addEventListener(OjCollectionEvent.ITEM_REPLACE, this, '_onDataReplace');

				// add the empty views to the carousel to save on processing
				// this way we only need to render the views when they are requested
				var ln = this._collection.numItems();

				for(; ln--;){
					this._items.addItem(null);
				}
			}

			// redraw the changes
			this.redraw();
		},

		'setItemRenderer' : function(renderer){
			this._itemRenderer = isString(renderer) ? window[renderer] : renderer;
		}
	}
);
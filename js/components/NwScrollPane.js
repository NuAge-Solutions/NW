OJ.importJs('oj.components.OjComponent');
OJ.importJs('oj.events.OjScrollEvent');

OJ.importCss('nw.components.NwScrollPane');


'use strict';

OJ.extendComponent(
	OjComponent, 'NwScrollPane',
	OJ.implementInterface(
		OjICollection,
		{
			'_props_' : {
				'items' : null
			},


			'_constructor' : function(){
				this._super('NwScrollPane', '_constructor', []);

				// setup the elm function overrides
				this._elm_funcs = {
					'addElm'        : 'addItem',
					'addElmAt'      : 'addItemAt',
					'getElmAt'      : 'getItemAt',
					'getElms'       : 'getItems',
					'hasElm'        : 'hasItem',
					'indexOfElm'    : 'indexOfItem',
					'moveElm'       : 'moveItem',
					'numElms'       : 'numItems',
					'removeAllElms' : 'removeAllItems',
					'removeElm'     : 'removeItem',
					'removeElmAt'   : 'removeItemAt',
					'replaceElm'    : 'replaceItem',
					'replaceElmAt'  : 'replaceItemAt'
				};

				this._dims = [];

				this.addEventListener(OjScrollEvent.SCROLL, this, '_onScroll');
			},


			'_recalculateLayout' : function(i){
				var ln = this.numElms(),
					w = this.getInnerWidth(),
					h = this.getInnerHeight(),
					x = 0,
					y = 0,
					prev, elm, elm_w, elm_h, ln2;

				// if we don't have a width or height no point in calculating anything
				if(!w || !h){
					return;
				}

				for(; i < ln; i++){
					if(i > 0){
						prev = this._dims[i - 1];

						x = prev.right;
						y = prev.bottom;
					}

					elm = this.getElmAt(i);
					elm_w = elm.getWidth();
					elm_h = elm.getHeight();

					// check to see if we need to newline it
					if(elm_w + x > w){
						x = 0;

						ln2 = i - 1;

						for(; ln2--;){
							if(this._dims[ln2].left == 0){
								y = this._dims[ln2].bottom
							}
						}
					}

					this._dims[i] = OJ.makeRect(x, y, elm_w, elm_h);
				}
			},

			'_onDomScrollEvent' : function(evt){
				var proxy = OjElement.byId(this.ojProxy);

				if(proxy && proxy._processEvent(evt)){
					proxy._onEvent(OjScrollEvent.convertDomEvent(evt));
				}
			},

			'_onScroll' : function(evt){

			},


			'addEventListener' : function(type){
				this._super('NwScrollPane', 'addEventListener', arguments);

				// mouse events
				if(type == OjScrollEvent.SCROLL){
					this._proxy.onscroll = this._onDomScrollEvent;
				}
			},

			'redraw' : function(){
				if(this._super('NwScrollPane', 'redraw', arguments)){
					this._recalculateLayout(0);

					return true;
				}

				return false;
			},

			'_prepareItems' : function(){
				if(this._items){
					return;
				}

				var items = (this._items = new OjCollection());

				items.addEventListener(OjCollectionEvent.ITEM_ADD, this, '_onItemChange');
				items.addEventListener(OjCollectionEvent.ITEM_MOVE, this, '_onItemChange');
				items.addEventListener(OjCollectionEvent.ITEM_REMOVE, this, '_onItemChange');
				items.addEventListener(OjCollectionEvent.ITEM_REPLACE, this, '_onItemChange');

				return items;
			},

			// Event Handler Functions
			'_onItemChange' : function(evt){
				OJ.render(this.getElmAt(evt.getIndex()));

				this._recalculateLayout(evt.getIndex());
			}
		}
	),
	{
		'_TAGS' : ['scrollpane']
	}
);
OJ.importJs('nw.layouts.NwColumnLayout');
OJ.importJs('oj.components.OjCollectionComponent');
OJ.importJs('oj.data.OjRect');
OJ.importJs('oj.events.OjScrollEvent');

OJ.importCss('nw.components.NwScrollPane');


'use strict';

OJ.extendComponent(
	'NwScrollPane', [OjView],
	OJ.implementInterface(
		OjICollectionComponent,
		{
			'_props_' : {
				'layout'      : null,
				'allowScroll' : 'both' // NwScrollPane.BOTH
			},

			'_custom_scroll' : OJ.isTouchCapable() && (OJ.isMobile() || OJ.isTablet()),

			'_multiplier' : 2,  '_lastScroll' : 0,

//			'_scrollPosX' : 0,  '_scrollPosX' : 0


			'_constructor' : function(/*layout=new NwColumnLayout(1)*/){
				var args = arguments;

//				if(this._custom_scroll){
//					this._template = 'nw.components.NwScrollPane';
//				}

				this._super(OjView, '_constructor', []);

				// run the collection component setup
				this._setup();

				// figure out what events to listen for
//				if(this._custom_scroll){
////					this.addEventListener(OjDragEvent.START, this, '_onPaneScrollStart');
////					this.addEventListener(OjDragEvent.DRAG, this, '_onPaneScrollMove');
//					this.addEventListener(OjDragEvent.END, this, '_onPaneScrollEnd');
//				}
//				else{
					this.addEventListener(OjScrollEvent.SCROLL, this, '_onPaneScroll');
//				}

				// setup the elm function overrides
				this._dims = [];

				this.setLayout(args.length ? args[0] : new NwColumnLayout());

				if(OJ.isMobile()){
					this._multiplier = 4;
				}
			},

			'_destructor' : function(){
				// run the collection component teardown
				this._teardown();

				this._super(OjView, '_destructor', arguments);
			},


			'_canScrollX' : function(){
				return this._allowScroll == this._static.X || this._allowScroll == this._static.BOTH;
			},

			'_canScrollY' : function(){
				return this._allowScroll == this._static.Y || this._allowScroll == this._static.BOTH;
			},


			'_onPaneScroll' : function(evt){
				var now = (new Date()).getTime();

				if(now - this._lastScroll > 5){
					this._lastScroll = now;

					this.redraw();
				}
			},

			'_onPaneScrollStart' : function(evt){
//				this._scrollX = this.content.getX();
//				this._scrollY = this.content.getY();
			},

			'_onPaneScrollMove' : function(evt){
//				var max_x = this._canScrollX() ? this.getWidth() - this.content.getWidth() : 0,
//					max_y = this._canScrollY() ? this.getHeight() - this.content.getHeight() : 0;
//				trace(this._scrollY + evt.getDeltaY(), this.getHeight(), this.content.getHeight());
//				this.content.setX(Math.max(Math.min(this._scrollX + evt.getDeltaX(), 0), max_x));
//				this.content.setY(Math.max(Math.min(this._scrollY + evt.getDeltaY(), 0), max_y));
//
//				this.redraw();
			},

			'_onPaneScrollEnd' : function(evt){
				trace(evt);
			},


			'addEventListener' : function(type, target, func){
				this._super(OjView, 'addEventListener', arguments);

				this._addItemListener(type);
			},

			'removeEventListener' : function(type, target, func){
				this._super(OjView, 'removeEventListener', arguments);

				this._removeItemListener(type);
			},

			'redraw' : function(){
				if(this._super(OjView, 'redraw', arguments)){
					// redraw the visible items
					var container = this.container,
						y = this.getScrollY(), h = this.getHeight(),
						visible = this._layout.getVisible(
							new OjRect(
								this.getScrollX() - container.getX(), y - container.getY(),
								this.getWidth() * this._multiplier, h * this._multiplier
							)
						),
						ln = container.numChildren(),
						i;

					// figure which of the existing will stay and go
					for(; ln--;){
						if((i = visible.indexOf(this.indexOfElm(container.getChildAt(ln)))) == -1){
							container.removeChildAt(ln);
						}
						else{
							visible.splice(i, 1);
						}
					}

					// add all the new items
					ln = visible.length;

					for(; ln--;){
						container.addChild(this.renderItemAt(visible[ln]));
					}

					// check to see if the footer is visible
					// note: footer needs to be first since we recycle the h var for header
					if(this.footer){
						if(y + h < this.footer.getY()){
							if(this._footer.parent()){

							}
						}
						else{
							this.footer.addChild(this._footer);
							this.footer.setHeight(OjStyleElement.AUTO);
						}
					}

					// check to see if the header is visible
					if(this.header){
						if(y > (h = this.header.getHeight())){
							if(this._header.parent()){
								this.header.setHeight(h);
								this.header.removeAllChildren();
							}
						}
						else{
							this.header.addChild(this._header);
							this.header.setHeight(OjStyleElement.AUTO);
						}
					}

					return true;
				}

				return false;
			},


			// Event Handler Functions
			'_onItemAdd' : function(evt){
				this._super(OjView, '_onItemAdd', arguments);

				this._onItemChange(evt);
			},

			'_onItemChange' : function(evt){
				this._layout.recalculateLayout(evt.getIndex());

				this.container.setHeight(this._layout.getItemRectAt(this.numElms() - 1).getBottom());

				this.redraw();
			},

			'_onItemMove' : function(evt){
				this._super(OjView, '_onItemMove', arguments);

				this._onItemChange(evt);
			},

			'_onItemRemove' : function(evt){
				this._super(OjView, '_onItemRemove', arguments);

				this._onItemChange(evt);
			},

			'_onItemReplace' : function(evt){
				this._super(OjView, '_onItemReplace', arguments);

				this._onItemChange(evt);
			},


			// getter & setter functions
			'setLayout' : function(val){
				if(this._layout == val){
					return;
				}

				(this._layout = val).setTarget(this);
			}
			//,

//			'getScrollX' : function(){
//				return this._custom_scroll ? this.content.getX() * -1 : this._super(OjView, 'getScrollX', arguments);
//			},
//			'setScrollX' : function(val){
//				if(this._custom_scroll){
//					return this.content.setX(-1 * val);
//				}
//
//				this._super(OjView, 'setScrollX', arguments);
//			},
//
//			'getScrollY' : function(){
//				return this._custom_scroll ? this.content.getY() * -1 : this._super(OjView, 'getScrollY', arguments);
//			},
//			'setScrollY' : function(val){
//				if(this._custom_scroll){
//					return this.content.setY(-1 * val);
//				}
//
//				this._super(OjView, 'setScrollY', arguments);
//			}
		}
	),
	{
		'_TAGS' : ['scrollpane'],

		'BOTH' : 'x',
		'X'    : 'x',
		'Y'    : 'y'
	}
);
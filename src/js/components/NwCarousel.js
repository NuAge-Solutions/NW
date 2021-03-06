OJ.importJs('nw.components.NwMarquee');
OJ.importJs('oj.fx.OjTween');

OJ.importCss('nw.components.NwCarousel');


'use strict';

OJ.extendClass(
	'NwCarousel', [NwMarquee],
	{
		'_props_' : {
			'viewSize' : 50
		},

		'_allow_loop' : false,  '_current_pos' : 0,  '_index' : null,

		'_offset' : 0,  '_tween' : null,  '_view_offset' : 0,  '_visable_size' : 0,


		'_constructor' : function(/*data, item_renderer*/){
			this._index = {};

			this._super(NwMarquee, '_constructor', arguments);
		},


		'_redrawPosition' : function(pos){
			if(!this._collection){
				return;
			}

			// get all the vars/values needed to make this happen
			var i, index, x, view, start, stop,
				offset = this._offset + this._view_offset,
				max = this._collection.length, elms = this.container.children;

			// calculate which views to show and where they view goes
			if(pos < 0){
				start = Math.ceil((pos - offset) / this._viewSize);
				stop = Math.ceil((pos + offset) / this._viewSize);
			}
			else{
				start = Math.signedCeil((pos - offset) / this._viewSize);
				stop = Math.signedCeil((pos + offset) / this._viewSize);
			}

			for(i = start; i < stop; i++){
				if(i < 0){
					if(this._allow_loop){
						x = i * this._viewSize;

						index = (max - 1) + (i % max);
					}
					else{
						index = 0;

						x = 0;
					}
				}
				else if(i < max){
					x = (index = i) * this._viewSize;
				}
				else{
					if(this._allow_loop){
						index = i % max;
					}
					else{
						index = max - 1;
					}

					x = i * this._viewSize;
				}

				if(view = this[index]){
					view.x = x + this._offset - this._view_offset - pos;
					view.width = this._viewSize;

					if(this.container.hasChild(view)){
                        elms.remove(view);
					}
					else{
						view.addEventListener(OjUiEvent.PRESS, this, '_onViewClick');

						this.container.addChild(view);
					}

					// store the index
					this._index[view.id] = i;
				}
			}

			// remove any old views
			i = elms.length;

			while(i--){
				elms[i].removeEventListener(OjUiEvent.PRESS, this, '_onViewClick');

				this.container.removeChild(elms[i]);
			}

			// set the new position as current
			this._current_pos = pos;
		},


		'redraw' : function (){
			if(this._super(NwMarquee, 'redraw', arguments)){
				this._visable_size = this.container.width;

				this._offset = this._visable_size / 2;

				this._view_offset = this._viewSize / 2;

				this._allow_loop = this._visable_size < this.numElms() * this._viewSize;

				this._redrawPosition(this._current_pos);

				return true;
			}

			return false;
		},


		'_onTweenTick' : function(evt){
			this._redrawPosition(evt.value);
		},

		'_onViewClick' : function(evt){
			this.activeIndex = this._index[evt.currentTarget.id];
		},


		'=activeIndex' : function(val){
			var w, h, direction;

			if(this._activeIndex == val && this._active){
				return;
			}

			// if we don't have an active then no need to animate
			if(!this._active){
				this._activeIndex = val;
				this._active = this.getElmAt(val);

				this._redrawPosition(val * this._viewSize);

				return;
			}

			var total = this.numElms;

			// setup the animation here
			this._tween = new OjTween(this._current_pos, (this._current_index = val) * this._viewSize, 300, OjEasing.OUT);

			this._tween.addEventListener(OjTweenEvent.TICK, this, '_onTweenTick');

			val = val % total;

			// set the active
			if(val < 0){
				val = total + val;
			}

			this._activeIndex = val;

			if(this._active = this.getElmAt(val)){
				// start the animation
				this._tween.start();
			}
			else{
				this._activeIndex = -1;
			}
		}
	}
);
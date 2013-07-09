OJ.importJs('nw.layouts.NwLayout');


'use strict';

OJ.extendClass(
	NwLayout, 'NwColumnLayout',
	{
		'_props_' : {
			'numCols' : 1
		},

		// '_col_widths' : null


		'_constructor' : function(/*num_cols = 1*/){
			this._super('NwColumnLayout', '_constructor', []);

			this._col_widths = [0];

			var args = arguments;

			if(args.length){
				this.setNumCols(args[0]);
			}
		},


		'_recalculateLayoutItem' : function(index, item){
			var layout = this._super('NwColumnLayout', '_recalculateLayoutItem', arguments),
				x, y;

			// detect if this is the first item
			if(!index){
				// if it is then its at (0, 0)
				x = y = 0;
			}
			else{
				var col = index % this._numCols,
					w = !this._col_widths[col] || index < this._numCols ? item.getWidth() : this._col_widths[col],
					prev = index < this._numCols ? null : this._layouts[index - this._numCols];

				// store the col width
				this._col_widths[col] = w;

				// calculate the x and y
				x = (col * w) + (col  * this._hSpacing);
				y = prev ? prev.getBottom() + this._vSpacing : 0;
			}

			// set the x and y for the item
			layout.setLeft(x);
			layout.setTop(y);

			return layout;
		},


		'setNumCols' : function(val){
			val = Math.max(val, 0);

			if(this._numCols == val){
				return;
			}

			this._numCols = val;

			this._col_widths = [];

			for(; val--;){
				this._col_widths.push(0);
			}

			this.recalculateLayout(0);
		}
	}
);
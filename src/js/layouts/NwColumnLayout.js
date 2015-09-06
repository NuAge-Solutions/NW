OJ.importJs('nw.layouts.NwLayout');


'use strict';

OJ.extendClass(
	'NwColumnLayout', [NwLayout],
	{
		'_props_' : {
			'numCols' : 1
		},

		// '_col_widths' : null


		'_constructor' : function(/*num_cols = 1*/){
			this._super(NwLayout, '_constructor', []);

			this._col_widths = [0];

			var args = arguments;

			if(args.length){
				this.numCols = args[0];
			}
		},


		'_recalculateLayoutItem' : function(index, item){
			var layout = this._super(NwLayout, '_recalculateLayoutItem', arguments),
				x, y;

			// detect if this is the first item
			if(!index){
				// if it is then its at (0, 0)
				x = y = 0;
			}
			else{
				var col = index % this._numCols,
					w = !this._col_widths[col] || index < this._numCols ? item.width : this._col_widths[col],
					prev = index < this._numCols ? null : this._layouts[index - this._numCols];

				// store the col width
				this._col_widths[col] = w;

				// calculate the x and y
				x = (col * w) + (col  * this._hSpacing);
				y = prev ? prev.bottom + this._vSpacing : 0;
			}

			// set the x and y for the item
			layout.left = x;
			layout.top = y;

			return layout;
		},


		'=numCols' : function(val){
			val = Math.max(val, 0);

			if(this._numCols == val){
				return;
			}

			this._numCols = val;

			this._col_widths = [];

			for(; val--;){
				this._col_widths.append(0);
			}

			this.recalculateLayout(0);
		}
	}
);
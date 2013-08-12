OJ.importJs('oj.data.OjRect');
OJ.importJs('oj.events.OjActionable');


'use strict';

OJ.extendClass(
	'NwLayout', [OjActionable],
	{
		'_props_' : {
			'hSpacing' : 0,
			'target'   : null,
			'vSpacing' : 0
		},

		// '_layouts' : null,


		'_constructor' : function(){
			this._super(OjActionable, '_constructor', []);

			this._layouts = {};
		},


		'_recalculateLayoutItem' : function(index, item){
			if(this._layouts[index]){
				return this._layouts[index];
			}

			return this._layouts[index] = item.getRect();
		},


		'recalculateLayout' : function(index){
			if(!this._target){
				return;
			}

			var i = index, elm, layout, rendered = false,
				ln = this._target.numElms();

			for(; i < ln; i++){
				elm = this._target.renderItemAt(i);
				rendered = !elm.parent();

				if(rendered){
					OJ.render(elm);
				}

				layout = this._recalculateLayoutItem(i, elm);

				if(rendered){
					elm.parent(null);
				}

				elm.setX(layout.getLeft());
				elm.setY(layout.getTop());
			}
		},

		'getVisible' : function(rect){
			var ln = this._target.numElms(),
				visible = [];

			for(; ln--;){
				if(rect.hitTestRect(this._layouts[ln])){
					visible.push(ln)
				}
			}

			return visible;
		},


		'getItemRectAt' : function(index){
			return this._layouts[index];
		},

		'setTarget' : function(val){
			if(this._target == val){
				return;
			}

			this._target = val;

			this.recalculateLayout(0);
		}
	}
);


window.NwILayoutable = {

};
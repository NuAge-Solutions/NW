OJ.importJs('nw.nav.NwNavController');


'use strict';

OJ.extendClass(
	NwNavController, 'NwTabNavController',
	{
		'_getDefaultRoute' : function(){
			return this._routing.getItemAt(0);
		},

		'_load' : function(path, route){
			if(this._active_index > -1){
				this.getElmAt(this._active_index).setIsActive(false);
			}

			this._super('NwTabNavController', '_load', arguments);

			this.getElmAt(
				this._active_index = this._routing.indexOfItem(this._active)
			).setIsActive(true);
		},

		'_refreshStack' : function(){
			var ln = this.numElms(), ln2 = this._routing.numItems(), diff = ln - ln2, btn, route;

			for(; ln--;){
				if(ln >= ln2){
					this.removeElmAt(ln);

					continue;
				}

				route = this._routing.getItemAt(ln);

				if(route == this._active){
					this._active_index = ln;
				}

				btn = this.getElmAt(ln);
				btn.setIcon(route.getIcon());
				btn.setLabel(route.getTitle());
				btn.setWidth((1 / ln2) * 100, '%');
				btn.setIsActive(route == this._active);
			}

			if(diff < 0){
				for(; diff++;){
					route = this._routing.getItemAt((ln2 - 1) + diff);

					this.addElm(btn = new OjButton(route.getTitle(), route.getIcon()));

					btn.setWidth((1 / ln2) * 100, '%');
					btn.addEventListener(OjMouseEvent.CLICK, this, '_onTabClick');
				}
			}

			this._super('NwTabNavController', '_refreshStack', arguments);
		},


		'_onTabClick' : function(evt){
			var route = this._routing.getItemAt(this.indexOfElm(evt.getCurrentTarget()));

			this.loadRoute(route);
		},


		'loadRoute' : function(route/*, args*/){
			if(route == this._routing){
				arguments[0] = this._getDefaultRoute();
			}

			if(arguments[0]){
				this._super('NwTabNavController', 'loadRoute', arguments);
			}
		}
	}
);
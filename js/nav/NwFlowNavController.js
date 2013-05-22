OJ.importJs('nw.nav.NwNavController');

OJ.importCss('oj.nav.OjFlowNavController');


'use strict';

OJ.extendClass(
	NwNavController, 'NwFlowNavController',
	OJ.implementInterface(
		OjIFlowNavController,
		{
			'_history' : null,


			'_constructor' : function(/*stack, routing*/){
				this._history = [];


				this._super('NwFlowNavController', '_constructor', arguments);
			},


			'_load' : function(path, route){
				var index = this._history.indexOf(path);

				if(index == -1){
					this._history.push(path);
				}
				else{
					this._history = this._history.slice(0, index + 1);
				}

				return this._super('NwFlowNavController', '_load', arguments);
			},


			'back' : function(){
				this._super('NwFlowNavController', 'back', arguments);

				var ln = this._history.length;

				if(ln > 1){
					this.loadPath(this._history[ln - 2]);
				}
			}
//			,
//
//
//			'loadPathAt' : function(path, index){
//
//			},
//
//			'loadRouteAt' : function(route, index/*, args*/){
//				this.loadPathAt(route.pathWithArguments(arguments.length > 2 ? arguments[2] : []), index);
//			}
		}
	)
);
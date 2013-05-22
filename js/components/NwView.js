OJ.importJs('oj.nav.OjView');


'use strict';

OJ.extendClass(
	OjView, 'NwView',{
		'_constructor' : function(/*data*/){
			this._super('NwView', '_constructor', []);

			if(arguments.length){
				this.setData(arguments[0])
			}
		}
	}
);
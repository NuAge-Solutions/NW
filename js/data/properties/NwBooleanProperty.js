OJ.importJs('nw.data.properties.NwProperty');


'use strict';

OJ.extendClass(
	NwProperty, 'NwBooleanProperty',
	{
		'_exportValue' : function(value, old_value, mode){
			return value ? 1 : 0;
		},

		'_processValue' : function(value, old_value, mode){
			return isTrue(value);
		}
	}
);
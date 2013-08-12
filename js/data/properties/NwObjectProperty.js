OJ.importJs('nw.data.properties.NwProperty');


'use strict';

OJ.extendClass(
	'NwObjectProperty', [NwProperty],
	{
		'_props_' : {
			'flatten'   : false,
			'namespace' : null
		}
	}
);
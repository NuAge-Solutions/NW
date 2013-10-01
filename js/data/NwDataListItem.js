OJ.importJs('oj.renderers.OjListItem');


'use strict';

OJ.extendClass(
	'NwDataListItem', [OjListItem],
	{
		'_redrawData' : function(){
			this.content.setText(this._data.title());
		}
	}
);
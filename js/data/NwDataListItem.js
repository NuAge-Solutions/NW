OJ.importJs('oj.list.OjListItem');


'use strict';

OJ.extendClass(
	OjListItem, 'NwDataListItem',
	{
		'_redrawData' : function(){
			this.content.setText(this._data.title());
		}
	}
);
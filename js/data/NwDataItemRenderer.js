OJ.importJs('oj.components.OjItemRenderer');


'use strict';

OJ.extendClass(
	OjItemRenderer, 'NwDataItemRenderer',
	{
		'_onDataChange' : function(evt){
			this._redrawData();
		},


		'setData' : function(data){
			if(this._data){
				this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}

			this._super('NwDataItemRenderer', 'setData', arguments);

			if(this._data){
				this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}
		}
	}
);
OJ.importJs('oj.renderers.OjItemRenderer');


'use strict';

OJ.extendClass(
	'NwDataItemRenderer', [OjItemRenderer],
	{
		'_onDataChange' : function(evt){
			this._redrawData();
		},


		'setData' : function(data){
			if(this._data){
				this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}

			this._super(OjItemRenderer, 'setData', arguments);

			if(this._data){
				this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}
		}
	}
);
OJ.extendClass(
	'NwDataItemRenderer', [OjItemRenderer],
	{
		'_onDataChange' : function(evt){
			this._redrawData();
		},

        '_redrawData' : function(){
            if(this._super(OjItemRenderer, '_redrawData', arguments)){
                this.text = this._data ? this._data.title() : '';

                return true;
            }

            return false;
        },


		'=data' : function(data){
			if(this._data){
				this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}

			this._super(OjItemRenderer, '=data', arguments);

			if(this._data){
				this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
			}
		}
	}
);
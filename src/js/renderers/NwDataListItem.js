OJ.extendClass(
	'NwDataListItem', [OjListItem],
	{
        '_destructor' : function(/*depth = 0*/){
            if(this._data && this._data.is && this._data.is('NwData')){
                this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }

            return this._super(OjListItem, '_destructor', arguments);
        },

		'_redrawData' : function(){
            if(this._super(OjListItem, '_redrawData', arguments)){ // we are intentionally skipping OjListItem super
                var txt, icon;

                if(this._data){
                    txt = this._data.title();
                    icon = this._data.icon();
                }

                this.content.text = txt;
                this.icon.source = icon;

                return true;
            }

            return false;
		},

        '=data' : function(val){
            if(this._data && this._data.is && this._data.is('NwData')){
                this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }

            this._super(OjListItem, '=data', arguments);

            if(this._data && this._data.is && this._data.is('NwData')){
                this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }
        }
	}
);
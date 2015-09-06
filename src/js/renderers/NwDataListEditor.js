OJ.importCss('nw.renderers.NwDataEditor');


OJ.extendComponent(
	'NwDataListEditor', [OjItemEditor],
	{
        '_template' : 'nw.renderers.NwDataListEditor',


        '_onDataChange' : function(evt){
            if(this._item){
                this._item.redraw();
            }
        },

        '_onViewPress' : function(evt){
            var cntlr = this._group.controller;

            if(cntlr){
                cntlr.addView(this._data.makeView());
            }
        },

        '_onEditPress' : function(evt){
            var cntlr = this._group.controller;

            if(cntlr){
                cntlr.addView(this._data.makeForm());
            }
        },

        '=data' : function(data){
            if(this._data == data){
                return;
            }

            // cleanup data change listener
            if(this._data){
                this._data.removeEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }

            // set data
            this._super(OjItemEditor, '=data', arguments);

            // add data change listener
            if(this._data){
                this._data.addEventListener(NwDataEvent.CHANGE, this, '_onDataChange');
            }
        },

        '.item_renderer' : function(){
            return this._data ? this._data.oj_class.ITEM_RENDERER : this._item_renderer;
        }
	}
);
OJ.importJs('nw.form.NwDataInput');
OJ.importJs('nw.views.NwSelectDataView');

//OJ.importCss('nw.form.NwDataInput');


OJ.extendClass(
	'NwSelectDataForm', [OjForm, NwISelectDataView],
    {
        '_props_' : {
            'property' : null
        },

        '_template' : 'nw.form.NwSelectDataForm',


        '_constructor' : function(){
            return this._selectConstructor(OjForm, arguments);
        },


        '_listeners' : function(type){
            return this._selectListeners(OjForm, arguments);
		},


        '_onSearchSuccess' : function(evt){
            this._super(NwISelectDataView, '_onSearchSuccess', arguments);

            this.selector.value = this._data;
		},


        'load' : function(){
            return this._selectLoad(OjForm, arguments);
        },


        '=class' : function(val){
            if(this._class == val){
                return;
            }

            this._class = val;

            this.selector.item_renderer = this._class.ITEM_RENDERER;
        },

        '.data' : function(){
            return this.selector.value;
        },

        '=data' : function(val){
            this.selector.value = this._data = val;
        },

        '=property' : function(val){
            if(this._property == val){
                return;
            }

            this._property = val;

            this.selector.selectionMin = this._property.min;
            this.selector.selectionMax = this._property.max;
        }
    }
);
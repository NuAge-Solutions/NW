OJ.importJs('nw.data.properties.NwProperty');


OJ.extendClass(
    'NwOptionProperty', [NwProperty],
    {
        '_props_' : {
            'options' : null
        },


        '_constructor' : function(options /*, properties*/){
            var args = arguments;

            this._super(NwTextProperty, '_constructor', args.length > 1 ? [args[1]] : []);

            this.options = options;
        },


        '_valueIsValid' : function(value){
            return this._options && this._options.indexOf(value) > -1;
        },


        'makeInput' : function(dom){
            var self = this,
                dflt = self.defaultValue,
                input = new OjComboBox(self.name, self.label, dflt, self.options);

            input.placeholder = self.placeholder;
            input.required = self.required;

            if(dflt){
                input.value = dflt;
            }

            return input;
        }
    }
);
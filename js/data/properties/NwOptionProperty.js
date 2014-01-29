OJ.importJs('nw.data.properties.NwTextProperty');


OJ.extendClass(
	'NwOptionProperty', [NwTextProperty],
	{
		'_props_' :{
			'options' : null
		},


    '_constructor' : function(options /*, properties*/){
      var args = arguments;

			this._super(NwTextProperty, '_constructor', args.length > 1 ? [args[1]] : []);

			this.setOptions(options);
		},


    '_valueIsValid' : function(value){
			return this._options && this._options.indexOf(value) > -1;
		},


		'makeInput' : function(dom){
      var input = new OjComboBox(this._name, this._label, this._defaultValue, this._options);

			input.setDefault(this._default);
			input.setRequired(this._required);

      if(this._defaultValue){
        input.setValue(this._defaultValue);
      }

			return input;
		}
	}
);
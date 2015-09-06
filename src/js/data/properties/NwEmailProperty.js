OJ.importJs('nw.data.properties.NwTextProperty');


OJ.extendClass(
	'NwEmailProperty', [NwTextProperty],
	{
		'_props_' :{
			'maxLength' : 254,
			'minLength' : 3,
            'unique' : true
		},


		'makeInput' : function(dom){
			var input = new OjEmailInput(this.name, this.label, this.defaultValue);

			input.placeholder = this.placeholder;
			input.required = this.required;

			return input;
		},


		'=maxLength' : function(val){
			throw 'Cannot set the max length of an email. This is a fixed value.';
		},

		'=minLength' : function(val){
			throw 'Cannot set the min length of an email. This is a fixed value.';
		}
	}
);
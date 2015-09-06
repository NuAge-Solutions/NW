OJ.importJs('nw.data.properties.NwTextProperty');


OJ.extendClass(
	'NwTokenProperty', [NwTextProperty],
	{
//		'_props_' :{
//			'maxLength' : 254,
//			'minLength' : 3
//		},


		'makeInput' : function(dom){
			var self = this,
                input = new OjEmailInput(self.name, self.label, self.defaultValue);

			input.placeholder = self.placeholder;
			input.required = self.required;

			return input;
		}
	}
);
OJ.importJs('nw.data.properties.NwTextProperty');


'use strict';

OJ.extendClass(
	NwTextProperty, 'NwEmailProperty',
	{
		'_props_' :{
			'maxLength' : 254,
			'minLength' : 3
		},


		'makeInput' : function(dom){
			OJ.importJs('oj.form.OjEmailInput');

			var input = new OjEmailInput(this._name, this._label, this._defaultValue);

			input.setDefault(this._default);
			input.setRequired(this._required);

			return input;
		},


		'setMaxLength' : function(val){
			throw new Error('Cannot set the max length of an email. This is a fixed value.');
		},

		'setMinLength' : function(val){
			throw new Error('Cannot set the min length of an email. This is a fixed value.');
		}
	}
);
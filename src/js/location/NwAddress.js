OJ.importJs('nw.data.NwData');


'use strict';

OJ.extendClass(
	'NwAddress', [NwData],
	{

	},
	{
		'DEFINITION' : OJ.merge({
			'street'   : new NwTextProperty({
				'default' : 'Address',
				'required' : true
			}),
			'locality'       : new NwTextProperty({
				'default' : 'City',
				'required' : true
			}),
			'region'      : new NwTextProperty({
				'default' : 'State',
				'required' : true
			}),
			'code' : new NwTextProperty({
				'default' : 'Zip',
				'required' : true
			}),
			'country'    : new NwTextProperty({
				'default' : 'Country'
			})
		}, NwData.DEFINITION),

		'TYPE' : 'Address'
	}
);
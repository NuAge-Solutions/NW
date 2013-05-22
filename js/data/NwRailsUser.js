OJ.importJs('nw.data.NwRailsData');
OJ.importJs('nw.data.NwUser');


'use strict';

OJ.extendClass(
	NwRailsData, 'NwRailsUser',
	OJ.implementInterface(
		NwIUser,
		{}
	),
	{
		'DEFINITION' : OJ.merge(
			{},
			NwUser.DEFINITION,
			NwRailsData.DEFINITION
		),

		'TYPE' : 'User'
	}
);
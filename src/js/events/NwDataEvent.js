OJ.extendClass(
	'NwDataEvent', [OjEvent],
	{
		'_get_props_' : {
			'data'    : null,
			'oldData' : null
		},


		'_constructor' : function(type/*, data = null, old_data = null, bubbles = false, cancelable = false*/){
			var cancelable, bubbles = cancelable = false, ln = arguments.length;

			if(ln > 1){
				this._data = arguments[1];

				if(ln > 2){
					this._oldData = arguments[2];

					if(ln > 3){
						bubbles = arguments[3];

						if(ln > 4){
							cancelable = arguments[4];
						}
					}
				}
			}

			this._super(OjEvent, '_constructor', [type, bubbles, cancelable]);
		}
	},
	{
		'CHANGE'      : 'onDataChange',
		'DELETE'      : 'onDataDelete',
		'LOAD'        : 'onDataLoad',
		'SAVE'        : 'onDataSave'
	}
);
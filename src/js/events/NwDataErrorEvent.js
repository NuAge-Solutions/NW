OJ.extendClass(
	'NwDataErrorEvent', [OjErrorEvent],
	{
		'_get_props_' : {
			'data'    : null
		},


		'_constructor' : function(type/*, data, text = null, code = 0, bubbles = false, cancelable = false*/){
			var args = Array.array(arguments),
				ln = args.length;

			if(ln > 1){
				this._data = args[1];

				args.removeAt(1);
			}

			this._super(OjErrorEvent, '_constructor', args);
		}
	},
	{
		'DELETE' : 'onDataDeleteError',
		'LOAD'   : 'onDataLoadError',
		'SAVE'   : 'onDataSaveError'
	}
);
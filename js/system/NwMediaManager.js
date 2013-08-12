OJ.importJs('oj.events.OjActionable');


OJ.extendManager(
	'MediaManager', 'NwMediaManager', [OjActionable],
	{
		'mediaPicker' : function(){

		},

		'photoPicker' : function(){
			if(!NW.isNative()){
				return false;
			}

			NW.comm('photoLibrary', ['show']).load()

			return true;
		}
	}
);
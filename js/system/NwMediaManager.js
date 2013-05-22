OJ.importJs('oj.events.OjActionable');


'use strict';

OJ.extendManager(
	'MediaManager', OjActionable, 'NwMediaManager',
	{
		'IMAGE_PICK' : 'onImagePick',

		'_callback' : null,  '_selected' : null,


		'_constructor' : function(){
			this._super('NwMediaManager', '_constructor', arguments);

			NW.addEventListener(this.IMAGE_PICK, this, '_onImagePick');
		},


		'_onImagePick' : function(evt){
			this._callback(this._selected = evt.getData());
		},


		'hide' : function(){
			NW.comm('hideMediaPicker', ['hide']).load();
		},

		'showCamera' : function(callback){
			this._callback = callback;

			NW.comm('camera', ['show']).load();
		},

		'showPhotoLibrary' : function(callback){
			this._callback = callback;

			NW.comm('photoLibrary', ['show']).load();
		}
	}
);
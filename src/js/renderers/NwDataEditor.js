OJ.importJs('nw.renderers.NwDataListEditor');

OJ.importCss('nw.renderers.NwDataEditor');


OJ.extendComponent(
	'NwDataEditor', [NwDataListEditor],
	{
        '_onViewPress' : function(evt){
            evt.cancel();
        },

        '_onEditPress' : function(evt){
            evt.cancel();
        },

        '_onDeleteConfirm' : function(evt){
            if(evt.buttonIndex){
                this._data.del();
            }
        },

        '_onDeletePress' : function(evt){
            evt.cancel();

            var alrt = WindowManager.alert(
                OJ.tokenReplace('Are you sure you want to delete "[%title]"?', 'title', this._data.title()),
                'Confirm Delete', ['Yes'], 'No'
            );

            alrt.addEventListener(OjAlertEvent.BUTTON_PRESS, this, '_onDeleteConfirm');
        }
	}
);
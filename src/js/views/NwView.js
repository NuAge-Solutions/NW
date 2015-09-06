OJ.extendComponent(
    'NwView', [OjView], {

        '_hideOverlay' : function(){
            AppManager.hideLoading(this._overlay);
        },

        '_showOverlay' : function(msg){
            return this._overlay = AppManager.showLoading(msg);
        }
    },
    {
        '_TAGS' : ['view', 'nw-view']
    }
);
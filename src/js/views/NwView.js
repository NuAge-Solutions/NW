OJ.extendComponent(
    'NwView', [OjView], {

        '_hideOverlay' : function(){
            AppManager.hideLoading(this._overlay);

            this._overlay = null;
        },

        '_showOverlay' : function(msg){
            return this._overlay = AppManager.showLoading(msg);
        }
    },
    {
        '_TAGS' : ['view']  // override oj view tag
    }
);
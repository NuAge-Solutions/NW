OJ.extendComponent(
    'NwFlowNavController', [OjFlowNavController], {
        '_makeBackButton' : function(){
            var btn = this._super(OjFlowNavController, '_makeBackButton', arguments);
            btn.icon = new NwIcon('fa-chevron-left fa-lg');

            return btn;
        }
    },
    {
        '_TAGS' : ['flow-nav', 'flow-nav-controller']
    }
);
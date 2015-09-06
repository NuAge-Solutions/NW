OJ.importJs('nw.media.NwIcon');
OJ.importJs('nw.nav.NwFlowNavController');


OJ.extendClass(
    'NwModal', [OjModal], {
        '_constructor' : function(){
            var self = this;

            self._super(OjModal, '_constructor', arguments);

            self.bar.cancel_label = null;
            self.bar.cancel_icon = new NwIcon('fa-times', 'fa-2x');
        }
    }
);
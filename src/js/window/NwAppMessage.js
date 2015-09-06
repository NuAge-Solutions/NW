OJ.importCss('nw.window.NwAppMessage');


OJ.extendClass(
    'NwAppMessage', [OjAlert],
    {
        '_props_' : {
            'cancelable' : true,
            'icon' : null
        },


        '_constructor' : function(){
            var self = this;

            self._super(OjAlert, '_constructor', arguments);

            self.addEventListener(OjUiEvent.PRESS, self, '_onPress');
        },


        '_onPress' : function(evt){
            if(this.cancelable){
                this.cancel();
            }
        },


        '=icon' : function(val){
            var self = this,
                icn = self.icn,
                old = self._icon;

            if(old == val){
                return;
            }

            if(old && icn){
                self._icon.removeCss(old);
            }

            if(self._icon = val){
                if(!icn){
                    self.icn = icn = new NwIcon('icn');

                    self.pane.prependChild(icn);
                }

                icn.source = val;
            }
            else {
                self.unset('icn');
            }
        }
    }
);
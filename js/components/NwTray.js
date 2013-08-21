OJ.importJs('oj.components.OjComponent');

OJ.importCss('nw.components.NwTray');


'use strict';

OJ.extendComponent(
  'NwTray', [OjComponent],
  {
    '_template' : 'nw.components.NwTray',


		'_onTrayUp' : function(evt){
			this.hideTray();
		},


    'getPosition' : function(){
      return this.container.getX();
    },

    'hideTray' : function(){
        var amount = this.getWidth() * -.6;

        if(this.tray.getX() == amount){
          return;
        }

        this._startTrayAnim(amount, 0);

        this.container.removeEventListener(OjMouseEvent.CLICK, this, '_onTrayUp');
    },

    'revealTray' : function(val){
        var w = this.getWidth() * .6;

        this.tray.setX(Math.max(Math.min(val - w, 0), -(w)));
        this.container.setX(Math.min(Math.max(val, 0), w));

        this.container.addEventListener(OjMouseEvent.CLICK, this, '_onTrayUp');
    },

    'showTray' : function(){
        if(!this.tray.getX()){
            return;
        }

        this._startTrayAnim(0, this.getWidth() * .6);
    },

    'toggle' : function(/*val*/){
        var args = arguments,
            w = this.getWidth(),
            val = args.length? args[0] : (this.container.getX() ? 0 : w);

        if(val > w * .3){
            this.showTray();
        }
        else{
            this.hideTray();
        }
    }
  },
  {
    '_TAGS' : ['tray']
  }
);
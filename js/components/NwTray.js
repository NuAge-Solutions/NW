OJ.importJs('oj.components.OjComponent');
OJ.importJs('oj.events.OjMouseEvent');
OJ.importJs('oj.events.OjDragEvent');
OJ.importJs('oj.fx.OjEasing');
OJ.importJs('oj.fx.OjMove');

OJ.importCss('nw.components.NwTray');


'use strict';

OJ.extendComponent(
  'NwTray', [OjComponent],
  {
    '_props_' : {
      'actuator' : null,
      'allowSlide' : false
    },

    '_template' : 'nw.components.NwTray',

    // '_tray_anim' : null,


    '_constructor' : function(/*actuator, allowSlide = false unless native and mobile*/){
      this._super(OjComponent, '_constructor', []);

      this._processArguments(arguments, {
        'setActuator' : undefined,
        'setAllowSlide' : OJ.isMobile() && NW.isNative()
      });
    },


    '_startTrayAnim' : function(tray_amount, content_amount){
			var easing = OjEasing.STRONG_OUT,
				  dir = OjMove.X;

			this._stopTrayAnim();

			this._tray_anim = new OjTweenSet(
				new OjMove(this.tray, dir, tray_amount, 250, easing),
				new OjMove(this.container, dir, content_amount, 250, easing)
			);

			this._tray_anim.start();
		},

		'_stopTrayAnim' : function(){
			this._unset('_tray_anim');
		},

    '_updateActuatorListeners' : function(action){
      if(this._actuator){
        this._actuator[action + 'EventListener'](OjMouseEvent.CLICK, this, '_onActuatorClick');
      }
    },

    '_updateContainerListeners' : function(action){
      this.container[action + 'EventListener'](OjMouseEvent.DOWN, this, '_onTrayBlur');
    },

    '_updateDragListeners' : function(action){
      if(this._actuator){
        this._actuator[action + 'EventListener'](OjDragEvent.START, this, '_onActuatorDragStart');
        this._actuator[action + 'EventListener'](OjDragEvent.MOVE, this, '_onActuatorDragMove');
      }
    },


    '_onActuatorClick' : function(evt){
      this.toggleTray();
    },

    '_onActuatorDragMove' : function(evt){

    },

    '_onActuatorDragStart' : function(evt){

    },

		'_onTrayBlur' : function(evt){
			this.hideTray();
		},


    'hideTray' : function(){
        var amount = this.getWidth() * -.6;

        if(this.tray.getX() == amount){
          return;
        }

        this._startTrayAnim(amount, 0);

        this._updateContainerListeners(OjActionable.REMOVE);
    },

    'showTray' : function(){
//        if(!this.tray.getX()){
//            return;
//        }

        this._startTrayAnim(0, this.getWidth() * .6);
    },


    'toggleTray' : function(/*val*/){
        var w = this.getWidth(),
            val = arguments.length? arguments[0] : this.container.getX();

        if(val < w * .3){
            this.showTray();
        }
        else{
            this.hideTray();
        }
    },

    'setActuator' : function(val){
      if(this._actuator ==  val){
        return;
      }

      this._updateActuatorListeners(OjActionable.REMOVE);
      this._updateDragListeners(OjActionable.REMOVE);

      this._actuator = val;

      this._updateActuatorListeners(OjActionable.ADD);

      if(this._allowSlide){
        this._updateDragListeners(OjActionable.ADD);
      }
    },

    'setAllowSlide' : function(val){
      if(this._allowSlide == val){
        return;
      }

      this._updateDragListeners((this._allowSlide = val) ? OjActionable.ADD : OjActionable.REMOVE);
    },

    'getTrayPosition' : function(){
      return this.container.getX();
    },
    'setTrayPosition' : function(val){
      var w = this.getWidth() * .6;

      this.tray.setX(Math.max(Math.min(val - w, 0), -(w)));
      this.container.setX(Math.min(Math.max(val, 0), w));

//      this._updateContainerListeners(OjActionable.ADD);
    }
  },
  {
    '_TAGS' : ['tray']
  }
);
OJ.importCss('nw.components.NwTray');


OJ.extendComponent(
    'NwTray', [OjComponent],
    {
        '_props_' : {
            'actuator' : null,
            'allowSlide' : false,
            'tray' : null
        },

        '_template' : 'nw.components.NwTray',  '_is_open' : false,

        // '_tray_anim' : null,


        '_constructor' : function(/*actuator, allowSlide = false unless native and mobile*/){
            this._super(OjComponent, '_constructor', []);

            this._processArguments(arguments, {
                'actuator' : undefined,
                'allowSlide' : OJ.is_mobile && NW.isNative
            });
        },


        '_startTrayAnim' : function(tray_amount, content_amount){
            var easing = OjEasing.STRONG_OUT,
                dir = OjMove.X;

            this._stopTrayAnim();

            this._tray_anim = new OjTweenSet(
                new OjMove(this.panel, dir, tray_amount, 250, easing),
                new OjMove(this.container, dir, content_amount, 250, easing)
            );
            this._tray_anim.addEventListener(OjTweenEvent.COMPLETE, this, '_onAnimComplete');

            this._tray_anim.start();
        },

        '_stopTrayAnim' : function(){
            this._unset('_tray_anim');
        },

        '_updateActuatorListeners' : function(action){
            if(this._actuator){
                this._actuator[action + 'EventListener'](OjUiEvent.PRESS, this, '_onActuatorClick');
            }
        },

        '_updateContainerListeners' : function(action){
            this.container[action + 'EventListener'](OjUiEvent.DOWN, this, '_onTrayBlur');
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

        '_onAnimComplete' : function(evt){
            this._stopTrayAnim();

            if(this._callback){
                this._callback();

                this._callback = null;
            }
        },

        '_onTrayBlur' : function(evt){
            this.hideTray();
        },


        'hideTray' : function(callback){
            if(!this._is_open){
                if(callback){
                    callback();
                }

                return;
            }

            this._callback = callback;

            this._startTrayAnim(this.width * -.6, 0);

            this._updateContainerListeners(OjActionable.REMOVE);

            this._is_open = false;
        },

        'showTray' : function(callback){
            if(this._is_open){
                if(callback){
                    callback();
                }

                return;
            }

            this._callback = callback;

            var w = this.width * .6;

            this.panel.width = w;
            this.panel.x = -1 * w;

            this._startTrayAnim(0, w);

            this._is_open = true;
        },


        'toggleTray' : function(/*val*/){
            if(this._is_open){
                this.hideTray();
            }
            else{
                this.showTray();
            }
        },

        '=actuator' : function(val){
            if(this._actuator == val){
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

        '=allowSlide' : function(val){
            if(this._allowSlide == val){
                return;
            }

            this._updateDragListeners((this._allowSlide = val) ? OjActionable.ADD : OjActionable.REMOVE);
        },

        '=tray' : function(val){
            this.panel.removeAllChildren();

            if(this._tray = val){
                this.panel.appendChild(val);
            }
        },

        '.trayPosition' : function(){
            return this.container.x;
        },
        '=trayPosition' : function(val){
            var w = this.width * .6;

            this.panel.x = Math.max(Math.min(val - w, 0), -(w));
            this.container.x = Math.min(Math.max(val, 0), w);

//      this._updateContainerListeners(OjActionable.ADD);
        }
    },
    {
        '_TAGS' : ['tray']
    }
);
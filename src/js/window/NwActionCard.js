OJ.importJs('oj.window.OjAlert');

OJ.importCss('nw.window.NwActionCard');


OJ.extendClass(
	'NwActionCard', [OjAlert],
	{
		'_props_' : {
			'actions'       : null,
			'allowMultiple' : false
		},

		'_template' : 'nw.window.NwActionCard',


		'_constructor' : function(/*btns, title, cancel_lbl = "Cancel", destroy_lbl = null*/){
            this._super(OjAlert, '_constructor', []);

            this._processArguments(arguments, {
                'actions' : [],
                'title' : null,
                'cancelLabel' : 'Cancel',
                'destroyLabel' : null
            });
		},

		'_destructor' : function(/*depth = 0*/){
			var args = arguments,
				depth = args.length ? args[0] : 0;

			this._unset(['title', 'actions', 'cancelBtn']);

			return this._super(OjModal, '_destructor', arguments);
		},


		'_onActionItemPress' : function(evt){
			if(!this._allowMultiple){
				this.dispatchEvent(new OjAlertEvent(OjAlertEvent.BUTTON_PRESS, evt.index));

				WindowManager.hide(this);
			}
		},

        '_onDestroyPress' : function(evt){

        },


		'=actions' : function(val){
			var actions = this._actions;

			if(actions == val){
				return;
			}

			if(actions){
				actions.parent = null;

				actions.removeEventListener(OjCollectionEvent.ITEM_PRESS, this, '_onActionItemPress');
			}

			this.actions.insertChild(actions = this._actions = val, this.actions.numChildren() - 1);

			if(actions){
				actions.addEventListener(OjCollectionEvent.ITEM_PRESS, this, '_onActionItemPress');
			}
		},

		'.cancelLabel' : function(){
			return this.cancelBtn.label;
		},
		'=cancelLabel' : function(val){
            this.cancelBtn.label = val;

            if(isEmpty(val)){
                this.cancelBtn.hide();
            }
            else{
                this.cancelBtn.show();
            }
		},

		'.cancelIcon' : function(){
			return this.cancelBtn.icon;
		},
		'=cancelIcon' : function(val){
			this.cancelBtn.icon = val;
		},

        '.destroyLabel' : function(){
			return this.destroyBtn.label;
		},
		'=destroyLabel' : function(val){
            this.destroyBtn.label = val;

			if(isEmpty(val)){
                this.destroyBtn.hide();
            }
            else{
                this.destroyBtn.show();
            }
		},

		'.title' : function(){
			return this.title.text;
		},
		'=title' : function(val){
            if(isEmpty(val)){
                this.title.hide();
            }
            else{
                this.title.label = val;

                this.title.show();
            }
		}
	}
);
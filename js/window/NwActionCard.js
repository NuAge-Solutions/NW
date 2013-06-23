OJ.importJs('oj.window.OjAlert');

OJ.importCss('nw.window.NwActionCard');


"use strict";

OJ.extendClass(
	OjAlert, 'NwActionCard',
	{
		'_props_' : {
			'actions'       : null,
			'allowMultiple' : false
		},

		'_template' : 'nw.window.NwActionCard',


		'_constructor' : function(/*btns, title, cancel_lbl = "Cancel", cancel_icon = null*/){
			var args = arguments,
				ln = args.length;

			this._super('NwActionCard', '_constructor', []);

			// process arguments
			if(ln){
				this.setActions(args[0]);

				if(ln > 1){
					this.setTitle(args[1]);

					if(ln > 2){
						this.setCancelLabel(args[2]);

						if(ln > 3){
							this.setCancelIcon(args[3]);
						}
					}
				}
			}
		},

		'_destructor' : function(/*depth = 0*/){
			var args = arguments,
				depth = args.length ? args[0] : 0;

			this._unset(['title', 'actions', 'cancelBtn']);

			return this._super('OjModal', '_destructor', arguments);
		},


		'_onActionItemClick' : function(evt){
			var alrt = OjAlertEvent;

			if(!this._allowMultiple){
				this.dispatchEvent(new alrt(alrt.BUTTON_CLICK, evt.getIndex()));

				WindowManager.hide(this);
			}
		},


		'setActions' : function(val){
			var actions = this._actions;

			if(actions == val){
				return;
			}

			if(actions){
				actions.setParent(null);

				actions.removeEventListener(OjListEvent.ITEM_CLICK, this, '_onActionItemClick');
			}

			this.pane.addChildAt(actions = this._actions = val, this.pane.numChildren() - 1);

			if(actions){
				actions.addEventListener(OjListEvent.ITEM_CLICK, this, '_onActionItemClick');
			}
		},

		'getCancelLabel' : function(){
			return this.cancelBtn.getLabel();
		},
		'setCancelLabel' : function(val){
			this.cancelBtn.setLabel(val);
		},

		'getCancelIcon' : function(){
			return this.cancelBtn.getIcon();
		},
		'setCancelIcon' : function(val){
			this.cancelBtn.setIcon(val);
		},

		'getTitle' : function(){
			var title = this.title;

			return title ? title.getText() : null;
		},
		'setTitle' : function(val){
			if(val){
				if(!this.title){
					this.title = new OjLabel(val);
					this.title.addCss(['title']);

					this.pane.addChildAt(this.title, 0);
				}

				this.title.setText(val);
			}
			else{
				this._unset('title');
			}
		}
	}
);
OJ.importJs('oj.fx.OjMove');
OJ.importJs('oj.window.OjWindowManager');
OJ.importJs('nw.window.NwActionCard');
OJ.importJs('nw.window.NwActionButton');


'use strict';

OJ.extendManager(
	'WindowManager', OjWindowManager, 'NwWindowManager',
	{
		'_props_' : {
			'actionCardClass' : NwActionCard
		},


		'_actionCard' : function(buttons/*, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
			var args = arguments;

				args[0] = new OjList(buttons, NwActionButton);

			return this.makeActionCard.apply(this, args);
		},

		'_isMobileAC' : function(modal){
			return modal.is('NwActionCard') && OJ.isMobile();
		},

		'_transIn' : function(modal){
			this._super('NwWindowManager', '_transIn', arguments);

			if(this._isMobileAC(modal)){
				var h = modal.pane.getHeight(),
					y = modal.pane.getY();

				modal.pane.setY(y + h);

				// transition the modal
				var move = new OjMove(modal.pane, OjMove.Y, y, 250, OjEasing.OUT);
				move.start();
			}
		},

		'_transOut' : function(modal){
			this._super('NwWindowManager', '_transOut', arguments);

			if(this._isMobileAC(modal)){
				var h = modal.pane.getHeight(),
					y = modal.pane.getY();

				// transition the modal
				var move = new OjMove(modal.pane, OjMove.Y, y + h, 250, OjEasing.OUT);
				move.start();
			}
		},


		'alert' : function(title, message/*, buttons, cancel_label*/){
			var alrt = this._alert.apply(this, arguments);

			// if app is not running natively then just call the regular alert
			if(isUndefined(NW.alert(alrt))){
				this.show(alrt);
			}

			return alrt;
		},

		'actionCard' : function(buttons/*, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
			var card = this._actionCard.apply(this, arguments);

			if(isUndefined(NW.actionCard(card))){
				this.show(card);
			}

			return card;
		},

		'browser' : function(url, title/*, width, height*/){
			var rtrn;

			if(isUndefined(rtrn = NW.browser(url, title, true))){
				return this._super('NwWindowManager', 'browser', arguments);
			}

			return rtrn;
		},

		'makeActionCard' : function(/*actions, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
			return this._actionCardClass.makeNew(arguments);
		},

		'position' : function(modal){
			if(this._isMobileAC(modal)){
				var w = modal.getWidth(),
					h = modal.getHeight(),
					w2 = modal.getPaneWidth(),
					h2 = modal.getPaneHeight();

				modal.pane.setX((w - w2) / 2);
				modal.pane.setY(h - h2);

				return;
			}

			this._super('NwWindowManager', 'position', arguments);
		}
	}
);
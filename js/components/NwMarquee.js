OJ.importJs('oj.timer.OjTimer');

OJ.importCss('nw.components.NwMarquee');


'use strict';

OJ.extendClass(
	'NwMarquee', [OjComponent],
	{
		// properties & vars
		'_props_' : {
			'buttonMode'        : null,
			'interval'          : 0,
			'nextButtonIcon'    : null,
			'nextButtonLabel'   : 'Next >',
			'prevButtonIcon'    : null,
			'prevButtonLabel'   : '< Prev'
		},

		'_template' : 'nw.components.NwMarquee',

//		'_timer' : null,  'nextBtn' : null,  'prevBtn' : null,


		// Construction & Destruction Functions
		'_constructor' : function(/*items, transition, item_renderer*/){
			this._super(OjComponent, '_constructor', []);

			var args = arguments,
				ln = args.length;

			// setup the stack
			this.container.setAllowLooping(true);

			this.container.addEventListener(OjMouseEvent.OVER, this, '_onMouseOver');
			this.container.addEventListener(OjMouseEvent.OUT, this, '_onMouseOut');
			this.container.addEventListener(OjStackEvent.CHANGE_COMPLETE, this, '_onChange');

			// setup stack
			if(ln){
				if(ln > 1){
					if(ln > 2){
						this.setItemRenderer(args[2]);
					}

					this.setTransition(args[1]);
				}

				this.setItems(args[0]);
			}

			// setup the timer
			this._timer = new OjTimer(this._interval * 1000, 0);
			this._timer.addEventListener(OjTimer.TICK, this, '_onTimerTick');

			// set the default button mode
			this.setButtonMode(NwMarquee.HIDE_BUTTONS);
		},

		'_destructor' : function(){
			this._unset('_timer');

			return this._super(OjComponent, '_destructor', arguments);
		},


		'_setIsDisplayed' : function(displayed){
			if(this._is_displayed == displayed){
				return;
			}

			this._super(OjComponent, '_setIsDisplayed', arguments);

			if(this._is_displayed){
				if(this._timer.isPaused()){
					this.start();
				}

				this.redraw();
			}
			else if(this._timer.isRunning()){
				this._timer.pause();
			}
		},


		// Helper Functions
		'_redrawButtons' : function(){
			if(this._is_displayed){
				if(this.prevBtn){
					this.prevBtn.setIsDisabled(!this._allowLooping && this._current_index <= 0);
				}

				if(this.nextBtn){
					this.nextBtn.setIsDisabled(!this._allowLooping && this._current_index >= this.numElms() - 1);
				}

				return true;
			}

			return false;
		},


		// Event Handler Functions
		'_onChange' : function(evt){
			var stack = this.container,
				index = evt.getIndex(), item;

			this.prerender.setChildren(
				[
					(item = stack.getElmAt(index - 1)) == stack.getActive() ? null : stack.renderItem(item),
					(item = stack.getElmAt(index + 1)) == stack.getActive() ? null : stack.renderItem(item)
				]
			);
		},

		'_onTimerTick' : function(evt){
			this.next();
		},

		'_onMouseOut' : function(evt){
			if(this._timer.getState() == OjTimer.PAUSED){
				this.start();
			}
		},

		'_onMouseOver' : function(evt){
			if(this._timer.isRunning()){
				this._timer.pause();
			}
		},

		'_onNextClick' : function(evt){
			this.next();
		},

		'_onPrevClick' : function(evt){
			this.prev();
		},


		// Utility Functions
		'next' : function(){
			if(this._timer.isRunning()){
				this._timer.restart();
			}

			this.container.next();
		},

		'prev' : function(){
			if(this._timer.isRunning()){
				this._timer.restart();
			}

			this.container.prev();
		},

		'start' : function(){
			if(this._interval){
				this._timer.start();
			}
		},

		'stop' : function(){
			this._timer.stop();
		},


		// Getter & Setter Functions
		'getAllowLooping' : function(){
			return this.container.getAllowLooping();
		},
		'setAllowLooping' : function(allow_looping){
			this.container.setAllowLooping(allow_looping);

			this._redrawButtons();
		},

		'getAlwaysTrans' : function(){
			return this.container.getAlwaysTrans();
		},
		'setAlwaysTrans' : function(val){
			return this.container.setAlwaysTrans(val);
		},

		'setButtonMode' : function(val){
			if(this._buttonMode == val){
				return;
			}

			if(this._buttonMode){
				this.removeCss([this._buttonMode]);
			}

			this.addCss([this._buttonMode = val]);

			if(this._buttonMode == this._static.HIDE_BUTTONS){
				this.removeChild(this.prevBtn);
				this.removeChild(this.nextBtn);
			}
			else{
				if(!this.prevBtn){
					this.prevBtn = new OjButton(this._prevButtonLabel, this._prevButtonIcon);
					this.prevBtn.addCss(['prevBtn']);
					this.prevBtn.addEventListener(OjMouseEvent.CLICK, this, '_onPrevClick');
				}

				this.addChild(this.prevBtn);

				if(!this.nextBtn){
					this.nextBtn = new OjButton(this._nextButtonLabel, this._nextButtonIcon);
					this.nextBtn.addCss(['nextBtn']);
					this.nextBtn.addEventListener(OjMouseEvent.CLICK, this, '_onNextClick');
				}

				this.addChild(this.nextBtn);
			}
		},

		'setInterval' : function(interval){
			this._interval = interval;

			this._timer.setDuration(interval * 1000);
		},

		'setIsDisabled' : function(val){
			if(this._isDisabled == val){
				return;
			}

			this._super(OjComponent, 'setIsDisabled', arguments);

			if(this._isDisabled && this._timer.isRunning()){
				this._timer.pause();
			}
			else if(!this._isDisabled && this._timer.isPaused()){
				this.start();
			}
		},

		'getItemRenderer' : function(){
			return this.container.getItemRenderer();
		},
		'setItemRenderer' : function(val){
			this.container.setItemRenderer(val);
		},

		'getItems' : function(){
			return this.container.getElms();
		},
		'setItems' : function(val){
			this.container.setElms(val);
		},

		'setNextButtonIcon' : function(icon){
			if(this._nextButtonIcon == icon){
				return;
			}

			this._nextButtonIcon = icon;

			if(this.nextBtn){
				this.nextBtn.setIcon(icon);
			}
		},

		'setNextButtonLabel' : function(lbl){
			if(this._nextButtonLabel == lbl){
				return;
			}

			this._nextButtonLabel = lbl;

			if(this.nextBtn){
				this.nextBtn.setLabel(lbl);
			}
		},

		'setPrevButtonIcon' : function(icon){
			if(this._prevButtonIcon == icon){
				return;
			}

			this._prevButtonIcon = icon;

			if(this.prevBtn){
				this.prevBtn.setIcon(icon);
			}
		},

		'setPrevButtonLabel' : function(lbl){
			if(this._prevButtonLabel == lbl){
				return;
			}

			this._prevButtonLabel = lbl;

			if(this.prevBtn){
				this.prevBtn.setLabel(lbl);
			}
		},

		'getTransition' : function(){
			return this.container.getTransition();
		},
		'setTransition' : function(val){
			return this.container.setTransition(val);
		}
	},
	{
		// static
		'HIDE_BUTTONS'  : 'hide-buttons',
		'HOVER_BUTTONS' : 'hover-buttons',
		'SHOW_BUTTONS'  : 'show-buttons'
	}
);
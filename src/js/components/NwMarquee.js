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
			this.container.allowLooping = true;

			this.container.addEventListener(OjUiEvent.OVER, this, '_onMouseOver');
			this.container.addEventListener(OjUiEvent.OUT, this, '_onMouseOut');
			this.container.addEventListener(OjStackEvent.CHANGE_COMPLETE, this, '_onChange');

			// setup stack
			if(ln){
				if(ln > 1){
					if(ln > 2){
						this.item_renderer = args[2];
					}

					this.transition = args[1];
				}

				this.items = args[0];
			}

			// setup the timer
			this._timer = new OjTimer(this._interval * 1000, 0);
			this._timer.addEventListener(OjTimer.TICK, this, '_onTimerTick');

			// set the default button mode
			this.buttonMode = NwMarquee.HIDE_BUTTONS;
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
					this.prevBtn.isDisabled = !this._allowLooping && this._current_index <= 0;
				}

				if(this.nextBtn){
					this.nextBtn.isDisabled = !this._allowLooping && this._current_index >= this.numElms - 1;
				}

				return true;
			}

			return false;
		},


		// Event Handler Functions
		'_onChange' : function(evt){
			var stack = this.container,
				index = evt.index, item;

			this.prerender.children = [
                (item = stack.getElmAt(index - 1)) == stack.active ? null : stack.renderItem(item),
                (item = stack.getElmAt(index + 1)) == stack.active ? null : stack.renderItem(item)
            ];
		},

		'_onTimerTick' : function(evt){
			this.next();
		},

		'_onMouseOut' : function(evt){
			if(this._timer.state == OjTimer.PAUSED){
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
		'.allowLooping' : function(){
			return this.container.allowLooping;
		},
		'=allowLooping' : function(allow_looping){
			this.container.allowLooping = allow_looping;

			this._redrawButtons();
		},

		'.alwaysTrans' : function(){
			return this.container.alwaysTrans;
		},
		'=alwaysTrans' : function(val){
			return this.container.alwaysTrans = val;
		},

		'=buttonMode' : function(val){
			if(this._buttonMode == val){
				return;
			}

			if(this._buttonMode){
				this.removeCss(this._buttonMode);
			}

			this.addCss([this._buttonMode = val]);

			if(this._buttonMode == this._static.HIDE_BUTTONS){
				this.removeChild(this.prevBtn);
				this.removeChild(this.nextBtn);
			}
			else{
				if(!this.prevBtn){
					this.prevBtn = new OjButton(this._prevButtonLabel, this._prevButtonIcon);
					this.prevBtn.addCss('prevBtn');
					this.prevBtn.addEventListener(OjUiEvent.PRESS, this, '_onPrevClick');
				}

				this.addChild(this.prevBtn);

				if(!this.nextBtn){
					this.nextBtn = new OjButton(this._nextButtonLabel, this._nextButtonIcon);
					this.nextBtn.addCss('nextBtn');
					this.nextBtn.addEventListener(OjUiEvent.PRESS, this, '_onNextClick');
				}

				this.addChild(this.nextBtn);
			}
		},

		'=interval' : function(interval){
			this._interval = interval;

			this._timer.duration = interval * 1000;
		},

		'=isDisabled' : function(val){
			if(this._isDisabled == val){
				return;
			}

			this._super(OjComponent, '=isDisabled', arguments);

			if(this._isDisabled && this._timer.isRunning()){
				this._timer.pause();
			}
			else if(!this._isDisabled && this._timer.isPaused()){
				this.start();
			}
		},

		'.item_renderer' : function(){
			return this.container.item_renderer;
		},
		'=item_renderer' : function(val){
			this.container.item_renderer = val;
		},

		'.items' : function(){
			return this.container.elms;
		},
		'=items' : function(val){
			this.container.elms = val;
		},

		'=nextButtonIcon' : function(icon){
			if(this._nextButtonIcon == icon){
				return;
			}

			this._nextButtonIcon = icon;

			if(this.nextBtn){
				this.nextBtn.icon = icon;
			}
		},

		'=nextButtonLabel' : function(lbl){
			if(this._nextButtonLabel == lbl){
				return;
			}

			this._nextButtonLabel = lbl;

			if(this.nextBtn){
				this.nextBtn.label = lbl;
			}
		},

		'=prevButtonIcon' : function(icon){
			if(this._prevButtonIcon == icon){
				return;
			}

			this._prevButtonIcon = icon;

			if(this.prevBtn){
				this.prevBtn.icon = icon;
			}
		},

		'=prevButtonLabel' : function(lbl){
			if(this._prevButtonLabel == lbl){
				return;
			}

			this._prevButtonLabel = lbl;

			if(this.prevBtn){
				this.prevBtn.label = lbl;
			}
		},

		'.transition' : function(){
			return this.container.transition;
		},
		'=transition' : function(val){
			return this.container.transition = val;
		}
	},
	{
		// static
		'HIDE_BUTTONS'  : 'hide-buttons',
		'HOVER_BUTTONS' : 'hover-buttons',
		'SHOW_BUTTONS'  : 'show-buttons'
	}
);
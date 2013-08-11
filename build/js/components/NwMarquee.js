OJ.importJs("oj.timer.OjTimer");OJ.importCss("nw.components.NwMarquee");"use strict";OJ.extendClass(OjComponent,"NwMarquee",{_props_:{buttonMode:null,interval:0,nextButtonIcon:null,nextButtonLabel:"Next >",prevButtonIcon:null,prevButtonLabel:"< Prev"},_template:"nw.components.NwMarquee",_constructor:function(){this._super("NwMarquee","_constructor",[]);var a=arguments,b=a.length;this.container.setAllowLooping(true);this.container.addEventListener(OjMouseEvent.OVER,this,"_onMouseOver");this.container.addEventListener(OjMouseEvent.OUT,this,"_onMouseOut");this.container.addEventListener(OjStackEvent.CHANGE_COMPLETE,this,"_onChange");if(b){if(b>1){if(b>2){this.setItemRenderer(a[2])}this.setTransition(a[1])}this.setItems(a[0])}this._timer=new OjTimer(this._interval*1000,0);this._timer.addEventListener(OjTimer.TICK,this,"_onTimerTick");this.setButtonMode(NwMarquee.HIDE_BUTTONS)},_destructor:function(){this._unset("_timer");return this._super("NwMarquee","_destructor",arguments)},_setIsDisplayed:function(a){if(this._is_displayed==a){return}this._super("NwMarquee","_setIsDisplayed",arguments);if(this._is_displayed){if(this._timer.isPaused()){this.start()}this.redraw()}else{if(this._timer.isRunning()){this._timer.pause()}}},_redrawButtons:function(){if(this._is_displayed){if(this.prevBtn){this.prevBtn.setIsDisabled(!this._allowLooping&&this._current_index<=0)}if(this.nextBtn){this.nextBtn.setIsDisabled(!this._allowLooping&&this._current_index>=this.numElms()-1)}return true}return false},_onChange:function(b){var a=this.container,c=b.getIndex(),d;this.prerender.setChildren([(d=a.getElmAt(c-1))==a.getActive()?null:a.renderItem(d),(d=a.getElmAt(c+1))==a.getActive()?null:a.renderItem(d)])},_onTimerTick:function(a){this.next()},_onMouseOut:function(a){if(this._timer.getState()==OjTimer.PAUSED){this.start()}},_onMouseOver:function(a){if(this._timer.isRunning()){this._timer.pause()}},_onNextClick:function(a){this.next()},_onPrevClick:function(a){this.prev()},next:function(){if(this._timer.isRunning()){this._timer.restart()}this.container.next()},prev:function(){if(this._timer.isRunning()){this._timer.restart()}this.container.prev()},start:function(){if(this._interval){this._timer.start()}},stop:function(){this._timer.stop()},getAllowLooping:function(){return this.container.getAllowLooping()},setAllowLooping:function(a){this.container.setAllowLooping(a);this._redrawButtons()},getAlwaysTrans:function(){return this.container.getAlwaysTrans()},setAlwaysTrans:function(a){return this.container.setAlwaysTrans(a)},setButtonMode:function(a){if(this._buttonMode==a){return}if(this._buttonMode){this.removeCss([this._buttonMode])}this.addCss([this._buttonMode=a]);if(this._buttonMode==this._static.HIDE_BUTTONS){this.removeChild(this.prevBtn);this.removeChild(this.nextBtn)}else{if(!this.prevBtn){this.prevBtn=new OjButton(this._prevButtonLabel,this._prevButtonIcon);this.prevBtn.addCss(["prevBtn"]);this.prevBtn.addEventListener(OjMouseEvent.CLICK,this,"_onPrevClick")}this.addChild(this.prevBtn);if(!this.nextBtn){this.nextBtn=new OjButton(this._nextButtonLabel,this._nextButtonIcon);this.nextBtn.addCss(["nextBtn"]);this.nextBtn.addEventListener(OjMouseEvent.CLICK,this,"_onNextClick")}this.addChild(this.nextBtn)}},setInterval:function(a){this._interval=a;this._timer.setDuration(a*1000)},setIsDisabled:function(a){if(this._isDisabled==a){return}this._super("NwMarquee","setIsDisabled",arguments);if(this._isDisabled&&this._timer.isRunning()){this._timer.pause()}else{if(!this._isDisabled&&this._timer.isPaused()){this.start()}}},getItemRenderer:function(){return this.container.getItemRenderer()},setItemRenderer:function(a){this.container.setItemRenderer(a)},getItems:function(){return this.container.getElms()},setItems:function(a){this.container.setElms(a)},setNextButtonIcon:function(a){if(this._nextButtonIcon==a){return}this._nextButtonIcon=a;if(this.nextBtn){this.nextBtn.setIcon(a)}},setNextButtonLabel:function(a){if(this._nextButtonLabel==a){return}this._nextButtonLabel=a;if(this.nextBtn){this.nextBtn.setLabel(a)}},setPrevButtonIcon:function(a){if(this._prevButtonIcon==a){return}this._prevButtonIcon=a;if(this.prevBtn){this.prevBtn.setIcon(a)}},setPrevButtonLabel:function(a){if(this._prevButtonLabel==a){return}this._prevButtonLabel=a;if(this.prevBtn){this.prevBtn.setLabel(a)}},getTransition:function(){return this.container.getTransition()},setTransition:function(a){return this.container.setTransition(a)}},{HIDE_BUTTONS:"hide-buttons",HOVER_BUTTONS:"hover-buttons",SHOW_BUTTONS:"show-buttons"});
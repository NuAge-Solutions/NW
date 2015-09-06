OJ.importJs('oj.form.OjSelector');


OJ.extendComponent(
	'NwSelector', [OjSelector],
	{
		'_props_' : {
			'summaryRenderer' : null
		},

		'_selectOption' : function(option, data){
			this._super(OjSelector, '_selectOption', arguments);

			if(this.summary){
				this.summary.setData(this._value.clone());
			}
		},

		'_unselectOption' : function(option, data){
			this._super(OjSelector, '_unselectOption', arguments);

			if(this.summary){
				this.summary.data = this._value.clone();
			}
		},


		'_onSummaryClick' : function(evt){
			if(isEmpty(this.options)){
				return;
			}

			WindowManager.show(
				WindowManager.makeActionCard(this.input, this._label)
			);
		},


		'=summaryRenderer' : function(val){
			if(this._summaryRenderer == val){
				return;
			}

			if(this.summary){
				this.stem.replaceChild(this.summary, this.input);

				this._unset('summary');
			}

			if(this._summaryRenderer = val){
				this.stem.replaceChild(this.input, this.summary = new val(this, this._value));

				this.summary.addEventListener(OjUiEvent.PRESS, this, '_onSummaryClick');
			}
		}
	}
)
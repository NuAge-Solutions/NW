OJ.importJs('nw.renderers.NwOrderedDataEditor');

OJ.importCss('nw.form.NwOrderedDataForm');

// TODO: this form only works for nested data. it should be make to work for non-nested data as well
OJ.extendComponent(
	'NwOrderedDataForm', [OjForm],
	{
        '_props_' : {
            'parentData' : null,
            'property' : null,
            'submitLabel' : 'Save'
        },

        '_template' : 'nw.form.NwOrderedDataForm',


        '_constructor' : function(parentData, property){
            this._super(OjForm, '_constructor', []);

            this.property = property;
            this.parentData = parentData;
        },


        '_listeners' : function(type){
			switch(type){
				case 'save':
					return [this.parentData, NwDataEvent.SAVE, NwDataErrorEvent.SAVE];
			}

			return this._super(OjForm, '_listeners', arguments);
		},

        '_unload' : function(){
            this._super(OjForm, '_unload', arguments);

            var ln = this.numElms;

            for(; ln--; ){
                this.getElmAt(ln).reset();
            }
        },

        '_updateFormData' : function(){
            var parent = this.parentData,
                prop = this.property;

            if(prop && parent){
                var data = prop.value(parent),
                ln = data ? data.length : 0,
                elms = [];

                for(; ln--;){
                    elms.unshift(data.getItemAt(ln));
                }

                elms.sort(function(a, b){
                    return a.property(a.oj_class.ORDER_KEY) - b.property(b.oj_class.ORDER_KEY);
                });

                this.container.elms = elms;
            }
        },


        '_onAddClick' : function(evt){
            var cls = this.property.dataClass,
                data = new cls();

            this.addElm(data);

            data.property(data.oj_class.ORDER_KEY, this.numElms);
        },

        '_onSaveFail' : function(){
            this._updateListeners('remove', 'save');

            this._hideOverlay();

            WindowManager.alert('Could not save. Please try again.', 'Save Error');
        },

        '_onSaveSuccess' : function(){
            this._updateListeners('remove', 'save');

            var ln = this.numElms();

            for(; ln--; ){
                this.getElmAt(ln).isDirty(false);
            }

            this._hideOverlay();

            if(this._controller){
                this._controller.removeView(this);
            }
        },

        '_onSubmitClick' : function(evt){
            if(this.submit()){
                var parent = this.parentData,
                    prop = this.property;

                parent.property(prop.name, this.elms);

                if(parent.isNew()){
                    this._onSaveSuccess(null);
                }
                else{
                    this._updateListeners('add', 'save');

                    this._showOverlay('Saving');

                    parent.save(prop.name);
                }
            }
        },


        '=parentData' : function(data){
            if(this._parentData == data){
                return;
            }

            this._parentData = data;

            this._updateFormData();
        },

        '=property' : function(prop){
            if(this._property == prop){
                return;
            }

            this._property = prop;

            this._updateFormData();
        }
	}
);
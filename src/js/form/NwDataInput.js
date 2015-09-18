OJ.importJs('nw.events.NwDataEvent');
OJ.importJs('nw.form.NwDataForm');
OJ.importJs('nw.form.NwSelectDataForm');
OJ.importJs('nw.form.NwOrderedDataForm');
OJ.importJs('nw.renderers.NwDataListItem');

OJ.importCss('nw.form.NwDataInput');


OJ.extendComponent(
	'NwDataInput', [OjInput],
    {
        '_props_' : {
            'dataClass' : NwData,
            'formRenderer' : NwDataForm,
            'item_editor' : OjItemEditor,
            'property' : null,
            'selectRenderer' : NwSelectDataForm
        },

        '_template' : 'nw.form.NwDataInput',


        '_updateButtons' : function(){
            var max = this._property.max;

            this.add_btn.isDisabled = max && max <= this.list.numElms;
        },

        '_onAddClick' : function(evt){
            var form = new this._formRenderer(),
                controller = this.controller;

            form.data = new this.dataClass();
            form.submitLabel = 'Create';
            form.title = 'Create ' + this._class.title();
            form.addEventListener(NwDataEvent.SAVE, this, '_onAddSave');

            if(controller){
                controller.addView(form);
            }
            else{
                WindowManager.modal(form, form.title, 600, 500);
            }
        },

        '_onAddSave' : function(evt){
            this.list.addElm(evt.currentTarget.data);

            this._updateButtons();
        },

        '_onListChange' : function(evt){
            this.dispatchEvent(new OjEvent(OjEvent.CHANGE));

            this._updateButtons();
        },

        '_onSelectClick' : function(evt){
            var form = new this._selectRenderer(),
                controller = this.controller;

            form.dataClass = this.dataClass;
            form.data = this.list.dataProvider;
            form.property = this._property;

            form.submitLabel = 'Save';
            form.title = 'Select ' + this._class.title();

            form.addEventListener(OjEvent.SUBMIT, this, '_onSelectSave');

            if(controller){
                controller.addView(form);
            }
            else{
                WindowManager.modal(form, form.title, 600, 500);
            }
        },

        '_onSelectSave' : function(evt){
            this.value = evt.currentTarget.data;
        },

        '_redrawValue' : function(){
            var val = OjArray.array(this._value);

            this.list.elms = val;
        },

        '=dataClass' : function(cls){
            if(this._dataClass == cls){
                return;
            }

            this._dataClass = cls;

            this.list.item_renderer = cls.ITEM_RENDERER;

            // type check class
            var obj = new cls();

            if(obj.is(NwApiData)){
                this.removeCss('no-select');
            }
            else{
                this.addCss('no-select');
            }
        },

        '.item_editor' : function(){
            return this.list.item_editor;
        },
        '=item_editor' : function(val){
            this.list.item_editor = val;
        },

        '.value' : function(){
            return this.list.elms;
        }
    },
    {
        '_TAGS' : ['data-input']
    }
);


//OJ.extendComponent(
//	'NwInlineReferenceInput', [OjInput],
//	{
//
//    }
//);


OJ.extendComponent(
	'NwOrderedReferenceInput', [OjInput],
	{
        '_props_' : {
            'class' : NwData,
            'formRenderer' : NwOrderedDataForm,
            'item_editor' : OjItemEditor,
            'property' : null
        },

        '_constructor' : function(){
            this._super(OjInput, '_constructor', arguments);

            this.psuedoInput.addEventListener(OjUiEvent.PRESS, this, '_onInputClick');
        },


        '_redrawValue' : function(){
            if(!this.value){
                this.value = new OjLabel();

                this.stem.addChild(this.value);
            }

            var prop = this.property,
                prop_lbl = prop ? prop.label : 'Available',
                lbl = 'No ' + prop_lbl;

            if(this._value){
                lbl = this._value.length + ' ' + prop_lbl
            }

            this.value.text = lbl;
        },


        '_onDataSave' : function(evt){
            this._value = evt.data.property(this.property.name);

            this._redrawValue();
        },

        '_onInputClick' : function(evt){
            var controller = this.controller;

            if(controller){
                var cls = this.formRenderer,
                    data = this.form.data;

                controller.stack.addElm(new cls(data, this.property));

                data.addEventListener(NwDataEvent.SAVE, this, '_onDataSave');
            }
        }
	},
    {
        '_TAGS' : ['ordered-reference-input', 'nw-ordered-ref-input', 'ordered-ref-input']
    }
);
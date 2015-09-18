OJ.importCss('nw.renderers.NwOrderedDataEditor');


OJ.extendComponent(
	'NwOrderedDataEditor', [OjItemEditor],
	{
        '_template' : 'nw.renderers.NwOrderedDataEditor',

        '_position' : -1,  '_orig_pos' : -1,  '_place_holder' : null,

//        '_prop' : null,


        '_constructor' : function(){
            this._super(OjItemEditor, '_constructor', arguments);

            this.handle.addEventListener(OjDragEvent.START, this, '_onDragStart');
            this.handle.addEventListener(OjDragEvent.DRAG, this, '_onDrag');
            this.handle.addEventListener(OjDragEvent.END, this, '_onDragEnd');
        },

        '_redrawData' : function(){
            // intentionally skip the OjItemEditor _redrawData method because we don't want its functionality
            if(this._super(OjItemRenderer, '_redrawData', arguments)){
                var index = this._group.indexOfElm(this._data),
                    desc;

                if(this._data){
//                    this._data.setIndex(index = this._group.indexOfElm(this._data));
//
//                    desc = this._data.getDescription();
                }

                this.handle.text = index;
//                this.item.setValue(desc);

                return true;
            }

            return false;
        },

        '_onDeletePress' : function(evt){
            // remove the elm
            var group = this._group;

            this._group.removeElm(this._data);

            // redraw the #'s
            group.redraw()
        },

        '_onDragStart' : function(evt){
            var w = this.width,
                h = this.height,
                holder = new OjStyleElement(),
                p = this.parent;

            // setup the place holder
            holder.addCss('ApRecipeStepPlaceHolder')
            holder.width = w;
            holder.height = h;

            // setup the row to drag
            this.width = w;
            this.height = w;

            this.x = this.x;
            this.pageY = evt.pageY + 1;

            this.addCss('drag');

            // setup the position vars
            this._position = this._orig_pos = this._group.indexOfElm(this._data);

            p.replaceChild(this, this._place_holder = holder);
            p.addChild(this);
        },

        '_onDrag' : function(evt){
            var p = this.parent,
                x = this.x,
                y = p.localY(evt.pageY),
                start = this._position,
                stop = 0,
                pos = -1;

            if(this.y > y){
                for(start++; start--;){
                    if(p.container.getChildAt(start).hitTestPoint(x, y)){
                        pos = start;

                        break;
                    }
                }
            }
            else{
                for(stop = p.numElms; start < stop; start++){
                    if(p.container.getChildAt(start).hitTestPoint(x, y)){
                        pos = start;

                        break;
                    }
                }
            }

            this.y = y + 1;

            if(pos > -1 && pos != this._position){
                if(pos > this._position){
                    this._position = pos++;
                }
                else{
                    this._position = pos;
                }

                p.insertChild(this._place_holder, pos);
            }
        },

        '_onDragEnd' : function(evt){
            // remove the place holder
            this._unset('_place_holder');

            // update the group data
            this._group.moveElm(this._data, this._position);

            this._group.redraw();

            // reset vars and elms
            this.width = null;
            this.height = null;

            this.x = null;
            this.y = null;

            this.removeCss('drag');

            this._position = -1;
        },

        '=data' : function(data){
            if(this._data == data){
                return;
            }

            if(this._form){
                this._unset('_form');
            }

            this._super(OjItemEditor, '=data', arguments);

            if(this._data){
                var cls = this._data.oj_class;

                this._prop = cls.getProperty(cls.ORDER_KEY);

                this._form = this._data.makeForm();
                this._form.autoUpdate = true;
                this._form.load();

                this.form.addChild(this._form);
            }
        },

        '.value' : function(){
            return this.item.value;
        },
        '=value' : function(val){
            this.item.value = val;
        }
	},
    {
        '_TAGS' : ['ordered-data-editor', 'nw-e-ordered-data', 'e-ordered-data']
    }
);
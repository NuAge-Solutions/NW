OJ.importJs('nw.data.NwData');
OJ.importJs('nw.data.properties.NwObjectProperty');
OJ.importJs('nw.events.NwDataEvent');
OJ.importJs('nw.form.NwDataInput');


OJ.extendClass(
    'NwDataProperty', [NwObjectProperty],
    {
        '_props_' : {
            'dataClass' : NwData,
            'nested' : false,
            'inline': false,
            'item_editor' : OjItemEditor,
            'options' : null,
            'ordered' : false
        },


        '_constructor' : function(dataClass/*, properties*/){
            var self = this,
                args = arguments;

            self.dataClass = dataClass;

            self.item_editor = dataClass.ITEM_EDITOR;
            self.item_renderer = dataClass.ITEM_RENDERER;

            self._super(NwObjectProperty, '_constructor', args.length > 1 ? [args[1]] : []);
        },


        '_exportSubValue' : function(value, old_value, mode){
            if(value && isObjective(value)){
                return (this._nested || this._flatten) ? value.exportData() : value.key();
            }

            return value;
        },

        '_exportValue' : function(value, old_value, mode){
            if(this._max == 1){
                return this._exportSubValue(value, old_value, mode);
            }

            var ary = [], ln = value ? value.length: 0;

            for(; ln--;){
                ary.unshift(
                    this._exportSubValue(
                        value[ln],
                        old_value,
                        mode
                    )
                );
            }

            return ary;
        },

        '_formatter' : function(func, value/*, old_value, mode*/){
            var ln = arguments.length;

            return func.call(
                this,
                value,
                ln > 2 ? arguments[2] : null,
                ln > 3 ? arguments[3] : NwData.DEFAULT
            );
        },

        '_importSubValue' : function(value, old_value, mode){
            // if the value is null then just return that
            if(!value){
                return null;
            }

            var cls = this.dataClass;

            // if value is of the proper oj class type then return it
            if(isObjective(value) && value.is(cls)){
                return value;
            }

            // if we allow nesting and have an old value then we need to handle this special
            if((this._nested || this._flatten) && old_value){
                if(isObject(value)){
                    old_value.importData(value, mode);
                }
                else{
                    old_value.key(value);
                }

                return old_value;
            }

            return isObject(value) ? cls.importData(value, mode) : cls.get(value, true);
        },

        '_importValue' : function(value, old_value, mode){
            var self = this,
                max = self.max;

            if(max == 1){
                return self._importSubValue(value, old_value, mode);
            }

            var old_ln = old_value ? old_value.length : 0,
                items = old_ln ? old_value : new OjArray();

            if(isObjective(value, OjArray)){
                return value;
            }

            if(isArray(value)){
                var ln = isArray(value) ? value.length : 0;

                ln = max == 0 ? ln : Math.min(ln, max);

                for(; old_ln > ln;){
                    items.removeAt(--old_ln);
                }

                for(; ln--;){
                    if(ln < old_ln){
                        items[ln] = self._importSubValue(value[ln], items[ln], mode);
                    }
                    else{
                        items.insertAt(this._importSubValue(value[ln], null, mode), old_ln);
                    }
                }

                return items;
            }

            if(isObject(value)){
                var key, i;

                for(key in value){
                    i = parseInt(key);

                    if(!max || ary.length < max){
                        if(i < old_ln){
                            items[i] = self._importSubValue(value[key], items[i], mode);
                        }
                        else{
                            items.append(self._importSubValue(value[key], null, mode));
                        }
                    }
                }

                return items;
            }

            return (self.nested || self.flatten) ? old_value : null;
        },

        '_setValue' : function(obj, setter, newValue){
            var self = this,
                key = self.name,
                prev = obj[key],
                d_evt = NwDataEvent,
                c_evt = OjCollectionEvent;

            if(prev == newValue){
                return newValue;
            }

            if(isArray(newValue)){
                arguments[2] = newValue = OjArray.array(newValue);
            }

            self._super(NwObjectProperty, '_setValue', arguments);

            var on_change = 'on' + (self.namespace || key).ucFirst() + 'Change';

            if(prev){
                //if(prev.is(NwData)){
                //    prev.removeEventListener(d_evt.CHANGE, self, on_change);
                //}
                //else if(prev.is(OjArray)){
                //    prev.removeEventListener(c_evt.ITEM_CHANGE, self, on_change);
                //}
            }

            if(newValue){
                //if(newValue.is(NwData)){
                //    newValue.addEventListener(d_evt.CHANGE, self, on_change);
                //}
                //else if(newValue.is(OjArray)){
                //    newValue.addEventListener(c_evt.ITEM_CHANGE, self, on_change);
                //}
            }
        },


        'makeInput' : function(input){
            var options = this.options,
                nm = this.name,
                lbl = this.label,
                dflt_val = this.defaultValue,
                min = this.min,
                itm_edtr = this.item_editor;

            if(!input){
                if(options){
                    if(this.isSingleSelection()){
                        input = new OjSelector(nm, lbl, dflt_val);
                        input.selectionRenderer = OjRadioOption;
                    }
                    else if(options.length > 10){
                        input = new OjTokenInput(nm, lbl, dflt_val);
                    }
                    else{
                        input = new OjSelector(nm, lbl, dflt_val);
                    }

                    input.item_renderer = this.item_renderer;
                }
                else if(this.ordered){
                    input = new NwOrderedReferenceInput(nm, lbl, dflt_val);
                    input.property = this;
                    input.item_editor = itm_edtr;
                }
//                else if(this.getInline()){
//                    input = new NwInlineReferenceInput(nm, lbl, dflt_val);
//                }
                else{
                    input = new NwDataInput(nm, lbl, dflt_val);
                    input.property = this;
                    input.item_editor = itm_edtr;
                }
            }

            if(isObjective(input) && input.is(NwDataInput)){
                input.dataClass = this.dataClass;
            }
            else if(input.options){
                input.options = options;
                input.selectionMin = min ? min : (this.required ? 1 : 0);
                input.selectionMax = this.max;
            }

            return this._super(NwProperty, 'makeInput', [input]);
        },

        'setup' : function(obj, key){
            var self = this,
                ns = self.namespace,
                on_change,
                is_sub = (self.nested || self.flatten);

            self._super(NwObjectProperty, 'setup', arguments);

            // default the namespace
            if(!ns){
                self.namespace = ns = key;
            }

            // setup change listener function if one doesn't already exist
            ns = ns.ucFirst();

            on_change = 'on' + ns + 'Change';

            if(!obj[on_change]){
                obj[on_change] = function(evt){
                    if(!evt || !evt.is(NwDataEvent) || is_sub){
                        this._addToDirty(key);
                    }
                };
            }

            //// if we only allow one or don't have a namespace
            //// don't add the extra reference management functions
            //if(this.max == 1 || !ns){
            //    return;
            //}
            //
            //// setup the add function if one doesn't already exist
            //var func;
            //
            //func = 'add' + ns;
            //
            //if(!obj[func]){
            //    obj[func] = function(item){
            //        var items = this[key];
            //
            //        if(!items){
            //            this[key] = items = new OjArray();
            //        }
            //
            //        if(is_sub){
            //            item.addEventListener(NwDataEvent.CHANGE, this, on_change);
            //        }
            //
            //        this._addToDirty(key);
            //
            //        return items.append(item);
            //    };
            //}
            //
            //// setup the addAt function if one doesn't already exist
            //func += 'At';
            //
            //if(!obj[func]){
            //    obj[func] = function(item, index){
            //        var items = this[key];
            //
            //        if(!items){
            //            this.property(key, items = new OjArray());
            //        }
            //
            //        if(is_sub){
            //            item.addEventListener(NwDataEvent.CHANGE, this, on_change);
            //        }
            //
            //        this._addToDirty(key);
            //
            //        return items.addItemAt(item, index);
            //    };
            //}
            //
            //// setup the getAt function if one doesn't already exist
            //func = 'get' + ns + 'At';
            //
            //if(!obj[func]){
            //    obj[func] = function(index){
            //        var items = this.property(key);
            //
            //        if(!items){
            //            return null;
            //        }
            //
            //        return items.getItemAt(index);
            //    };
            //}
            //
            //// setup the has function if one doesn't already exist
            //func = 'has' + ns;
            //
            //if(!obj[func]){
            //    obj[func] = function(item){
            //        var items = this.property(key);
            //
            //        return items ? items.hasItem(item) : false;
            //    };
            //}
            //
            //// setup the indexOf function if one doesn't already exist
            //func = 'indexOf' + ns;
            //
            //if(!obj[func]){
            //    obj[func] = function(item){
            //        var items = this.property(key);
            //
            //        return items ? items.indexOfItem(item) : -1;
            //    };
            //}
            //
            //// setup the num function if one doesn't already exist
            //func = 'num' + OJ.pluralize(ns);
            //
            //if(!obj[func]){
            //    obj[func] = function(){
            //        var items = this.property(key);
            //
            //        return items ? items.length : 0;
            //    };
            //}
            //
            //// setup the remove function if one doesn't already exist
            //func = 'remove' + ns;
            //
            //if(!obj[func]){
            //    obj[func] = function(item){
            //        var items = this.property(key);
            //
            //        if(!items){
            //            return item;
            //        }
            //
            //        if(is_sub){
            //            item.removeEventListener(NwDataEvent.CHANGE, this, on_change);
            //        }
            //
            //        this._addToDirty(key);
            //
            //        return items.removeItem(item);
            //    };
            //}
            //
            //// setup the removeAt function if one doesn't already exist
            //func += 'At';
            //
            //if(!obj[func]){
            //    obj[func] = function(index){
            //        var items = this.property(key);
            //
            //        if(!items){
            //            return null;
            //        }
            //
            //        if(is_sub){
            //            item.removeEventListener(NwDataEvent.CHANGE, this, on_change);
            //        }
            //
            //        this._addToDirty(key);
            //
            //        return items.removeItemAt(index);
            //    };
            //}
        },

        '=dataClass' : function(val){
            if(isString(val)){
                val = OJ.toClass(val);
            }

            if(this._dataClass == val){
                return;
            }

            this._dataClass = val;
        },

        '.item_editor' : function(){
            return this._item_editor ? this._item_editor : this.dataClass.ITEM_EDITOR;
        },

        '.item_renderer' : function(){
            return this._item_renderer ? this._item_renderer : this.dataClass.ITEM_RENDERER;
        }
    }
);
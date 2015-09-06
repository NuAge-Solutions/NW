OJ.importJs('nw.data.properties.NwProperty');


OJ.extendClass(
    'NwTextProperty', [NwProperty],
    {
        '_props_' : {
            'minLength' : 0,
            'maxLength' : 255
        },

        '_importValue' : function(value){
            return value ? String(value) : value;
        },

        '_processValue' : function(value){
            if(value){
                value = String.string(value);

                var self = this,
                    ln = value.length,
                    max = self.maxLength,
                    min = self.minLength;

                if(max && ln > max){
                    value = value.substr(0, max);
                }

                if(min && ln < min){
                    value = null;
                }
            }

            return value;
        },

        '_valueIsValid' : function(value){
            var self = this,
                max = self.maxLength,
                min = self.minLength,
                ln;

            if(!min && isUnset(value)){
                return true;
            }

            value = String.string(value);

            ln = value.length;

            return (!min || ln >= min) && (!max || ln <= max);
        },

        'makeInput' : function(/*dom_elm|input*/){
            var self = this,
                args = arguments;

            if(!args.length && self.maxLength > 255){
                args[0] = new OjTextArea(self.name, self.label, self.defaultValue);
                args.length = 1;
            }

            var input = this._super(NwProperty, 'makeInput', args);

            input.minLength = self.minLength;
            input.maxLength = self.maxLength;

            return input;
        },


        '=maxLength' : function(val){
            this._maxLength = Math.max(val, 0);
        },

        '=minLength' : function(val){
            this._minLength = Math.max(val, 0);
        }
    }
);
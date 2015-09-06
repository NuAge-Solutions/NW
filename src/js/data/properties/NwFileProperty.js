OJ.importJs('nw.data.properties.NwProperty');


OJ.extendClass(
	'NwFileProperty', [NwProperty],
	{
        '_props_' : {
            'minSize' : 0,
            'maxSize' : 1
        },


        '_processValue' : function(value){
            if(value){
                if(
                    (this._maxSize && value.size > this._maxSize) ||
                    (this._minSize && value.size < this._minSize)
                ){
                    // throw an error
                }
            }

            return value;
        },

        '_valueIsValid' : function(value){
            if(!this._minSize && isNull(value)){
                return true;
            }

            return (!this._minSize || value.size >= this._minSize) &&
                   (!this._maxSize || value.size <= this._maxSize);
        },

        'makeInput' : function(/*dom_elm|input*/){
            var args = arguments;

            if(!args.length){
                args[0] = new OjFileInput(this._name, this._label);
                args.length = 1;
            }

            var input = this._super(NwProperty, 'makeInput', args);

            input.minSize = this._minLength;
            input.maxSize = this._maxLength;
            input.selectionMax = this._max;

            return input;
        },


        '=maxSize' : function(val){
            this._maxSize = Math.max(val, 0);
        },

        '=minSize' : function(val){
            this._minSize = Math.max(val, 0);
        }
    }
);
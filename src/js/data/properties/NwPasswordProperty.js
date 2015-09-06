OJ.importJs('nw.data.properties.NwTextProperty');


OJ.extendClass(
	'NwPasswordProperty', [NwTextProperty],
	{
//        'makeInput' : function(/*dom_elm|input*/){
//            var args = arguments;
//
//            if(!args.length){
//                args[0] = new OjPassword(this._name, this._label, this._defaultValue);
//                args.length = 1;
//            }
//
//            var input = this._super(NwProperty, 'makeInput', args);
//
//            input.setMinLength(this._minLength);
//            input.setMaxLength(this._maxLength);
//
//            return input;
//        }
    }
);
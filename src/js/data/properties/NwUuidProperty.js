OJ.importJs('nw.data.properties.NwProperty');
OJ.importJs('nw.utils.NodeUuid');


OJ.extendClass(
	'NwUuidProperty', [NwProperty],
	{
        '_props_' :{
			'unique' : true
		},

        '_importValue' : function(value, old_value, mode){
            return value ? value.toLowerCase() : null;
        },

        'generate' : function(){
            return this._static.generate();
        },


        '=unique' : function(){
			throw 'Cannot set the uniqueness of a uuid. This is a fixed value.';
		}
    },
    {
        'generate' : function(){
//            if(NW.isNative){
//                // TODO: add native call to generate UUID
//                return NW.call();
//            }

            return uuid.v4().toLowerCase();
        }
    }
);
OJ.importJs("oj.events.OjEvent");"use strict";OJ.extendClass(OjEvent,"NwDataEvent",{_get_props_:{data:null,oldData:null},_constructor:function(c){var b,a=b=false,d=arguments.length;if(d>1){this._data=arguments[1];if(d>2){this._oldData=arguments[2];if(d>3){a=arguments[3];if(d>4){b=arguments[4]}}}}this._super("NwDataEvent","_constructor",[c,a,b])}},{CHANGE:"onDataChange",DELETE:"onDataDelete",LOAD:"onDataLoad",SAVE:"onDataSave"});
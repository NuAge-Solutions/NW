OJ.importJs("nw.app.NwAppManager");OJ.importJs("nw.data.NwData");OJ.importJs("nw.data.properties.NwDateProperty");OJ.importJs("nw.data.properties.NwNumberProperty");OJ.importJs("nw.data.properties.NwTextProperty");"use strict";window.NwIUser={hasPermission:function(c){if(c=="*"||this.isAdmin()){return true}var b=this.getRoles();if(b){for(var a=b.length;a;a--){if(AppManager.roleHasPermission(b[a],c)){return true}}}return false},isAdmin:function(){return AppManager.userIsAdmin(this)}};OJ.extendClass(NwData,"NwUser",NwIUser,{DEFINITION:{id:new NwNumberProperty(),name:new NwTextProperty(),roles:new NwTextProperty()},TYPE:"User"});
OJ.importJs('nw.app.NwAppManager');
OJ.importJs('nw.data.NwData');
OJ.importJs('nw.data.properties.NwDateProperty');
OJ.importJs('nw.data.properties.NwNumberProperty');
OJ.importJs('nw.data.properties.NwTextProperty');


'use strict';

window.NwIUser = {
	'hasPermission' : function(perm){
		if(perm == '*' || this.isAdmin()){
			return true;
		}

		var roles = this.getRoles();

		if(roles){
			for(var i = roles.length; i; i--){
				if(AppManager.roleHasPermission(roles[i], perm)){
					return true;
				}
			}
		}

		return false;
	},

	'isAdmin' : function(){
		return AppManager.userIsAdmin(this);
	}
};

OJ.extendClass(
	'NwUser', [NwData],
	NwIUser,
	{
		'DEFINITION' : {
			'id'            : new NwNumberProperty(),
			'name'          : new NwTextProperty(),
			'roles'         : new NwTextProperty()
		},

		'TYPE' : 'User'
	}
);
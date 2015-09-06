OJ.importJs('nw.apps.NwAppManager');
OJ.importJs('nw.data.NwData');
OJ.importJs('nw.data.properties.NwDateProperty');
OJ.importJs('nw.data.properties.NwNumberProperty');
OJ.importJs('nw.data.properties.NwTextProperty');


OJ.defineClass(
    'NwIUser',
    {
        'hasPermission' : function(perm){
            if(perm == '*' || this.isAdmin()){
                return true;
            }

            var roles = this.roles;

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
    }
);

OJ.extendClass(
	'NwUser', [NwData, NwIUser],
    {},
	{
		'DEFINITION' : {
			'id'            : new NwIntegerProperty(),
			'name'          : new NwTextProperty(),
			'roles'         : new NwTextProperty({ 'max': 0 })
		},

		'TYPE' : 'User',

        'ADMIN': 'admin'
	}
);
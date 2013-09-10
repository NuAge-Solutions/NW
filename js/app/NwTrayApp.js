OJ.importJs('nw.app.NwApp');
OJ.importJs('nw.components.NwTray');


OJ.extendComponent(
  'NwTrayApp', [NwTray, NwIApp],
  {
    '_constructor' : function(){
      this._super(NwTray, '_constructor', arguments);

      this._init();
    }
	}
);
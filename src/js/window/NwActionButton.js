OJ.importJs('oj.renderers.OjItemRenderer');
OJ.importJs('oj.components.OjButton');

OJ.importCss('nw.window.NwActionButton');


OJ.extendComponent(
	'NwActionButton', [OjItemRenderer],
	{
		'_template' : 'nw.window.NwActionButton',


		'_redrawData' : function(){
			if(this._super(OjItemRenderer, '_redrawData', arguments)){
				this.btn.text = this._data;

				return true;
			}

			return false;
		}
	},
    {
        '_TAGS' : ['action-button']
    }
);
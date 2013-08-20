OJ.importJs('oj.components.OjComponent');

OJ.importCss('nw.components.NwTray');


'use strict';

OJ.extendComponent(
  'NwTray', [OjComponent],
  {
    '_template' : 'nw.components.NwTray'
  },
  {
    '_TAGS' : ['tray']
  }
);
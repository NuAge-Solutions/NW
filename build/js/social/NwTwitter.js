OJ.importJs("oj.events.OjActionable");OJ.importCss("nw.social.NwTwitter");"use strict";OJ.extendManager("Twitter",OjActionable,"NwTwitter",{_props_:{user:null},makeShareButton:function(){var b=arguments,d=b.length,a=d>3?b[3]:this._user,c=new OjLink("Tweet","https://twitter.com/intent/tweet?original_referer="+String.string(d?b[0]:HistoryManager.get()).encodeUri()+"&text="+String.string(d>1?b[1]:"").encodeUri().replace("%20","+")+"&url="+String.string(d>4?b[4]:"").encodeUri()+"&via="+a.encodeUri(),WindowManager.WINDOW);c.addCss(["twitter-share-btn"]);c.setTargetWidth(550);c.setTargetHeight(420);return c}});
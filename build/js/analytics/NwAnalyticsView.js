OJ.importJs("nw.analytics.NwAnalyticsData");"use strict";OJ.extendClass(NwAnalyticsData,"NwAnalyticsView",{_props_:{title:null,path:null},_constructor:function(){this._super("NwAnalyticsView","_constructor",[]);var a=arguments,b=a.length;if(b){this.setPath(a[0]);if(b>1){this.setTitle(a[1])}}},setPath:function(a){if(this._path==a){return}if((this._path=a)&&a.charAt(0)!="/"){this._path="/"+a}}});
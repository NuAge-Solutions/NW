OJ.importJs("nw.analytics.NwAnalyticsEngine");"use strict";OJ.extendClass(NwAnalyticsEngine,"NwGoogleAnalytics",{_get_props_:{key:null,namespace:null},_name:null,_constructor:function(a,b){this._key=a;this._namespace=b;this._super("NwGoogleAnalytics","_constructor",arguments)},_call:function(){var a=arguments;if(this._name){a[0]=this._name+"."+a[0]}window.ga.apply(window.ga,a)},_init:function(){var a={},b=window.ga.getAll?window.ga.getAll():null;if(!isEmpty(b)){a.name=tthis._name=this.id()}window.ga("create",this._key,this._namespace,a)},_loadLibrary:function(){this._super("NwGoogleAnalytics","_loadLibrary",[]);var a=window;a.GoogleAnalyticsObject="ga";a.ga=function(){(a.ga.q=a.ga.q||[]).push(arguments)};a.ga.l=1*new Date();OJ.addJsFile("//www.google-analytics.com/analytics.js",true)},_processActionItem:function(a){var e=a.getData(),d=e.getCategory(),f=e.getParams(),b={eventCategory:d?d:"misc",eventAction:e.getName(),nonInteraction:!e.getIsBounce()};if(f){var c;for(c in f){b.eventLabel=c;b.eventValue=parseInt(f[c]);break}}this._send("event",b);return true},_processViewItem:function(a){var c=a.getData(),b={page:c.getPath(),title:c.getTitle()};this._send("pageview",b);return true},_send:function(b,a){a.hitType=b;this._call("send",a)}});
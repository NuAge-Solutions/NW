OJ.importJs("oj.data.OjRect");OJ.importJs("oj.events.OjActionable");"use strict";OJ.extendClass(OjActionable,"NwLayout",{_props_:{hSpacing:0,target:null,vSpacing:0},_constructor:function(){this._super("NwLayout","_constructor",[]);this._layouts={}},_recalculateLayoutItem:function(a,b){if(this._layouts[a]){return this._layouts[a]}return this._layouts[a]=b.getRect()},recalculateLayout:function(a){if(!this._target){return}var b=a,f,d,e=false,c=this._target.numElms();for(;b<c;b++){f=this._target.renderItemAt(b);e=!f.parent();if(e){OJ.render(f)}d=this._recalculateLayoutItem(b,f);if(e){f.parent(null)}f.setX(d.getLeft());f.setY(d.getTop())}},getVisible:function(b){var a=this._target.numElms(),c=[];for(;a--;){if(b.hitTestRect(this._layouts[a])){c.push(a)}}return c},getItemRectAt:function(a){return this._layouts[a]},setTarget:function(a){if(this._target==a){return}this._target=a;this.recalculateLayout(0)}});window.NwILayoutable={};
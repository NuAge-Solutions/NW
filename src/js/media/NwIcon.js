OJ.extendComponent(
    'NwIcon', [OjIcon], {
        '_props_' : {
            'color' : null,
            'size' : null,
            'stack' : null
        },

        '_template' : '<i class="fa"></i>',


        '=color' : function(val){
            var self = this,
                color = self._color;

            if(color == val){
                return;
            }

            if(color){
                self.removeCss(color);
            }

            if(self._color = val){
                self.addCss(val);
            }
        },

        '=size' : function(val){
            var self = this,
                old = self._size;

            if(old == val){
                return;
            }

            if(old){
                self.removeCss('fa-' + old);
            }

            if(isInt(val)){
                val = val + 'x';
            }

            self.addCss('fa-' + (self._size = val));
        },

        '=stack' : function(val){
            var self = this;

            if(isString(val)){
                val = val.split(', ');

                val.forEachReverse(function(item, i){
                    var parts = item.split('.');

                    parts.forEachReverse(function(item2, i2){
                        if(item2 == '2x' || item2 == '1x'){
                            parts[i2] = 'fa-stack-' + item2;
                        }
                        else{
                            parts[i2] = 'fa-' + item2;
                        }
                    });

                    val[i] = new NwIcon(parts.join(' '));
                });
            }

            if(isEmpty(val)){
                self.removeCss('fa-stack');

                self.children = [];
            }
            else{
                self.addCss('fa-stack');

                self.children = val;
            }
        }
    },
    {
        '_TAGS' : ['nw-i']
    }
);
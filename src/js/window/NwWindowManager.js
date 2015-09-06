OJ.importJs('nw.window.NwActionCard');
OJ.importJs('nw.window.NwActionButton');
OJ.importJs('nw.window.NwAppMessage');
OJ.importJs('nw.window.NwModal');


OJ.extendManager(
    'WindowManager', 'NwWindowManager', [OjWindowManager, NwManager],
    {
        '_props_' : {
            'actionCardClass' : NwActionCard,
            'modalClass' : NwModal
        },

        '_namespace' : 'nwUi',


        '_actionCard' : function(buttons/*, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
            var args = arguments;

            args[0] = new OjList(buttons, NwActionButton);

            return this.makeActionCard.apply(this, args);
        },

        '_isMobileAC' : function(modal){
            return modal.is(NwActionCard) && OJ.is_mobile;
        },

        '_transIn' : function(modal){
            this._super(OjWindowManager, '_transIn', arguments);

            if(this._isMobileAC(modal)){
                var h = modal.pane.height,
                    y = modal.pane.y;

                modal.pane.y = y + h;

                // transition the modal
                var move = new OjMove(modal.pane, OjMove.Y, y, 250, OjEasing.OUT);
                move.start();
            }
        },

        '_transOut' : function(modal){
            this._super(OjWindowManager, '_transOut', arguments);

            if(this._isMobileAC(modal)){
                var h = modal.pane.height,
                    y = modal.pane.y;

                // transition the modal
                var move = new OjMove(modal.pane, OjMove.Y, y + h, 250, OjEasing.OUT);
                move.start();
            }
        },


        'alert' : function(message, title, buttons, cancel_label){
            if(NW.isNative){
                this._comm('alert', arguments);
            }
            else{
                return this._super(OjWindowManager, 'alert', arguments)
            }
        },

        'actionCard' : function(target, buttons/*, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
            var args = Array.slice(arguments, 1),
                card = this._actionCard.apply(this, args);

            if(NW.isNative){
                this._comm('actions', [
                    card.title, card.cancelLabel, card.destroyLabel, buttons, target.pageRect
                ]);
            }
            else{
                this.show(card);
            }

            return card;
        },

        'browser' : function(url, title/*, width, height*/){
            if(NW.isNative){
                return this._comm('browser', Array.array(arguments));
            }

            return this._super(OjWindowManager, 'browser', arguments);
        },

        'call' : function(phone){
            if(NW.isNative){
                return this._comm('call', Array.array(arguments));
            }

            return this._super(OjWindowManager, 'call', arguments);
        },

        'email' : function(email){
            if(NW.isNative){
                return this._comm('email', [email]);
            }

            return this._super(OjWindowManager, 'email', arguments);
        },

        'makeActionCard' : function(/*actions, title = null, cancel_lbl = "Cancel", cancel_icon = null*/){
            return this._actionCardClass.makeNew(arguments);
        },

        'position' : function(modal){
            if(this._isMobileAC(modal)){
                var w = modal.width,
                    h = modal.height,
                    w2 = modal.paneWidth,
                    h2 = modal.paneHeight;

                modal.pane.x = (w - w2) / 2;
                modal.pane.y = h - h2;

                return;
            }

            this._super(OjWindowManager, 'position', arguments);
        },

        'show' : function(modal, depth){
            var self = this,
                args = [modal, depth],
                holder = self._modal_holder;

            // find the lowest AppMessage
            holder.forChild(function(child, index){
                if(child.is(NwAppMessage)){
                    args[1] = index;

                    return false;
                }
            });

            self._super(OjWindowManager, 'show', args);
        },

        'txt' : function(phone, message){
            if(NW.isNative){
                return this._comm('txt', Array.array(arguments));
            }

            return this._super(OjWindowManager, 'txt', arguments);
        }
    }
);

OJ.importJs('oj.components.OjComponent');
OJ.importJs('oj.form.OjTextInput');
OJ.importJs('oj.menu.OjMenuManager');

OJ.importCss('nw.list.NwFilterBar');


'use strict';

OJ.extendClass(
	OjComponent, 'NwFilterBar',
	{
		'_props_' : {
			'list' : null
		},

		'filter_btn' : null,  'filter_menu' : null,  'search_box' : null,  'sort_btn' : null,  'sort_menu' : null,


		'_constructor' : function(/*list*/){
			this._super('NwFilterBar', '_constructor', []);

			var ln = arguments.length;

			if(ln){
				this.setList(arguments[0]);
			}

			// sort menu
			this.addChild(this.sort_btn = new OjButton());
			this.sort_btn.addClasses('-sort_btn');

			this.sort_menu = MenuManager.register(
				this.sort_btn,
				new OjList(['Relevance', 'A-Z', 'Z-A', 'Newest', 'Oldest']),
				[OjMenu.BOTTOM_RIGHT]
			);

			this.sort_menu.getContent().addEventListener(OjListEvent.ITEM_CLICK, this, '_onSortClick');

			// filter button
			this.addChild(this.filter_btn = new OjButton());
			this.filter_btn.addClasses('-filter_btn');

			this.filter_menu = MenuManager.register(
				this.filter_btn,
				new OjList(['Relevance', 'A-Z', 'Z-A', 'Newest', 'Oldest']),
				[OjMenu.BOTTOM_RIGHT]
			);

			// keyword search input
			this.addChild(this.search_box = new OjTextInput());
			this.search_box.addClasses('-search_box');
			this.search_box.addEventListener(OjEvent.CHANGE, this, '_onKeywordChange');
//				this.search_box.setDefault('Search');
		},


		'_onKeywordChange' : function(evt){
			if(this._list){
				this._list.setKeywords(this.search_box.getValue());
			}
		},

		'_onFilterChange' : function(evt){
			if(this._list){
//					this._list.setFilter();
			}
		},

		'_onSortClick' : function(evt){
			if(this._list){
				var sorting, index = evt.getIndex();

				if(index == 1){
					sorting = NwFilterList.SORT_AZ;
				}
				else if(index == 2){
					sorting = NwFilterList.SORT_ZA;
				}
				else if(index == 3){
					sorting = NwFilterList.SORT_NEWEST;
				}
				else if(index == 4){
					sorting = NwFilterList.SORT_OLDEST;
				}
				else{
					sorting = NwFilterList.SORT_RELEVANCE;
				}

				this._list.setSorting(sorting);
			}

			MenuManager.hide(this.sort_menu);
		}
	}
);
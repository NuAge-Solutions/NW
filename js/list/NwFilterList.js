OJ.importJs('nw.list.NwFilterBar');
OJ.importJs('oj.list.OjList');


'use strict';

OJ.extendClass(
	OjList, 'NwFilterList',
	{
		'_props_' : {
			'filters'   : null,
			'filterBar' : null,
			'keywords'  : null,
			'sorting'   : 'filterListSortRelevance' // NwFilterList.SORT_RELEVANCE
		},

		'_filter_list' : null,  '_filtered_provider' : null,  '_keyword_list' : null,  '_scores' : null,


		'_constructor' : function(/*data_provider, item_renderer, direction*/){
			var rtrn = this._super('NwFilterList', '_constructor', arguments);

			this.setFilterBar(new NwFilterBar());

			return rtrn;
		},

		'_setDom' : function(dom_elm){
			this._super('NwFilterList', '_setDom', arguments);

			this.container = new OjStyleElement();

			var ln = this.numChildren();

			while(ln-- > 0){
				this.container.addChildAt(this.getChildAt(ln), 0);
			}

			this.addChild(this.container);
		},


		'_applyFiltersAndSorting' : function(/*keywords, filters*/){
			var ln = arguments.length;

			this._setKeywords(ln > 0 ? arguments[0] : this._keywords);
			this._setFilters(ln > 1 ? arguments[1] : this._filters);

			this._redrawItems();
		},

		'_redrawItems' : function(){
			var src1, src2, ln, ln2, i, item;

			if(this._filter_list && this._filter_list.numItems()){
				src1 = this._filter_list;
				src2 = this._keyword_list;
			}
			else if(this._keyword_list){
				src1 = this._keyword_list;
				src2 = this._filter_list;
			}

			if(src1){
				if(src2){
					this._filtered_provider = new OjCollection();

					ln = src1.numItems();
					ln2 = src2.numItems();

					while(ln-- > 0){
						item = src1.getItemAt(ln);

						for(i = 0; i < ln2; i++){
							if(src2.getItemAt(i) == item){
								this._filtered_provider.addItem(item);

								break;
							}
						}
					}
				}
				else{
					this._filtered_provider = src1;
				}
			}
			else{
				this._filtered_provider = this._data_provider;
			}

			// run the sorting
			var sort_func = '_sortByRelevance';

			if(this._sorting == NwFilterList.SORT_NEWEST){
				sort_func = '_sortByNewest';
			}
			else if(this._sorting == NwFilterList.SORT_OLDEST){
				sort_func = '_sortByOldest';
			}
			else if(this._sorting == NwFilterList.SORT_AZ){
				sort_func = '_sortByAz';
			}
			else if(this._sorting == NwFilterList.SORT_ZA){
				sort_func = '_sortByZa';
			}

			this._filtered_provider.sort(this[sort_func].bind(this));

			this._super('NwFilterList', '_redrawItems', arguments);
		},

		'_sortByAz' : function(a, b){
			return a.title() > b.title();
		},

		'_sortByNewest' : function(a, b){
			return this._scores[b.id()] - this._scores[a.id()];
		},

		'_sortByOldest' : function(a, b){
			return this._scores[b.id()] - this._scores[a.id()];
		},

		'_sortByRelevance' : function(a, b){
			return this._scores[b.id()] - this._scores[a.id()];
		},

		'_sortByZa' : function(a, b){
			return a.title() < b.title();
		},


		// item management functions
		'addItem' : function(item){
			var rtrn = this._data_provider.addItem(item);

			this._applyFiltersAndSorting();

			return rtrn;
		},

		'addItemAt' : function(item, index){
			return this.addItem(item);
		},

		'getItemAt' : function(index){
			return this._filtered_provider.getItemAt(index);
		},

		'getItemIndex' : function(item){
			return this._filtered_provider.getItemIndex(item);
		},

		'hasItem' : function(item){
			return this._filtered_provider.hasItem(item);
		},

		'numItems' : function(){
			return this._filtered_provider.numItems();
		},

		'removeItem' : function(item){
			var rtrn = this._data_provider.removeItem(item);

			this._applyFiltersAndSorting();

			return rtrn;
		},

		'removeItemAt' : function(index) {
			return this.removeItem(this.getItemAt(index));
		},


		'_onItemAdd' : function(evt){
			this._applyFiltersAndSorting();

			// let everyone else know that we just added an item
			this.dispatchEvent(new OjListEvent(OjListEvent.ITEM_ADD, evt.getItem(), evt.getIndex()));
		},

		'_onItemMove' : function(evt){
			this.dispatchEvent(new OjListEvent(OjListEvent.ITEM_MOVE, evt.getItem(), evt.getIndex()));
		},

		'_onItemRemove' : function(evt){
			this._applyFiltersAndSorting();

			this.dispatchEvent(new OjListEvent(OjListEvent.ITEM_REMOVE, evt.getItem(), evt.getIndex()));
		},

		'_onItemReplace' : function(evt){
			this._applyFiltersAndSorting();

			this.dispatchEvent(new OjListEvent(OjListEvent.ITEM_REPLACE, evt.getItem(), evt.getIndex()));
		},


		'_setFilters' : function(filters/*, data_provider*/){
			var do_filter = !isEmpty(filters);
			var source = arguments.length > 1 ? arguments[1] : this._data_provider;
			var ln, item, valid;

			this._filter_list = new OjCollection();
			this._filters = filters;

			if(source){
				ln = source.numItems();

				while(ln-- > 0){
					item = source.getItemAt(ln);
					valid = true;

					if(do_filter){
						// check filters
					}

					if(valid){
						this._filter_list.addItem(item);
					}
				}
			}
		},
		'setFilters' : function(filters){
			if(this._filters == filters){
				return;
			}

			this._setFilters(filters);

			this._redrawItems();
		},

		'setFilterBar' : function(filter_bar){
			if(this._filterBar){
				this._filterBar.setList(null);

				this.removeChild(this._filterBar);
			}

			this._filterBar = filter_bar;

			if(this._filterBar){
				this._filterBar.setList(this);

				this.addChildAt(this._filterBar, 0);
			}
		},

		'_setKeywords' : function(keywords/*, data_provider*/){
			// add in processing for splitting on , +
			var do_search = !isEmpty(keywords);
			var source = arguments.length > 1 ? arguments[1] : this._data_provider;
			var ln, item, score;

			this._keyword_list = new OjCollection();
			this._keywords = keywords;
			this._scores = {};

			if(source){
				ln = source.numItems();

				while(ln-- > 0){
					item = source.getItemAt(ln);
					score = 1;

					if(do_search){
						score = item.keywordScore(keywords);
					}

					if(score){
						this._scores[item.id()] = score;
						this._keyword_list.addItem(item);
					}
				}
			}
		},
		'setKeywords' : function(keywords){
			if(this._keywords == keywords){
				return;
			}

			this._setKeywords(keywords);

			this._redrawItems();
		},

		'setSorting' : function(sorting){
			if(this._sorting == sorting){
				return;
			}

			this._sorting = sorting;

			this._redrawItems();
		},


		'setDataProvider' : function(data_provider){
			this._filtered_provider = new OjCollection(data_provider);

			this._setKeywords(this._keywords, this._filtered_provider);
			this._setFilters(this._filters, this._filtered_provider);

			return this._super('NwFilterList', 'setDataProvider', arguments);
		}
	},
	{
		'SORT_AZ'        : 'filterListSortAZ',
		'SORT_NEWEST'    : 'filterListSortNewest',
		'SORT_OLDEST'    : 'filterListSortOldest',
		'SORT_RELEVANCE' : 'filterListSortRelevance',
		'SORT_ZA'        : 'filterListSortZA'
	}
);
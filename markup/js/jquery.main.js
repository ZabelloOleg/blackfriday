jQuery(function() {
	initFiltering();
});

// filtering init
function initFiltering() {
	jQuery('.sales-filter').filteringItems({
		items: '.link-list > li',
		filterLinks: '.sort-list [data-filter]',
		searchField: '.search-form [type="search"]',
		filterHolder: '.link-list',
		btnMore: '.load-more',
		searchOnTyped: false,
		loadOnce: false,
		itemsPerPage: 15,
		delay: 300
	});
}

/* Filtering plugin */
;(function($) {
	function FilteringItems(options) {
		this.options = $.extend({
			items: '.item',
			searchField: '.search-field',
			filterHolder: '.filtration-holder',
			searchForm: '.search-form',
			activeClass: 'active',
			hiddenClass: 'hidden',
			noLoadedClass: 'hidden-item',
			loadingClass: 'loading',
			noResultsClass: 'no-results',
			btnSearch: '.btn-search',
			btnMore: '.btn-more',
			searchOnTyped: false,
			loadOnce: false,
			itemsPerPage: 10,
			delay: 500
		}, options);

		this.init();
	}

	FilteringItems.prototype = {
		init: function() {
			if (this.options.holder) {
				this.findElements();
				this.attachEvents();
				this.makeCallback('onInit', this);
			}
		},
		findElements: function() {
			this.page = $('html, body');
			this.holder = $(this.options.holder);
			this.items = this.holder.find(this.options.items).addClass(this.options.noLoadedClass);
			this.filterHolder = this.holder.find(this.options.filterHolder);
			this.searchField = this.holder.find(this.options.searchField);
			this.searchForm = this.holder.find(this.options.searchForm);
			this.filterLinks = this.holder.find(this.options.filterLinks);
			this.btnSearch = this.holder.find(this.options.btnSearch);
			this.btnMore = this.holder.find(this.options.btnMore);
			this.activeFilters = [];
			this.activeItems = this.items;
			this.ajaxBusy = false;
			this.isLoaded = false;
			this.timer = null;
			this.count = 0;
		},
		attachEvents: function() {
			var self = this;

			this.filterLinks.each(function() {
				var link = $(this);
				var filter = link.data('filter');

				if (link.hasClass(self.options.activeClass)) {
					self.activeFilters = [filter];
					self.searchItems();
				}

				link.on('click', function(e) {
					e.preventDefault();

					if (link.hasClass(self.options.activeClass)) {
						link.removeClass(self.options.activeClass);

						var index = self.activeFilters.indexOf(filter);

						if (index > -1) {
							self.activeFilters.splice(index, 1);
						}
					} else {
						self.filterLinks.removeClass(self.options.activeClass);
						link.addClass(self.options.activeClass);
						self.activeFilters = [filter];
					}

					self.searchItems();
				});
			});

			this.searchForm.on('submit', function(e) {
				e.preventDefault();
				self.searchItems();
			});

			this.btnSearch.on('click', function(e) {
				e.preventDefault();
				self.searchItems();
			});

			if (this.options.searchOnTyped) {
				this.searchField.on('keyup', function() {
					clearTimeout(self.timer);

					self.timer = setTimeout(function() {
						self.searchItems();
					}, 200);
				});
			}

			this.btnMore.on('click', function(e) {
				e.preventDefault();

				if (self.activeItems.length > self.count) {
					self.loadBoxes(true, true);

					if (self.options.loadOnce) {
						self.isLoaded = true;
					}
				}
			});

			this.loadBoxes(false, false);
		},
		searchItems: function() {
			var value = this.searchField.val().trim().toLowerCase();

			this.items.addClass(this.options.hiddenClass);
			this.holder.removeClass(this.options.noResultsClass);

			if (!this.isLoaded) {
				this.items.addClass(this.options.noLoadedClass);
				this.btnMore.addClass(this.options.noLoadedClass);
				this.count = 0;
			}

			this.activeItems = this.items.filter(function(ind, item) {
				var matched = false;
				var text = $(item).data('tags').toLowerCase().split(',');

				for (var i = 0; i < text.length; i++) {
					if (value !== '') {
						if (text[i].trim().indexOf(value) !== -1) {
							matched = true;
						}
					}
				}

				if (value === '') {
					matched = true;
				}

				return matched;
			});

			this.filterItems();
		},
		filterItems: function() {
			var self = this;

			for (var i = 0; i < this.activeFilters.length; i++) {
				filter(i);
			}

			function filter(i) {
				self.activeItems = self.activeItems.filter(function() {
					var matched = false;
					var item = $(this);
					var categories = item.data('category').trim().toLowerCase().split(',');

					categories = categories.map(function(el) {
						return el.trim();
					});

					if (categories.includes(self.activeFilters[i].trim().toLowerCase())) {
						matched = true;
					}

					return matched;
				});
			}

			if (!this.isLoaded) {
				this.activeItems.addClass(this.options.noLoadedClass);
				this.count = 0;
			}

			this.makeCallback('onFilter', this.activeItems);
			this.loadBoxes(true, false);

			setTimeout(function() {
				self.page.animate({
					scrollTop: self.holder.offset().top - 10
				});
			}, this.options.delay);
		},
		loadBoxes: function(isAnim, state) {
			var self = this;
			var nextItems = $();

			if (state) {
				nextItems = this.items;
			} else {
				nextItems = this.activeItems.slice(this.count, this.count + this.options.itemsPerPage);
			}

			this.ajaxBusy = true;
			this.count += this.options.itemsPerPage;

			if (isAnim) {
				this.holder.addClass(this.options.loadingClass);
			}

			setTimeout(function() {
				self.activeItems.removeClass(self.options.hiddenClass);
				self.holder.removeClass(self.options.loadingClass);
				nextItems.removeClass(self.options.noLoadedClass);

				if (!self.activeItems.filter('.' + self.options.noLoadedClass).length) {
					self.btnMore.addClass(self.options.noLoadedClass);
				} else {
					if (!self.isLoaded) {
						self.btnMore.removeClass(self.options.noLoadedClass);
					}
				}

				if (!self.activeItems.length) {
					self.holder.addClass(self.options.noResultsClass);
				}

				self.ajaxBusy = false;
			}, isAnim ? this.options.delay : 0);
		},
		makeCallback: function(name) {
			if (typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);

				args.shift();
				this.options[name].apply(this, args);
			}
		}
	};

	// jQuery plugin interface
	$.fn.filteringItems = function(opt) {
		return this.each(function() {
			$(this).data('FilteringItems', new FilteringItems($.extend(opt, {
				holder: this
			})));
		});
	};
}(jQuery));
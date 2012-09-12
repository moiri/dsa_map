/**
 * Menu class with fundamental methods
 */
function Menu() {
	var me = this;
	me.mode;
	me.eyeWidth = 22;
	me.binder = [];
	me.binder.drawElement = [];
	me.binder.drawElement.clickCb = function () {
		alert('no drawElement click event binded, use "setEventBinderDrawElement" to define the event');
	};
	
	me.binder.toggleMenu = [];
	me.binder.toggleMenu.clickCb = function () {
		alert('no toggleMenu click event binded, use "setEventBinderToggleMenu" to define the event');
	};

	/**
	 * bind click elemnt to eye hiding and showing the menu
	 * 
	 * @param string id: menu id
	 * @param obj eyeAttr: object definig animate properties of the eye button
	 * @param obj midAttr: object definig animate properties of the mid column
	 */
	this.bindEye = function (id, eyeAttr, midAttr) {
		// bind show and hide clicks
		$('#button-' + id).unbind('click');
		$('#button-' + id).bind('click', function () {
			var eye, delta;
			delta = 3;
			eye = this;
			if ($(eye).hasClass('close')) {
				$(eye).animate(eyeAttr.open, 'fast', 'swing');
				$('#map-canvas').animate({
					width: $('#map-canvas').width() - me.width + me.eyeWidth + delta + 'px',
				}, 'fast', 'swing');
				$('.midColumn').animate(midAttr.open,'fast', 'swing', function () {
					$('#' + id).fadeIn('fast', 'swing', me.binder.toggleMenu.clickCb);
				});
			}
			else {
				$('#' + id).fadeOut('fast', 'swing', function () {
					$(eye).animate(eyeAttr.close, 'fast', 'swing');
					$('#map-canvas').animate({
						width: $('#map-canvas').width() + me.width - me.eyeWidth - delta + 'px',
					}, 'fast', 'swing');
					$('.midColumn').animate(midAttr.close, 'fast', 'swing', me.binder.toggleMenu.clickCb);
				});
			}
			$(eye).toggleClass('close');
		});
	};
	
	/**
	 * 
	 */
	this.setEventBinderDrawElement = function (eStr, cb) {
		if (eStr === 'click') {
			me.binder.drawElement.clickCb = cb;
		}
		else {
			alert('setEventBinderDrawElement: bad eStr');
		}
	};
	
	/**
	 * 
	 */
	this.setEventBinderToggleMenu = function (eStr, cb) {
		if (eStr === 'click') {
			me.binder.toggleMenu.clickCb = cb;
		}
		else {
			alert('setEventBinderToggleMenu: bad eStr');
		}
	};

	/**
	 * send active mode id to server
	 * 
	 * @param string mode: active mode id
	 * @param func cb: this callback function is executed on sucess
	 * @param obj cbo: callback scope (optional)
	 */
	this.setMode = function (mode, cb, cbo) {
		if (cbo === undefined) {
			cbo = this;
		}
		$.ajax({
			url: "php/ajax/setMode.php?mode=" + mode,
		}).done(function (data) { 
			if (parseInt(data, 10) >= 0) {
				me.mode = mode;
				cb.call(cbo);
			}
		});
	};
	
	/**
	 * set menu width
	 * 
	 * @param int width: menu width
	 */
	this.setWidth = function (width) {
		me.width = width;
	}
}


/**
 * MainMenu class, child of Menu class
 * 
 * @param string destId: destination id to draw main menu to
 */
function MainMenu(destId, cache) {
	var me = this;
	me.destId = destId;
	me.images = cache.images;
	me.activeElems = cache.activeElems;
	me.binder.freeMode = [];
	me.binder.freeMode.clickCb = function () {
		alert('no freeMode click event binded, use "setEventBinderFreeMode" to define the event');
	};

	/**
	 * get menu content with ajax and on success draw it
	 * 
	 * @param string pattern: serach pattern
	 */
	this.drawContent = function (pattern) {
		var url;
		url = 'php/ajax/getJson.php?j=content';
		if ((pattern !== undefined) && (pattern !== '')) {
			url += '&pattern=' + pattern;
		}
		$.getJSON(url, me.drawContentCb);
	};

	/**
	 * draw menu content int main menu (callback from drawContent)
	 * 
	 * @param array data: json array with data to draw 
	 */
	this.drawContentCb = function (data) {
		var selectContent, mode, activeMode;
		selectContent = '#' + me.destId + '-content';
		$(selectContent).html('');
		$('#' + me.destId + '-search').hide();
		if (data === -99) {
			$(selectContent).append('<div>server error</div>');
			return;
		}
		else if (data.main.mode === 'free') {
			$(selectContent).append('<div>free mode</div>');
			return;
		}
		else {
			lvl = 1;
			if ((activeMode = me.activeElems.mode[data.main.modeIdTree[lvl]]) !== undefined) {
				while (activeMode.elements === undefined) {
					lvl++;
					if ((activeMode = activeMode.mode[data.main.modeIdTree[lvl]]) === undefined) {
						break;
					}
				}
			}
			mode = data.main.mode;
			$('#' + me.destId + '-search').show();
			$('[id^="drawElement-"]').unbind();
			$.each(data, function (key, val) {
				var selectCategoryEntries, selectCategory;
				selectCategoryEntries = selectContent;
				if ((key !== 'main') && (mode !== 'search')) {
					$(selectContent).append('<div id="category-' + val.id + '" class="categoryTitle"></div>');
					selectCategory = '#category-' + val.id;
					$(selectCategory).append('<div class="categoryEye"></div>');
					$(selectCategory).append('<div class="categoryTitleText">' + key + '</div>');
					$(selectContent).append('<div id="category-' + val.id + '-entries" class="category"></div>');
					selectCategoryEntries += ' > ' + selectCategory + '-entries';
				}
				$.each(val.entries, function (key, val) {
					var selected;
					selected = '';
					if ((me.images.draw !== undefined) && 
							(me.images.draw[data.main.activeMode + '-' + val.id] !== undefined) &&
							me.images.draw[data.main.activeMode + '-' + val.id]) {
						selected = ' selected';
					}
					$('<div id="drawElement-' + data.main.activeMode + '-' + val.id + '" class="drawElement' + selected + '">' + val.name + '</div>').appendTo(selectCategoryEntries).bind('click', function () {
						me.binder.drawElement.clickCb.call(this, me);
					});
					
					if ((activeMode !== undefined) && (activeMode.counter > 0)) {
						if ((activeMode.elements[val.id] !== undefined) && (activeMode.elements[val.id])) {
							$(selectCategory).children('div.categoryEye').addClass('open');
							$(selectCategory).next().show();
						}
					}
				});
			});
			$('.categoryTitle').unbind('click');
			$('.categoryTitle').bind('click', function () {
				$(this).children('div.categoryEye').toggleClass('open');
				$(this).next().toggle('fast');
			});
		}
	};

	/**
	 * get main menu tabs with ajax and on success draw it
	 * 
	 * @param func cb: callback function to be evoked after completion of menu draw
	 */
	this.drawMenu = function (cb) {
		var url;
		url = "php/ajax/getJson.php?j=tab";
		$.getJSON(url, function (data) {
			me.drawMenuCb(data, cb);
		});
	};

	/**
	 * draw main menu tabs (callback from drawTabs)
	 * 
	 * @param array data: json array with data to draw 
	 * @param func cb: callback function to be evoked after completion of menu draw
	 */
	this.drawMenuCb = function (data, cb) {
		var iteration, items, eyeAttr, midAttr;
		items = [];
		// define animate attributes (close / open menu) 
		eyeAttr = [];
		eyeAttr.open = {
				top: '18px',
				left: '18px'
		};
		eyeAttr.close = {
				top: '8px',
				left: '8px'
		};

		midAttr = [];
		midAttr.open = {
				marginLeft: '275px',
		};
		midAttr.close = {
				marginLeft: '34px',
		};

		iteration = function (menu, destId, modeId, modeIdIt, lvl) {
			var id, myId, cssClass;
			myId = id = 'tabCont-' + modeId;
			cssClass = 'tabCont l' + lvl;
			if (lvl === 1) {
				// create container for tabs on top
				myId = 'tabContTitle-' + modeId;
				id = destId;
				cssClass = 'tabContTitle';
			}
			$('<div/>', {
				'id': myId,
				'class': cssClass
			}).appendTo('#' + destId);
			$.each(menu, function(key, val) {
				// iterate through tab elements
				var cssClass, imgCssClass;
				cssClass = 'tab l' + lvl;
				if ((key === 0) && (lvl === 1)) {
					cssClass += ' active';
				}
				imgCssClass = "tabModeId_" + val.id;
				$('html > head > style').append(" ." + imgCssClass + " { background: url('img/" + val.iconPath + "') no-repeat scroll 50% top; }\n");
				$('html > head > style').append(" ." + imgCssClass + ".selected { background: url('img/" + val.iconPath.replace(/\./g, "_sel.") + "') no-repeat scroll 50% top; }\n");
				//$('html > head > style').append(" ." + imgCssClass + ":hover { background: url('img/" + val.iconPath.replace(/\./g, "_hov.") + "') no-repeat scroll 50% top; }\n");
				//$('html > head > style').append(" ." + imgCssClass + ".selected:hover { background: url('img/" + val.iconPath.replace(/\./g, "_hov_sel.") + "') no-repeat scroll 50% top; }\n");
				cssClass += ' ' + imgCssClass;
				cssClass += (val.freeMode === '1') ? ' free' : '';
				$('<div/>', {
					'id': 'mode-' + modeIdIt + '-' + val.id,
					'class': cssClass,
					'title' : val.name
				}).appendTo('#' + myId);

				if (val.submenu !== undefined) {
					// a submenu is available, do recursive iteration
					iteration(val.submenu, id, val.id, modeIdIt + '-' + val.id, lvl + 1);
				}
			});
		}

		iteration(data, me.destId, 0, 0, 1);
		$('#' + destId).append('<div class="contentBox border"></div>');
		$('#' + me.destId + ' > div.contentBox').append('<input id="menu-main-search" class="search init" type="text" />');
		$('#' + me.destId + ' > div.contentBox').append('<div id="menu-main-content" class="content"></div>');
		me.setMode('13', function () {
			me.drawContent();
		});

		// bind mode change click events
		$('[id^="mode-"]').unbind('click');
		$('[id^="mode-"]').bind('click', function () {
			var idElem, i, id, lastId, myId, url;
			$('[id^="tabCont-"]').hide();
			$('[id^="mode-"]').removeClass('active');
			$('#' + me.destId + '-search').val('Suche');
			$('#' + me.destId + '-search').addClass('init');

			idElem = $(this).attr('id').split('-');
			idElem.shift(); // remove descripter (keep only ids)

			while(myId = $('#tabCont-' + idElem[idElem.length - 1]).children('[id^="mode-"]:first').attr('id')) {
				idElem = myId.split('-');
				idElem.shift(); // remove descripter (keep only ids)
			}

			id = '';
			for (i = 0; i < idElem.length; i++) {
				id += '-' + idElem[i];
				$('#tabCont-' + idElem[i]).show(); // show backwards
				$('#mode' + id).addClass('active'); // set active backwards
				lastId = idElem[i];
			}

			me.setMode(lastId, function () {
				me.drawContent();
			});
			
			if ($(this).hasClass('free')) {
				me.binder.freeMode.clickCb.call(me);
			}
		});

		// bind search key up events
		$('#' + me.destId + '-search').unbind('keyup');
		$('#' + me.destId + '-search').bind('keyup', function () {
			me.drawContent($(this).val());
		});

		// bind search key up events
		$('#' + me.destId + '-search').unbind('click');
		$('#' + me.destId + '-search').bind('click', function () {
			if ($(this).val() === 'Suche') {
				$(this).val('');
				$('#' + me.destId + '-search').removeClass('init');
			}
		});

		me.setWidth($('#' + destId).width() + 50);
		$('#map-canvas').width($('#map-canvas').width() - me.width - me.eyeWidth);
		me.bindEye(me.destId, eyeAttr, midAttr);
		cb();
	};
	
	/**
	 * 
	 */
	this.setEventBinderFreeMode = function (eStr, cb) {
		if (eStr === 'click') {
			me.binder.freeMode.clickCb = cb;
		}
		else {
			alert('setEventBinderFreeMode: bad eStr');
		}
	};
}

MainMenu.prototype = new Menu();

/**
 * InfoMenu class, child of Menu class
 * 
 * @param string destId: destination id to draw info menu to
 * @param func cb: this callback function is executed onclick on the eye
 */
function InfoMenu(destId) {
	var me = this;
	me.destId = destId;

	/**
	 * draw the menu
	 * 
	 * @param func cb: callback function to be evoked after completion of menu draw
	 */
	this.drawMenu = function (cb) {
		var eyeAttr, midAttr;
		// define animate attributes (close / open menu) 
		eyeAttr = [];
		eyeAttr.open = {
				top: '18px',
				right: '18px'
		};
		eyeAttr.close = {
				top: '8px',
				right: '8px'
		};

		midAttr = [];
		midAttr.open = {
				marginRight: '210px',
		};
		midAttr.close = {
				marginRight: '34px',
		};

		me.setWidth($('#' + destId).width());
		$('#map-canvas').width($('#map-canvas').width() - me.width - me.eyeWidth);
		me.bindEye(me.destId, eyeAttr, midAttr);
		cb();
	};
}

InfoMenu.prototype = new Menu();
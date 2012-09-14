/**
 * Menu class with fundamental methods
 */
function Menu() {
	var me = this;
	me.mode;
	me.eyeWidth = 22;
	me.cssSelected = 'selected';
	me.cssActive = 'active';
	me.binder = [];
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
	 * Setter to bind an event on the eyes closing and opening a menu.
	 * This is used if the binded function must acces other objects than menu
	 * 
	 * @param string eStr: string to define the event
	 * @param function cb: callback function to be evoked when event occures
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
 * @param object cache: reference to cache object, containing the stored images and the active elements array
 */
function MainMenu(destId, cache) {
	var me = this;
	me.destId = destId;
	me.images = cache.images;
	me.activeElems = cache.activeElems;
	me.binder.activeElement = [];
	me.binder.activeElement.clickCb = function () {
		alert('no activeElement click event binded, use "setEventBinderActiveElement" to define the event');
	};
	me.binder.clearActiveElement = [];
	me.binder.clearActiveElement.clickCb = function () {
		alert('no clearActiveElement click event binded, use "setEventBinderClearActiveElement" to define the event');
	};
	me.binder.clearActiveElements = [];
	me.binder.clearActiveElements.clickCb = function () {
		alert('no clearActiveElements click event binded, use "setEventBinderClearActiveElements" to define the event');
	};
	me.binder.drawElement = [];
	me.binder.drawElement.clickCb = function () {
		alert('no drawElement click event binded, use "setEventBinderDrawElement" to define the event');
	};
	me.binder.freeMode = [];
	me.binder.freeMode.clickCb = function () {
		alert('no freeMode click event binded, use "setEventBinderFreeMode" to define the event');
	};

	/**
	 * clear all active elements from the cache (it does not remove the cached images)
	 */
	this.clearActiveElements = function () {
		var id, selfObj;
		selfObj = this;
		$('[id|="mode"]').removeClass(selfObj.cssSelected);
		selfObj.activeElems.mode = [];
		selfObj.activeElems.counter = 0;
		for (id in selfObj.images.draw) {
			selfObj.images.draw[id] = false;
		}
		$('#free-category-active-entries').html('');
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
		$.getJSON(url, function (data) {
			me.drawContentCb.call(me, data);
		});
	};

	/**
	 * draw menu content int main menu (callback from drawContent)
	 * 
	 * @param array data: json array with data to draw 
	 */
	this.drawContentCb = function (data) {
		var selectContent, mode, activeMode, drawActiveElements, selector;
		selectContent = '#' + me.destId + '-content';
		$(selectContent).html('');
		$('#' + me.destId + '-search').hide();
		if (data === -99) {
			$(selectContent).append('<div>server error</div>');
			return;
		}
		else if (data.main.mode === 'free') {
			me.drawFreeContent.call(me);
		}
		else {
			me.drawListContent.call(me, data);
		}
		$('.categoryTitle').unbind('click');
		$('.categoryTitle').bind('click', function () {
			$(this).children('div.categoryEye').toggleClass('open');
			$(this).next().toggle('fast');
		});
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
	 * draws the content of the free mode menu
	 */
	this.drawFreeContent = function () {
		var selector, drawActiveElements, selfObj, selectContent;
		selfObj = this;
		selectContent = '#' + selfObj.destId + '-content';
		$(selectContent).html('');
		if (selfObj.activeElems.counter > 0) {
			$(selectContent).append('<div id="free-category-active" class="categoryTitle"></div>');
			$('#free-category-active').append('<div id="activeElementsClear" class="clearElement" title="Alle Elemente deaktivieren"></div>')
			$('#free-category-active').append('<div class="categoryEye open"></div>');
			$('#free-category-active').append('<div class="categoryTitleText">Aktive Elemente</div>');
			$(selectContent).append('<div id="free-category-active-entries" class="category"></div>');
			$('#free-category-active-entries').show();

			/**
			 * 
			 */
			drawActiveElements = function (mode, selector) {
				var id, elemId;
				for (id in mode) {
					if (mode.hasOwnProperty(id) && (mode[id].counter > 0)) {
						$(selector).append('<div id="activeMode-' + id + '" class="activeMode"></div>');
						$('#activeMode-' + id).append('<div id="activeMode-' + id + '-title" class="activeModeTitle">' + mode[id].name + '</div>');
						if (mode[id].elements !== undefined) {
							// write out entries
							$('#activeMode-' + id).append('<div id="activeMode-' + id + '-entries" class="activeModeEntries"></div>');
							//mode[id].elements.sort();
							for (elemId in mode[id].elements) {
								if (mode[id].elements.hasOwnProperty(elemId)) {
									$('#activeMode-' + id + '-entries').append('<div id="activeElementClear-' + id + '-' + elemId +'" class="clearElement" title="Element deaktivieren"></div>')
									.append('<div id="activeElement-' + id + '-' + elemId +'" class="drawElement" title="Element auswählen">' + mode[id].elements[elemId] + '</div>');
									$()
								}
							}
						}
						else {
							drawActiveElements(mode[id].mode, '#activeMode-' + id);
						}
					}
				}
			};

			selector = '#free-category-active-entries';
			drawActiveElements(selfObj.activeElems.mode, selector);
			$('[id|="activeElement"]').unbind('click');
			$('[id|="activeElement"]').bind('click', function () {
				selfObj.binder.activeElement.clickCb.call(this, me);
			});
			$('[id|="activeElementClear"]').unbind('click');
			$('[id|="activeElementClear"]').bind('click', function () {
				selfObj.binder.clearActiveElement.clickCb.call(this, me);
			});
			$('#activeElementsClear').unbind('click');
			$('#activeElementsClear').bind('click', function () {
				selfObj.binder.clearActiveElements.clickCb.call(selfObj);
			});
		}
	};
	
	/**
	 * draws the content of menus showing element lists (not free mode)
	 * 
	 * @param object data: json object containing all elements to be drawn
	 */
	this.drawListContent = function (data) {
		var lvl, selectContent, mode, activeMode, drawActiveElements, selector;
		selfObj = this;
		selectContent = '#' + selfObj.destId + '-content';
		$(selectContent).html('');
		lvl = 1;
		if ((activeMode = selfObj.activeElems.mode[data.main.modeIdTree[lvl]]) !== undefined) {
			while (activeMode.elements === undefined) {
				lvl++;
				if ((activeMode = activeMode.mode[data.main.modeIdTree[lvl]]) === undefined) {
					break;
				}
			}
		}
		mode = data.main.mode;
		$('#' + selfObj.destId + '-search').show();
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
				var selected, title;
				selected = '';
				title = 'Element aktivieren';
				if ((selfObj.images.draw !== undefined) && 
						(selfObj.images.draw[data.main.activeMode + '-' + val.id] !== undefined) &&
						selfObj.images.draw[data.main.activeMode + '-' + val.id]) {
					selected = ' ' + selfObj.cssSelected;
					title = 'Element auswählen';
				}
				$('<div id="drawElement-' + data.main.activeMode + '-' + val.id + '" class="drawElement' + selected + '" title="' + title + '">' + val.name + '</div>').appendTo(selectCategoryEntries)
				.bind('click', function () {
					selfObj.binder.drawElement.clickCb.call(this, me);
				});

				if ((activeMode !== undefined) && (activeMode.counter > 0)) {
					if ((activeMode.elements[val.id] !== undefined) && (activeMode.elements[val.id])) {
						$(selectCategory).children('div.categoryEye').addClass('open');
						$(selectCategory).next().show();
					}
				}
			});
		});
	};
	
	/**
	 * manages the active elements array (adds and removes items) and the tab css classes
	 * (adds and removes classes to show if an active element is in the corresponding tab or not)
	 * 
	 * @param string id: id of the element to be removed or added to the active elements
	 * @param string name: name of the element to be removed or added to the active elements
	 * @param string modeId: id of the active mode corresponding to the element
	 * @param bool draw: if true, the element is added, else it is removed
	 */
	this.handleActiveElements = function (id, name, modeId, draw) {
		var activeModeArr, hasActiveElems, tabModeId, selfObj;
		selfObj = this;

		// highlight tabs and elements if active
		$('[id|="mode-0"][id$="-' + modeId + '"]').each(function () {
			var tabId, i, j;
			tabId = $(this).attr('id').split('-');
			tabId.shift();
			// build activeElements Array
			activeModeArr = [];
			activeModeArr[1] = [];
			if ((activeModeArr[1].mode = me.activeElems.mode) === undefined) {
				activeModeArr[1].mode = [];
			}
			for (i = 1; i < tabId.length; i++) {
				tabModeId = tabId[i];
				if (activeModeArr[i].mode[tabModeId] === undefined) {
					activeModeArr[i].mode[tabModeId] = [];
					activeModeArr[i].mode[tabModeId].id = tabModeId;
					activeModeArr[i].mode[tabModeId].counter = 0;
				}
				if (tabModeId === modeId) {
					// we are on the last tab level (has drawElements)
					if (activeModeArr[i].mode[tabModeId].elements === undefined) {
						activeModeArr[i].mode[tabModeId].elements = [];
					}
					if (draw) {
						activeModeArr[i].mode[tabModeId].elements[id] = name;
						selfObj.activeElems.counter++;
						for (j = 1; j <= i; j++) {
							activeModeArr[j].mode[tabId[j]].counter++;
						}
					}
					else {
						delete activeModeArr[i].mode[tabModeId].elements[id];
						selfObj.activeElems.counter--;
						for (j = 1; j <= i; j++) {
							activeModeArr[j].mode[tabId[j]].counter--;
						}
					}
				}
				else {
					// tab without drawElements
					if (activeModeArr[i].mode[tabModeId].mode === undefined) {
						activeModeArr[i].mode[tabModeId].mode = [];
					}
				}
				activeModeArr[i+1] = [];
				activeModeArr[i+1].mode = activeModeArr[i].mode[tabModeId].mode;
			}

			// handle tab css selected class
			for (i = 1; i < tabId.length; i++) {
				tabModeId = tabId[i];
				$('[id|="mode-0"][id$="-' + tabModeId + '"]').each(function () {
					activeModeArr[i].mode[tabModeId].name = $(this).attr('title');
					if (activeModeArr[i].mode[tabModeId].counter > 0) {
						$(this).addClass(selfObj.cssSelected);
					}
					else {
						$(this).removeClass(selfObj.cssSelected);
					}
				});
			}
		});
	}
	
	/**
	 * Setter to bind an event on activeElements (id-refix: activeElement).
	 * This is used if the binded function must acces other objects than mainMenu
	 * 
	 * @param string eStr: string to define the event
	 * @param function cb: callback function to be evoked when event occures
	 */
	this.setEventBinderActiveElement = function (eStr, cb) {
		if (eStr === 'click') {
			me.binder.activeElement.clickCb = cb;
		}
		else {
			alert('setEventBinderActiveElement: bad eStr');
		}
	};
	
	/**
	 * Setter to bind an event on clearActiveElements (id-refix: activeElementClear).
	 * This is used if the binded function must acces other objects than mainMenu
	 * 
	 * @param string eStr: string to define the event
	 * @param function cb: callback function to be evoked when event occures
	 */
	this.setEventBinderClearActiveElement = function (eStr, cb) {
		if (eStr === 'click') {
			me.binder.clearActiveElement.clickCb = cb;
		}
		else {
			alert('setEventBinderClearActiveElement: bad eStr');
		}
	};
	
	/**
	 * Setter to bind an event on clearActiveElements (id-refix: activeElementsClear).
	 * This is used if the binded function must acces other objects than mainMenu
	 * 
	 * @param string eStr: string to define the event
	 * @param function cb: callback function to be evoked when event occures
	 */
	this.setEventBinderClearActiveElements = function (eStr, cb) {
		if (eStr === 'click') {
			me.binder.clearActiveElements.clickCb = cb;
		}
		else {
			alert('setEventBinderClearActiveElements: bad eStr');
		}
	};
	
	/**
	 * Setter to bind an event on draw elements (id-refix: drawElement).
	 * This is used if the binded function must acces other objects than mainMenu
	 * 
	 * @param string eStr: string to define the event
	 * @param function cb: callback function to be evoked when event occures
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
	 * Setter to bind an event on freeMode tab.
	 * This is used if the binded function must acces other objects than mainMenu
	 * 
	 * @param string eStr: string to define the event
	 * @param function cb: callback function to be evoked when event occures
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
 */
function InfoMenu(destId) {
	var me = this;
	me.destId = destId;
	
	/**
	 * get menu content with ajax and on success draw it
	 * 
	 * @param string pattern: serach pattern
	 */
	this.drawContent = function (pattern) {
		var url;
		url = 'php/ajax/getJson.php?j=contentInfo';
		if ((pattern !== undefined) && (pattern !== '')) {
			url += '&pattern=' + pattern;
		}
		$.getJSON(url, function (data) {
			me.drawContentCb.call(me, data);
		});
	};

	/**
	 * draw menu content int main menu (callback from drawContent)
	 * 
	 * @param array data: json array with data to draw 
	 */
	this.drawContentCb = function (data) {
		var selectContent, mode, activeMode, drawActiveElements, selector;
		selectContent = '#' + me.destId + '-content';
		$(selectContent).html('');
		$('#' + me.destId + '-search').hide();
		if (data === -99) {
			$(selectContent).append('<div>server error</div>');
			return;
		}
		else if (data.main.mode === 'free') {
			me.drawFreeContent.call(me);
		}
		else {
			me.drawListContent.call(me, data);
		}
		$('.categoryTitle').unbind('click');
		$('.categoryTitle').bind('click', function () {
			$(this).children('div.categoryEye').toggleClass('open');
			$(this).next().toggle('fast');
		});
	};

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
		$('#' + destId).append('<div class="content"></div>');
		$('#' + destId + ' > .content').append('<div class="noInfoActive">kein Element ausgew&auml;hlt</div>');
		me.bindEye(me.destId, eyeAttr, midAttr);
		cb();
	};
}

InfoMenu.prototype = new Menu();
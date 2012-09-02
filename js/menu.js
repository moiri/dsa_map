/**
 * Menu class with fundamental methods
 */
function Menu() {
	var me = this;
	me.mode;

	/**
	 * bind click elemnt to eye hiding and showing the menu
	 * 
	 * @param string id: menu id
	 * @param obj eyeAttr: object definig animate properties of the eye button
	 * @param obj midAttr: object definig animate properties of the mid column
	 */
	this.bindEye = function (id, eyeAttr, midAttr, cb) {
		// bind show and hide clicks
		$('#button-' + id).unbind('click');
		$('#button-' + id).bind('click', function () {
			var eye;
			eye = this;
			if ($(eye).hasClass('close')) {
				$(eye).animate(eyeAttr.open, 'fast', 'swing');
				$('.midColumn').animate(midAttr.open,'fast', 'swing', function () {
					$('#' + id).fadeIn('fast', 'swing', cb);
				});
			}
			else {
				$('#' + id).fadeOut('fast', 'swing', function () {
					$(eye).animate(eyeAttr.close, 'fast', 'swing');
					$('.midColumn').animate(midAttr.close, 'fast', 'swing', cb);
				});
			}
			$(eye).toggleClass('close');
		});
	};
	
	/**
	 * 
	 */
	this.bindEntry = function (idPrefix, cb) {
		$().unbind('click');
		$().bind('click', function () {
			
		});
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
}


/**
 * MainMenu class, child of Menu class
 * 
 * @param string destId: destination id to draw main menu to
 * @param func cb: this callback function is executed onclick on the eye
 */
function MainMenu(destId, cb) {
	var me = this;
	me.destId = destId;
	me.cDrawCb = cb;

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
		var selectContent, mode;
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
			mode = data.main.mode;
			$('#' + me.destId + '-search').show();
			$.each(data, function (key, val) {
				var selectCategory;
				selectCategory = selectContent;
				if ((key !== 'main') && (mode !== 'search')) {
					$(selectContent).append('<div id="category-' + val.id + '" class="categoryTitle"></div>');
					$('#category-' + val.id).append('<div class="categoryEye"></div>');
					$('#category-' + val.id).append('<div class="categoryTitleText">' + key + '</div>');
					$(selectContent).append('<div class="category"></div>');
					selectCategory += ' > .category';
				}
				$.each(val.entries, function (key, val) {
					$(selectCategory).append('<div id="entry-' + val.id + '" class="entry">' + val.name + '</div>');
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
	 */
	this.drawMenu = function () {
		var url;
		url = "php/ajax/getJson.php?j=tab";
		$.getJSON(url, me.drawMenuCb);
	};

	/**
	 * draw main menu tabs (callback from drawTabs)
	 * 
	 * @param array data: json array with data to draw 
	 */
	this.drawMenuCb = function (data) {
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
				'class': cssClass,
			}).appendTo('#' + destId);
			$.each(menu, function(key, val) {
				// iterate through tab elements
				var cssClass;
				cssClass = 'tab l' + lvl;
				if ((key === 0) && (lvl === 1)) {
					cssClass += ' active';
				}
				$('<div/>', {
					'id': 'mode-' + modeIdIt + '-' + val.id,
					'class': cssClass,
					html: '<img src="img/' + val.iconPath + '" alt="' + val.name + '" title="' + val.name + '"/>'
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

		me.bindEye(me.destId, eyeAttr, midAttr, me.cDrawCb);
	};
}

MainMenu.prototype = new Menu();

/**
 * InfoMenu class, child of Menu class
 * 
 * @param string destId: destination id to draw info menu to
 * @param func cb: this callback function is executed onclick on the eye
 */
function InfoMenu(destId, cb) {
	var me = this;
	me.destId = destId;
	me.cDrawCb = cb;

	/**
	 * draw the menu
	 */
	this.drawMenu = function () {
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

		me.bindEye(me.destId, eyeAttr, midAttr, me.cDrawCb);
	};
}

InfoMenu.prototype = new Menu();
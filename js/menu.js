/**
 * Menu class with fundamental methods
 */
function Menu() {
	var me = this;
	me.mode;

	/**
	 * bind click elemnt to eye hiding and showing the menu
	 */
	Menu.prototype.bindEye = function () {
		// bind show and hide clicks
		$('[id^="button-menu"]').unbind('click');
		$('[id^="button-menu"]').bind('click', function () {
			var idElem;
			idElem = $(this).attr('id').split('-');
			idElem.shift(); // remove descripter (keep only ids)
			if ($(this).hasClass('open')) {
				$('#' + idElem.join('-')).fadeOut();
				$(this).removeClass('open');
				$(this).addClass('close');
			}
			else {
				$('#' + idElem.join('-')).fadeIn();
				$(this).removeClass('close');
				$(this).addClass('open');
			}
		});
	};
	
	/**
	 * send active mode id to server
	 * 
	 * @param string mode: active mode id
	 * @param func cb: this callback function is executed on sucess
	 * @param obj cbo: callback scope (optional)
	 */
	Menu.prototype.setMode = function (mode, cb, cbo) {
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
 */
function MainMenu(destId) {
	var me = this;
	me.destId = destId;

	/**
	 * get menu content with ajax and on success draw it
	 */
	this.drawContent = function () {
		var url;
		url = "php/ajax/getMainMenu.php?content=1";
		$.getJSON(url, me.drawContentCb);
	};
	
	/**
	 * draw menu content int main menu (callback from drawContent)
	 * 
	 * @param array data: json array with data to draw 
	 */
	this.drawContentCb = function (data) {
		$('#' + me.destId + ' > div.content').html('');
		$.each(data, function (key, val) {
			var selector;
			selector = '#' + me.destId + ' > div.content';
			if (key !== "main") {
				$('#' + me.destId + ' > div.content').append('<div id="category-' + val.id + '" class="categoryTitle"></div>');
				$('#category-' + val.id).append('<div class="categoryEye"></div>');
				$('#category-' + val.id).append('<div class="categoryTitleText">' + key + '</div>');
				$('#' + me.destId + ' > div.content').append('<div class="category"></div>');
				selector += ' > div.category';
			}
			$.each(val.entries, function (key, val) {
				$(selector).append('<div id="entry-' + val.id + '">' + val.name + '</div>')
			});
		});
		$('.categoryTitle').bind('click', function () {
			$(this).children('div.categoryEye').toggleClass('open');
			$(this).next().toggle('fast');
		});
	};

	/**
	 * get main menu tabs with ajax and on success draw it
	 */
	this.drawTabs = function () {
		var url;
		url = "php/ajax/getMainMenu.php?tab=1";
		$.getJSON(url, me.drawTabsCb);
	};

	/**
	 * draw main menu tabs (callback from drawTabs)
	 * 
	 * @param array data: json array with data to draw 
	 */
	this.drawTabsCb = function (data) {
		var iteration, items;
		items = [];

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
		$('#' + destId).append('<div class="content"></div>');

		// bind mode change click events
		$('[id^="mode-"]').unbind('click');
		$('[id^="mode-"]').bind('click', function () {
			var idElem, i, id, lastId, myId, url;
			$('[id^="tabCont-"]').hide();
			$('[id^="mode-"]').removeClass('active');

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

			me.setMode(lastId, me.drawContent);
		});

		me.bindEye();
	};
}

MainMenu.prototype = new Menu();
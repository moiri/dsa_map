$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu, map, img, cache, activeTab;
	cache = [];
	cache.images = [];
	cache.images.img = [];
	cache.images.draw = [];
	cache.activeElems = [];
	cache.activeElems.mode = [];
	cache.activeElems.counter = 0;
	img = [];
	img.picturePath = "map/continental.jpg";
	img.id = '0';
	img.mode = [];
	img.mode.id = 'main';
	img.mode.drawOrder = '0';

	map = new Map('map-canvas', cache);
	$('#map-canvas').height($(window).height() - 80);
	$('#map-canvas').width($(window).width());

	// create mainMenu
	mainMenu = new MainMenu('menu-main', cache);
	// create infoMenu
	infoMenu = new InfoMenu('menu-info');

	// define mainMenu
	// is executed when clicked on a draw element in a main menu list
	mainMenu.setEventBinderDrawElement('click', function (me) {
		var url, idElem, draw, showInfo, element;

		idElem = $(this).attr('id').split('-');
		element = [];
		element.id = idElem[2];
		element.name = $(this).text();
		element.modeId = idElem[1];
		
		$('.selectEye').removeClass(me.cssSelected);
		if ($(this).hasClass(me.cssActive)) {
			$(this).removeClass(me.cssActive);
			$(this).prev('.selectEye').remove();
			draw = false;
			showInfo = false;
			$(this).attr('title', 'Element aktivieren');
		}
		else {
			$(this).addClass(me.cssActive);
			$('<div id="selectEye-' + element.modeId + '-' + element.id 
					+ '" class="selectEye ' + me.cssSelected + '"></div>').insertBefore(this)
					.bind('click', function () {
						me.binder.showDrawElementInfo.clickCb.call(this, me);
					});
			draw = true;
			showInfo = true;
			$(this).attr('title', 'Element deaktivieren');
		}

		if (showInfo) {
			// show element info in info menu
			infoMenu.drawContent.call(infoMenu,element.id, element.modeId);
		}
		else {
			infoMenu.drawInitContent.call(infoMenu);
		}
		if (draw != null) {
			me.handleActiveElements.call(me, element.id, element.name, element.modeId, draw);
			url = "php/ajax/getJson.php?j=imgById&id=" + element.id;
			$.getJSON(url, function (data) {
				map.loadImage(data, map.drawImageToCanvas, draw);
			});
		}
	});
	// is executed when clicked on an active element in the free mode main menu
	mainMenu.setEventBinderActiveElement('click', function (me) {
		var idElems, element;
		if (!$(this).hasClass(me.cssSelected)) {
			$('[id|="activeElement"].' + me.cssSelected).removeClass(me.cssSelected);
			$('[id|="activeElement"]').attr('title', 'Element auswählen');
			$(this).addClass(me.cssSelected);
			$(this).attr('title', 'kein Effekt');

			idElem = $(this).attr('id').split('-');
			element = [];
			element.id = idElem[2];
			element.name = $(this).text();
			element.modeId = idElem[1];

			// show element info in info menu
			infoMenu.drawContent.call(infoMenu,element.id, element.modeId);
		}
	});
	// is executed when clicked on a clear active element in the free mode main menu
	mainMenu.setEventBinderClearActiveElement('click', function (me) {
		var url, idElem, draw, element;

		idElem = $(this).attr('id').split('-');
		element = [];
		element.id = idElem[2];
		element.name = $(this).text();
		element.modeId = idElem[1];
		me.handleActiveElements.call(me, element.id, element.name, element.modeId, false);

		url = "php/ajax/getJson.php?j=imgById&id=" + element.id + "&modeId=" + element.modeId;
		$.getJSON(url, function (data) {
			map.loadImage(data, map.drawImageToCanvas, false);
		});
		me.drawFreeContent.call(me);
		infoMenu.drawInitContent.call(infoMenu);
	});
	// is executed when clicked on clear all active elements in the free mode main menu
	mainMenu.setEventBinderClearActiveElements('click', function (me) {
		me.clearActiveElements.call(me);
		me.drawFreeContent.call(me);
		infoMenu.drawInitContent.call(infoMenu);
		map.drawImageToCanvas();
	});
	// is executed when clicked on a mode tab
	mainMenu.setEventBinderMode('click', function (me) {
		infoMenu.drawInitContent.call(infoMenu);
	});
	// is executed when clicked on eye behind active draw element
	mainMenu.setEventBinderShowDrawElementInfo('click', function (me) {
		var idElem, element;
		idElem = $(this).attr('id').split('-');
		element = [];
		element.id = idElem[2];
		element.modeId = idElem[1];
		if (!$(this).hasClass(me.cssSelected)) {
			$('.selectEye').removeClass(me.cssSelected);
			$(this).addClass(me.cssSelected);
			infoMenu.drawContent.call(infoMenu, element.id, element.modeId);
		}
	});
	// is executed when clicked on an eye to hide/show a menu
	mainMenu.setEventBinderToggleMenu('click', function () {
		map.initMapOnCanvas();
		map.drawImageToCanvas();
	});

	// define infoMenu
	infoMenu.setEventBinderToggleMenu('click', function () {
		map.initMapOnCanvas();
		map.drawImageToCanvas();
	});

	mainMenu.drawMenu(function () {
		infoMenu.drawMenu(function () {
			// init map
			map.loadImage(img, function () {
				map.initMapOnCanvas();
				map.enableMoveMap();
				map.enableZoom();
				map.drawImageToCanvas();
			});
		});
	});
});
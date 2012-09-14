$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu, map, img, cache, activeTab, cssSelected;
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
		var url, idElem, draw, showInfo, element, isActive;
		isActive = $(this).hasClass(me.cssActive);
		$('[id|="drawElement"].' + me.cssActive).attr('title', 'Element auswählen');
		$('[id|="drawElement"]').removeClass(me.cssActive);
		if ($(this).hasClass(me.cssSelected) && isActive) {
			// active and selected -> remove element
			$(this).removeClass(me.cssSelected);
			draw = false;
			showInfo = false;
			$(this).attr('title', 'Element aktivieren');
		}
		else if (!$(this).hasClass(me.cssSelected) && !isActive) {
			// not active and not selected -> add element
			$(this).addClass(me.cssSelected);
			$(this).addClass(me.cssActive);
			draw = true;
			showInfo = true;
			$(this).attr('title', 'Element deaktivieren');
		}
		else if ($(this).hasClass(me.cssSelected)) {
			// selected but not active -> make it active
			$(this).addClass(me.cssActive);
			draw = null;
			showInfo = true;
			$(this).attr('title', 'Element deaktivieren');
		}
		
		idElem = $(this).attr('id').split('-');
		element = [];
		element.id = idElem[2];
		element.name = $(this).text();
		element.modeId = idElem[1];
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
		if (!$(this).hasClass(me.cssActive)) {
			$('[id|="activeElement"].' + me.cssActive).removeClass(me.cssActive);
			$('[id|="activeElement"]').attr('title', 'Element auswählen');
			$(this).addClass(me.cssActive);
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
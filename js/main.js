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

	// create and define mainMenu
	mainMenu = new MainMenu('menu-main', cache);
	// is executed when clicked on a draw element in a main menu list
	mainMenu.setEventBinderDrawElement('click', function (selfObj) {
		var url, idElem, draw, showInfo, element, isActive;
		isActive = $(this).hasClass(selfObj.cssActive);
		$('[id|="drawElement"].' + selfObj.cssActive).attr('title', 'Element auswählen');
		$('[id|="drawElement"]').removeClass(selfObj.cssActive);
		if ($(this).hasClass(selfObj.cssSelected) && isActive) {
			// active and selected -> remove element
			$(this).removeClass(selfObj.cssSelected);
			draw = false;
			showInfo = false;
			$(this).attr('title', 'Element aktivieren');
		}
		else if (!$(this).hasClass(selfObj.cssSelected) && !isActive) {
			// not active and not selected -> add element
			$(this).addClass(selfObj.cssSelected);
			$(this).addClass(selfObj.cssActive);
			draw = true;
			showInfo = true;
			$(this).attr('title', 'Element deaktivieren');
		}
		else if ($(this).hasClass(selfObj.cssSelected)) {
			// selected but not active -> make it active
			$(this).addClass(selfObj.cssActive);
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
		}
		if (draw != null) {
			selfObj.handleActiveElements.call(selfObj, element.id, element.name, element.modeId, draw);
			url = "php/ajax/getJson.php?j=imgById&id=" + element.id;
			$.getJSON(url, function (data) {
				map.loadImage(data, map.drawImageToCanvas, draw);
			});
		}
	});
	// is executed when clicked on an active element in the free mode main menu
	mainMenu.setEventBinderActiveElement('click', function () {
		var idElems, element;
		$('[id|="activeElement"].' + selfObj.cssActive).removeClass(selfObj.cssActive);
		$('[id|="activeElement"]').attr('title', 'Element auswählen');
		$(this).addClass(selfObj.cssActive);
		$(this).attr('title', 'kein Effekt');
		
		idElem = $(this).attr('id').split('-');
		element = [];
		element.id = idElem[2];
		element.name = $(this).text();
		element.modeId = idElem[1];
		
		// show element info in info menu
	});
	// is executed when clicked on a clear active element in the free mode main menu
	mainMenu.setEventBinderClearActiveElement('click', function (selfObj) {
		var url, idElem, draw, element;
		
		idElem = $(this).attr('id').split('-');
		element = [];
		element.id = idElem[2];
		element.name = $(this).text();
		element.modeId = idElem[1];
		selfObj.handleActiveElements.call(selfObj, element.id, element.name, element.modeId, false);

		url = "php/ajax/getJson.php?j=imgById&id=" + element.id + "&modeId=" + element.modeId;
		$.getJSON(url, function (data) {
			map.loadImage(data, map.drawImageToCanvas, false);
		});
		selfObj.drawFreeContent.call(selfObj);
	});
	// is executed when clicked on clear all active elements in the free mode main menu
	mainMenu.setEventBinderClearActiveElements('click', function () {
		this.clearActiveElements.call(this);
		this.drawFreeContent.call(this);
		map.drawImageToCanvas();
	});
	// is executed when clicked on the free mode tab
	mainMenu.setEventBinderFreeMode('click', function () {
		// nothing to do, don't need this binder...
	});
	// is executed when clicked on an eye to hide/show a menu
	mainMenu.setEventBinderToggleMenu('click', function () {
		map.initMapOnCanvas();
		map.drawImageToCanvas();
	});

	// create and define infoMenu
	infoMenu = new InfoMenu('menu-info');
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
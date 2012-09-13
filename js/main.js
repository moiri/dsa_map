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
		var url, idElem, draw, element;
		if ($(this).hasClass(selfObj.cssSelected)) {
			$(this).removeClass(selfObj.cssSelected);
			draw = false;
		}
		else {
			$(this).addClass(selfObj.cssSelected);
			draw = true;
		}
		
		idElem = $(this).attr('id').split('-');
		element = [];
		element.id = idElem[2];
		element.name = $(this).text();
		element.modeId = idElem[1];
		selfObj.handleActiveElements.call(selfObj, element.id, element.name, element.modeId, draw);

		url = "php/ajax/getJson.php?j=imgById&id=" + element.id;
		$.getJSON(url, function (data) {
			map.loadImage(data, map.drawImageToCanvas, draw);
		});
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
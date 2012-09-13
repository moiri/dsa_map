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
	mainMenu.setEventBinderDrawElement('click', function (selfObj) {
		var url, idElem, draw, activeModeId, activeModeArr, activeElementId, activeElementName, hasActiveElems, tabModeId;
		if ($(this).hasClass(selfObj.cssSelected)) {
			$(this).removeClass(selfObj.cssSelected);
			draw = false;
		}
		else {
			$(this).addClass(selfObj.cssSelected);
			draw = true;
		}
		idElem = $(this).attr('id').split('-');
		activeModeId = idElem[1];
		activeElementId = idElem[2];
		activeElementName = $(this).text();

		// highlight tabs and elements if active
		$('[id|="mode-0"][id$="-' + activeModeId + '"]').each(function () {
			var tabId, i, j;
			tabId = $(this).attr('id').split('-');
			tabId.shift();
			// build activeElements Array
			activeModeArr = [];
			activeModeArr[1] = [];
			if ((activeModeArr[1].mode = selfObj.activeElems.mode) === undefined) {
				activeModeArr[1].mode = [];
			}
			for (i = 1; i < tabId.length; i++) {
				tabModeId = tabId[i];
				if (activeModeArr[i].mode[tabModeId] === undefined) {
					activeModeArr[i].mode[tabModeId] = [];
					activeModeArr[i].mode[tabModeId].id = tabModeId;
					activeModeArr[i].mode[tabModeId].counter = 0;
				}
				if (tabModeId === activeModeId) {
					// we are on the last tab level (has drawElements)
					if (activeModeArr[i].mode[tabModeId].elements === undefined) {
						activeModeArr[i].mode[tabModeId].elements = [];
					}
					if (draw) {
						activeModeArr[i].mode[tabModeId].elements[activeElementId] = activeElementName;
						selfObj.activeElems.counter++;
						for (j = 1; j <= i; j++) {
							activeModeArr[j].mode[tabId[j]].counter++;
						}
					}
					else {
						activeModeArr[i].mode[tabModeId].elements.splice(activeElementId, 1);
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

		url = "php/ajax/getJson.php?j=imgById&id=" + idElem[2];
		$.getJSON(url, function (data) {
			map.loadImage(data, map.drawImageToCanvas, draw);
		});
	});
	mainMenu.setEventBinderFreeMode('click', function () {
		//mainMenu.clearActiveElements();
		//map.drawImageToCanvas();
	});
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
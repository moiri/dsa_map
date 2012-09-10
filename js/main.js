$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu, map, img, cache, activeTab;
	cache = [];
	cache.images = [];
	cache.activeElems = [];
	map = new Map('map-canvas', cache);
	$('#map-canvas').height($(window).height() - 80);
	$('#map-canvas').width($(window).width());
	mainMenu = new MainMenu('menu-main', cache);
	mainMenu.setEventBinderDrawElement('click', function () {
		var url, idElem, draw, cssSelected;
		cssSelected = 'selected';
		if ($(this).hasClass(cssSelected)) {
			$(this).removeClass(cssSelected);
			draw = false;
		}
		else {
			$(this).addClass(cssSelected);
			draw = true;
		}
		idElem = $(this).attr('id').split('-');
		
		// highlight tabs and elements if active
		$('[id|="mode-0"][id$="-' + idElem[1] + '"]').each(function () {
			var tabId, i;
			tabId = $(this).attr('id').split('-');
			for (i = 2; i < tabId.length; i++) {
				$('[id|="mode-0"][id$="-' + tabId[i] + '"]').each(function () {
					if ($(this).hasClass(cssSelected)) {
						if (draw) {
							// draw element and tab already active
							cache.activeElems[tabId[i]].elements[idElem[2]] = true;
							cache.activeElems[tabId[i]].counter++;
						}
						else {
							cache.activeElems[tabId[i]].elements[idElem[2]] = false;
							cache.activeElems[tabId[i]].counter--;
							if (cache.activeElems[tabId[i]].counter === 0) {
								// remove last active element
								$(this).removeClass(cssSelected);
							}
						}
					}
					else if (draw) {
						// draw element and tab not yet active
						$(this).addClass(cssSelected);
						if (cache.activeElems[tabId[i]] === undefined) {
							cache.activeElems[tabId[i]] = [];
							cache.activeElems[tabId[i]].elements = [];
						}

						cache.activeElems[tabId[i]].elements[idElem[2]] = true;
						cache.activeElems[tabId[i]].counter = 1;
					}
				});
			}
		});

		url = "php/ajax/getJson.php?j=imgById&id=" + idElem[2];
		$.getJSON(url, function (data) {
			map.loadImage(data, map.drawImageToCanvas, draw);
		});
	});
	mainMenu.setEventBinderToggleMenu('click', function () {
		map.initMapOnCanvas();
		map.drawImageToCanvas();
	});
	mainMenu.drawMenu();
	infoMenu = new InfoMenu('menu-info');
	infoMenu.setEventBinderToggleMenu('click', function () {
		map.initMapOnCanvas();
		map.drawImageToCanvas();
	});
	infoMenu.drawMenu();
	img = [];
	img.picturePath = "map/continental.jpg";
	img.id = '0';
	img.id_mode = 'main';
	map.loadImage(img, function () {
		map.initMapOnCanvas();
		map.enableMoveMap();
		map.enableZoom();
	});
});
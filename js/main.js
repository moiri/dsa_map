$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu, map, img, imageCache;
	imageCache = [];
	map = new Map('map-canvas', imageCache);
	$('#map-canvas').height($(window).height() - 80);
	$('#map-canvas').width($(window).width());
	mainMenu = new MainMenu('menu-main', imageCache);
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
		/*$('[id|="mode-0"][id$="-' + idElem[1] + '"]').each(function () {
			var tabId, i;
			if (draw) {
				$(this).addClass(cssSelected);
			}
			else {
				$(this).removeClass(cssSelected);
			}
			tabId = $(this).attr('id').split('-');
			for (i = 2; i < tabId.length-1; i++) {
				$('[id|="mode-0"][id$="-' + tabId[i] + '"]').each(function () {
					if (!$(this).hasClass(cssSelected) && draw) {
						$(this).addClass(cssSelected);
					}
					else if ($(this).hasClass(cssSelected) && !draw) {
						$(this).removeClass(cssSelected);
					}
				});
			}
		});*/
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
$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu, map, imgs, img;
	map = new Map('map-canvas');
	$('#map-canvas').height($(window).height() - 80);
	$('#map-canvas').width($(window).width());
	mainMenu = new MainMenu('menu-main');
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
		url = "php/ajax/getJson.php?j=imgById&id=" + idElem[1];
		$.getJSON(url, function (data) {
			map.loadImage(data, map.drawImageToCanvas, draw);
		});
	});
	mainMenu.setEventBinderToggleMenu('click', map.initMapOnCanvas);
	mainMenu.drawMenu();
	infoMenu = new InfoMenu('menu-info');
	infoMenu.setEventBinderToggleMenu('click', map.initMapOnCanvas);
	infoMenu.drawMenu();
	img = [];
	img.picturePath = "map/continental.jpg";
	img.id = '0';
	img.id_category = 'main';
	map.loadImage(img, function () {
		var img, imgs;
		map.initMapOnCanvas();
		/*imgs = [];
		
		img = [];
		img.picturePath = "culture/culture_4.png";
		img.id = '4';
		img.table = 'culture';
		imgs.push(img);
		
		img = [];
		img.picturePath = "culture/culture_5.png";
		img.id = '5';
		img.table = 'culture';
		imgs.push(img);
		map.loadImages(imgs, map.drawImageToCanvas);*/
		map.enableMoveMap();
		map.enableZoom();
	});
});
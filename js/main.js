$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu, map, imgs, img;
	map = new Map('map-canvas');
	$('#map-canvas').height($(window).height() - 80);
	$('#map-canvas').width($(window).width());
	mainMenu = new MainMenu('menu-main', map.initMapOnCanvas);
	mainMenu.drawMenu();
	infoMenu = new InfoMenu('menu-info', map.initMapOnCanvas);
	infoMenu.drawMenu();
	img = [];
	img.picturePath = "map/continental.jpg";
	img.id = '0';
	img.table = 'main';
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
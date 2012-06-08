$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu, map;
	map = new Map('map-canvas');
	map.initMap();
	mainMenu = new MainMenu('menu-main');
	mainMenu.drawMenu();
	infoMenu = new InfoMenu('menu-info');
	infoMenu.drawMenu();
});
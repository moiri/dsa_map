<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<title>Interaktive Aventurienkarte</title>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<meta name="DC.creator" content="Simon Maurer" />
<meta name="DC.contributor" content="Giovina Nicolai" />
<meta name="DC.contributor" content="Ralf Mauerhofer" />
<meta name="DC.title" content="Interaktive Aventurienkarte" />
<meta name="DC.date" content="2012-05-28" />
<meta name="DC.language" content="de" />
<link rel="stylesheet" type="text/css" href="css/main.css" />
<link rel="stylesheet" type="text/css" href="css/menu.css" />
<link rel="stylesheet" type="text/css" href="css/map.css" />
<script src='js/ext/jquery.src.js' type='text/javascript'></script>
<script src='js/main.js' type='text/javascript'></script>
<script src='js/menu.js' type='text/javascript'></script>
<script src='js/map.js' type='text/javascript'></script>
<style type='text/css'></style>
</head>
<body>
	<div id="content">
		<div class="leftColumn">
			<div id="button-menu-main" class="tab l0 open"></div>
			<div id="menu-main" class="mainMenu"></div>
		</div>
		<div class="rightColumn">
			<div id="button-menu-info" class="tab l0 open"></div>
			<div id="menu-info" class="border2 infoMenu"></div>
		</div>
		<div class="midColumn">
			<div class="header"><div id="loader" class="loader"></div></div>
			<div id="map" class="mapBox border2">
				<div id="maxZoom" class="mapMsg">H&ouml;chste Zoomstufe erreicht</div>
				<div id="minZoom" class="mapMsg">Kleinste Zoomstufe erreicht</div>
				<canvas id="map-canvas" class="canvas" width='1000' height='1358'>
					Your browser does not support the canvas element.
				</canvas>
			</div>
			<div class="footer"></div>
		</div>
	</div>
</body>
</html>

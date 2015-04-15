<?php
	require_once('../../php/dbMapper/baseDbMapper.php');
	require_once('../php/dbMapper/plant.php');
	require_once('../php/dbMapper/secure/globals.php');
	
    $helper = new PlantHelperDbMapper(DBSERVER, DBNAME, DBUSER, DBPASSWORD);
?>

<!DOCTYPE html>

<html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en' lang='en'>
<head>
	<title>Plant Helper</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name='DC.creator' content='Simon Maurer' />
	<meta name='DC.contributor' content='Giovina Nicolai' />
	<meta name='DC.title' content='Interaktive Aventurienkarte Helper' />
	<meta name='DC.date' content='2011-12-02' />
	<meta name='DC.language' content='de' />
	<link rel='stylesheet' type='text/css' href='../css/plant.css' />
    <script src='../../js/ext/jquery.js' type='text/javascript'></script>
	<script src='../js/plant.js' type='text/javascript'></script>
</head>
<body>
	<div id='menuList' class='list'>
<?php
	$helper->drawPlantList();
?>
	</div>
	
	<div class='content'>
		<div id='content'></div>
		<div id='log' class='msg'>
<?php
	//$helper->movePlantPoison();
?>
		</div>
	</div>
</body>

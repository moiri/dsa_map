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
	<link rel='stylesheet' type='text/css' href='../css/plantLists.css' />
	<script src='../../js/ext/jquery.js' type='text/javascript'></script>
	<script src='../js/plantLists.js' type='text/javascript'></script>
</head>
<body>
	<div id='menuList' class='list'>
		<select id='selectDropDown' name='dropDown'>
			<option value='plantType-plant_plantType'>Typ</option>
			<option value='plantNameType-plantName'>Zusatznamen Typ</option>
			<option value='plantTextType-plantText'>Text Typ</option>
			<option value='plantAttribute-plant_plantAttribute'>Attribut</option>
			<option value='plantRegion-plant_plantRegion'>Region</option>
			<option value='plantRarity-plant_plantRegion'>Verbreitung</option>
		</select>
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

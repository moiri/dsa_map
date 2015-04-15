<?php
	require_once('../../../php/dbMapper/baseDbMapper.php');
	require_once('../dbMapper/plant.php');
    require_once('../dbMapper/secure/globals.php');
	
    $helper = new PlantHelperDbMapper(DBSERVER, DBNAME, DBUSER, DBPASSWORD);
	
	if($_GET['action'] == "getPlant") {
		$helper->drawPlantInfo($_GET['id']);	
	}
	else if($_GET['action'] == "updateEntry") {
		$helper->updateEntry($_GET['table'], $_GET['id'], $_GET['col'], addslashes($_GET['val']));
	}
	else if($_GET['action'] == "insertEntry") {
		if(!isset($_GET['cols'])) {
			$_GET['cols'] = "";
		}
		if(!isset($_GET['vals'])) {
			$_GET['vals'] = "";
		}
		$helper->insertEntry($_GET['table'], $_GET['cols'], $_GET['vals']);
	}
	else if($_GET['action'] == "getList") {
		$helper->drawDropDownList($_GET['table'], $_GET['tableFk']);
	}
	else if($_GET['action'] == "deleteEntry") {
		$helper->deleteEntry($_GET['table'], $_GET['tableFk'], $_GET['id']);
	}
?>

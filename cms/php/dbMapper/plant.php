<?php
class PlantHelperDbMapper extends BaseDbMapper {
	var $dropDownCnt = 0;
	function MapDbMapper($server="",$database="",$login="",$password=""){
		$this->BaseDbMapper($server,$database,$login,$password);
	}

	/**
	 * draw dropdown elements of table content
	 *
	 * @param string $table: table name
	 * @param bool $null: dropown contains null element
	 * @param int $id: id of preselected element
	 * @param string $restrictIdName: name of id to restrict selection
	 * @param int $restrictId: id to restrict selection
	 */
	function drawPlantDropDown($table, $null=false, $id=0, $restrictIdName="", $restrictId=0) {
		$seq = "sequence, ";
		$sql = "
		SELECT id, name
		FROM ".$table;
		if(($restrictIdName != "") && ($restrictId != 0)) {
			$sql .= " WHERE ".$restrictIdName."='".$restrictId."'";
			$restrictIdName .= ", ";
			$seq = "";
		}
		$sql .= " ORDER BY ".$restrictIdName.$seq."name;";
		if($result = mysql_query($sql)) {
			if(($num_rows = mysql_num_rows($result)) > 0) {
				$this->dropDownCnt++;
				echo "<select id='select-".$table."-".$this->dropDownCnt."' name='".$table."' size='1'>";
				if($null) {
					$selected = "";
					if($id == 0) {
						$selected = " selected='selected'";
					}
					echo "<option".$selected." value='0'>-</option>";
				}
				for($k=0; $k<$num_rows; $k++) {
					$entry = mysql_fetch_array($result);
					$selected = "";
					if($id == $entry['id']) {
						$selected = " selected='selected'";
					}
					echo "<option".$selected." value='".$entry['id']."'>".$entry['name']."</option>";
				}
				echo "</select>";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}
	
	/**
	 * 
	 */
	function drawDropDownList($table, $tableFk) {
		$sql = "
		SELECT id, name, sequence
		FROM ".$table."
		ORDER BY name;";
		if($result = mysql_query($sql)) {
			echo "
				<div id='new-".$table."-".$tableFk."' class='newElem'>neu</div>\n";
			if(mysql_num_rows($result) > 0) {
				while($entry = mysql_fetch_array($result)) {
					echo "
				<div class='entry'>\n
					<input id='input-".$table."-name-".$entry['id']."' class='entryContent' type='text' value='".$entry['name']."'>
					<input id='input-".$table."-sequence-".$entry['id']."' class='entryContent' type='text' value='".$entry['sequence']."'>
					<div id='delete-".$table."-".$tableFk."-".$entry['id']."' class='deleteElem'>delete</div>
				</div>\n";
				}
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}


	/**
	 * draw infos about plant
	 *
	 * @param int $id: id of plant
	 */
	function drawPlantInfo($id) {
		$sql = "
		SELECT id, name, harvest, ident, done, page
		FROM plant
		WHERE id='".$id."';";
		if($result = mysql_query($sql)) {
			if(mysql_num_rows($result) > 0) {
				$plant = mysql_fetch_array($result);

				// print id and main name
				echo "
	<div id='base-plant-".$plant['id']."' class='element'>
		<div class='entry'>
			<div class='entryTitle'>Id:</div>
			<div style='margin:4px 0px'>".$plant['id']."</div>
		</div>\n
		<div class='entry'>
			<div class='entryTitle'>Name:</div>
			<input id='input-plant-name' class='entryContent' type='text' value='".$plant['name']."'>
		</div>\n";

				// print additional names
				$sqlInt = "
					SELECT pn.id id, pn.name name, pn.id_plantNameType idpnt
					FROM plantName pn
					JOIN plantNameType pnt ON pnt.id = pn.id_plantNameType 
					WHERE id_plant='".$id."'
					ORDER BY pnt.sequence, pnt.name;";
				if($resultInt = mysql_query($sqlInt)) {
					$title = "Zusatznamen (<span id='new-plantName-id_plant-".$id."' class='new'>neu</span>):";
					if(mysql_num_rows($resultInt) > 0) {
						echo "
		<div class='entrygroup'>\n";
						$k=0;
						while($entryInt = mysql_fetch_array($resultInt)) {
							if($k > 0) {
								$title = "";
							}
							echo "
			<div class='entry'>
				<div class='entryTitle'>".$title."</div>
				<input id='input-plantName-name-".$entryInt["id"]."' class='entryContent' type='text' value='".$entryInt["name"]."'>
				<div id='select-plantName-id_plantNameType-".$entryInt["id"]."' class='entryContent'>\n";
							$this->drawPlantDropDown("plantNameType", false, $entryInt["idpnt"]);
							echo "
				</div>
			</div>\n";
							$k++;
						}
						echo "
		</div>\n";
					}
					else {
						echo "
		<div class='entry'>
			<div class='entryTitle'>".$title."</div>
			<div class='entryContent'></div>
		</div>\n";
					}
				}
				else {
					echo "<p>error! sql: ".$sqlInt."</p>\n";
				}

				// print plant parts
				$sqlInt = "
					SELECT id, name, quantity, durability from plantPart
					WHERE id_plant='".$id."';";
				if($resultInt = mysql_query($sqlInt)) {
					$title = "Nutzbare Teile (<span id='new-plantPart-id_plant-".$id."' class='new'>neu</span>):";
					if(mysql_num_rows($resultInt) > 0) {
						echo "
		<div class='entrygroup'>\n";
						$k=0;
						while($entryInt = mysql_fetch_array($resultInt)) {
							if($k > 0) {
								$title = "";
							}
							$elem = array(
								array("class" => " empty", "content" => "Name"),
								array("class" => " empty", "content" => "Anzahl"),
								array("class" => " empty", "content" => "Haltbarkeit")
							);
							if ($entryInt["name"] != "") {
								$elem[0]["class"] = "";
								$elem[0]["content"] = $entryInt["name"];
							}
							if ($entryInt["quantity"] != "") {
								$elem[1]["class"] = "";
								$elem[1]["content"] = $entryInt["quantity"];
							}
							if ($entryInt["durability"] != "") {
								$elem[2]["class"] = "";
								$elem[2]["content"] = $entryInt["durability"];
							}
							echo "
			<div class='entry'>
				<div class='entryTitle'>".$title."</div>
				<input id='input-plantPart-name-".$entryInt["id"]."' class='entryContent".$elem[0]["class"]."' type='text' value='".$elem[0]["content"]."'>
				<input id='input-plantPart-quantity-".$entryInt["id"]."' class='entryContent".$elem[1]["class"]."' type='text' value='".$elem[1]["content"]."'>
				<input id='input-plantPart-durability-".$entryInt["id"]."' class='entryContent".$elem[2]["class"]."' type='text' value='".$elem[2]["content"]."'>
			</div>\n";
							$k++;
						}
						echo "
		</div>\n";
					}
					else {
						echo "
		<div class='entry'>
			<div class='entryTitle'>".$title."</div>
			<div class='entryContent'></div>
		</div>\n";
					}
				}
				else {
					echo "<p>error! sql: ".$sqlInt."</p>\n";
				}
				
				// print harvest info
				echo "
		<div class='entry'>
			<div class='entryTitle'>Ernte:</div>
			<input id='input-plant-harvest' class='entryContent' type='text' value='".$plant['harvest']."'>
		</div>\n";

				// print textfields
				$sqlInt = "
					SELECT pt.id id, pt.text text, pt.id_plantPart idpp, pt.id_plantTextType idptt
					FROM plantText pt
					JOIN plantTextType ptt ON ptt.id = pt.id_plantTextType
					WHERE id_plant='".$id."'
					ORDER BY ptt.sequence, ptt.name;";
				if($resultInt = mysql_query($sqlInt)) {
					$title = "Beschreibung (<span id='new-plantText-id_plant-".$id."' class='new'>neu</span>):";
					if(mysql_num_rows($resultInt) > 0) {
						echo "
		<div class='entrygroup'>\n";
						$k=0;
						while($entryInt = mysql_fetch_array($resultInt)) {
							if($k > 0) {
								$title = "";
							}
							echo "
			<div class='entry'>
				<div class='entryTitle'>".$title."</div>
				<textarea id='input-plantText-text-".$entryInt["id"]."' class='entryContent' cols='30' rows='5'>".$entryInt['text']."</textarea>
				<div id='select-plantText-id_plantTextType-".$entryInt["id"]."' class='entryContent'>\n";
							$this->drawPlantDropDown("plantTextType", false, $entryInt["idptt"]);
							echo "
				</div>
				<div id='select-plantText-id_plantPart-".$entryInt["id"]."' class='entryContent'>\n";
							$this->drawPlantDropDown("plantPart", true, $entryInt["idpp"], "id_plant", $id);
							echo "
				</div>
			</div>\n";
							$k++;
						}
						echo "
		</div>\n";
					}
					else {
						echo "
		<div class='entry'>
			<div class='entryTitle'>".$title."</div>
			<div class='entryContent'></div>
		</div>\n";
					}
				}
				else {
					echo "<p>error! sql: ".$sqlInt."</p>\n";
				}

				// print plant types
				$sqlInt = "
					SELECT ppt.id, ppt.id_plantType idpt
					FROM plant_plantType ppt
					JOIN plantType pt ON pt.id = ppt.id_plantType
					WHERE id_plant='".$id."'
					ORDER BY pt.sequence, pt.name;";
				if($resultInt = mysql_query($sqlInt)) {
					$title = "Typ (<span id='new-plant_plantType-id_plant-".$id."' class='new'>neu</span>):";
					if(mysql_num_rows($resultInt) > 0) {
						echo "
		<div class='entrygroup'>\n";
						$k=0;
						while($entryInt = mysql_fetch_array($resultInt)) {
							if($k > 0) {
								$title = "";
							}
								echo "
			<div class='entry'>
				<div class='entryTitle'>".$title."</div>
				<div id='select-plant_plantType-id_plantType-".$entryInt['id']."' class='entryContent'>\n";
							$this->drawPlantDropDown("plantType", false, $entryInt['idpt']);
							echo "
				</div>
			</div>\n";
							$k++;
						}
						echo "
		</div>\n";
					}
					else {
						echo "
		<div class='entry'>
			<div class='entryTitle'>".$title."</div>
			<div class='entryContent'></div>
		</div>\n";
					}
				}
				else {
					echo "<p>error! sql: ".$sqlInt."</p>\n";
				}
				
				// print plant attributes
				$sqlInt = "
					SELECT ppa.id id, ppa.id_plantAttribute idpa
					FROM plant_plantAttribute ppa
					JOIN plantAttribute pa ON pa.id = ppa.id_plantAttribute
					WHERE id_plant='".$id."'
					ORDER BY pa.sequence, pa.name;";
				if($resultInt = mysql_query($sqlInt)) {
					$title = "Attribut (<span id='new-plant_plantAttribute-id_plant-".$id."' class='new'>neu</span>):";
					if(mysql_num_rows($resultInt) > 0) {
						echo "
		<div class='entrygroup'>\n";
						$k=0;
						while($entryInt = mysql_fetch_array($resultInt)) {
							if($k > 0) {
								$title = "";
							}
							echo "
			<div class='entry'>
				<div class='entryTitle'>".$title."</div>
				<div id='select-plant_plantAttribute-id_plantAttribute-".$entryInt['id']."' class='entryContent'>\n";
							$this->drawPlantDropDown("plantAttribute", false, $entryInt['idpa']);
							echo "
				</div>
			</div>\n";
							$k++;
						}
						echo "
		</div>\n";
					}
					else {
						echo "
		<div class='entry'>
			<div class='entryTitle'>".$title."</div>
			<div class='entryContent'></div>
		</div>\n";
					}
				}
				else {
					echo "<p>error! sql: ".$sqlInt."</p>\n";
				}

				// print plant regions and their rarity
				$sqlInt = "
					SELECT ppr.id, ppr.id_plantRegion prid, ppr.id_plantRarity praid
					FROM plant_plantRegion ppr
					JOIN plantRegion pr ON pr.id = ppr.id_plantRegion
					JOIN plantRarity pra ON pra.id = ppr.id_plantRarity
					WHERE id_plant='".$id."'
					ORDER BY pr.sequence, pr.name, pra.sequence, pra.name;";
				if($resultInt = mysql_query($sqlInt)) {
					$title = "Region (<span id='new-plant_plantRegion-id_plant-".$id."' class='new'>neu</span>):";
					if(mysql_num_rows($resultInt) > 0) {
						echo "
		<div class='entrygroup'>\n";
						$k=0;
						while($entryInt = mysql_fetch_array($resultInt)) {
							if($k > 0) {
								$title = "";
							}
							echo "
			<div class='entry'>
				<div class='entryTitle'>".$title."</div>
				<div id='select-plant_plantRegion-id_plantRegion-".$entryInt['id']."' class='entryContent'>\n";
							$this->drawPlantDropDown("plantRegion", false, $entryInt['prid']);
								echo "
				</div>
				<div id='select-plant_plantRegion-id_plantRarity-".$entryInt['id']."' class='entryContent'>\n";
							$this->drawPlantDropDown("plantRarity", false, $entryInt['praid']);
							echo "
				</div>
			</div>\n";
							$k++;
						}
						echo "
		</div>\n";
					}
					else {
						echo "
		<div class='entry'>
			<div class='entryTitle'>".$title."</div>
			<div class='entryContent'></div>
		</div>\n";
					}
				}
				else {
					echo "<p>error! sql: ".$sqlInt."</p>\n";
				}
				
				// print identification handicap
				echo "
		<div class='entry'>
			<div class='entryTitle'>Bestimmung:</div>
			<input id='input-plant-ident' type='text' class='entryContent' value='".$plant['ident']."'>
		</div>\n";
				
				// print page of ZOBO
				echo "
		<div class='entry'>
			<div class='entryTitle'>ZoBo Seite:</div>
			<input id='input-plant-page' type='text' class='entryContent' value='".$plant['page']."'>
		</div>\n";

				// print done flag
				echo "
		<div class='entry'>
			<div class='entryTitle'>Erledigt:</div>\n";
				$checked = "";
				if($plant['done'] == '1') {
					$checked = " checked";
				}
				echo "
			<input id='checkbox-plant-done' class='entryContent' type='checkbox' value='".$plant['done']."'".$checked.">
		</div>
	</div>\n";
			}
			else {
				echo "<p>no plant with id=".$id."<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}

	/**
	 *
	 * Draw List of all plants. Schow only name
	 */
	function drawPlantList() {
		$sql = "
		SELECT id, done, name
		FROM plant
		ORDER BY name;";
		if($result = mysql_query($sql)) {
			if(mysql_num_rows($result) > 0) {
				while($entry = mysql_fetch_array($result)) {
					$done = "";
					if($entry['done'] == '1') {
						$done = " done";
					}
					echo "<div class='entry".$done."' id='plantListElem-".$entry['id']."'>".$entry['name']."</div>\n";
				}
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}


	/**
	 *
	 * Was used once to move the main names of the plant table
	 * to the plantName table and index it in the plant table
	 */
	function movePlantName() {
		echo "<p>move plant names</p>\n";
		$sql = "
		SELECT id, name 
		FROM plant;";
		if($result1 = mysql_query($sql)) {
			if(mysql_num_rows($result1) > 0) {
				while($entry = mysql_fetch_array($result1)) {
					$insert = "
					INSERT INTO plantName (name, id_plant, id_plantNameType)
					VALUES ('".$entry['name']."', '".$entry['id']."', '1');";
					if($result2 = mysql_query($insert)) {
						echo "<p>>> moved ".$entry['name']."</p>\n";
					}
					else {
						echo "<p>error! sql: ".$insert."</p>\n";
					}
				}
				echo "<p>movePlantName done!</p>\n";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}

	/**
	 *
	 * Was used once to move the main names of the old plant table
	 * to the new plant table
	 */
	function movePlantMainName() {
		echo "<p>move plant main names</p>\n";
		$sql = "
		SELECT id, name 
		FROM plantOld;";
		if($result1 = mysql_query($sql)) {
			if(mysql_num_rows($result1) > 0) {
				while($entry = mysql_fetch_array($result1)) {
					$update = "
						UPDATE plant SET name='".$entry['name']."'
						WHERE id='".$entry['id']."';";
					if($result2 = mysql_query($update)) {
						echo "<p>>> moved ".$entry['name']."</p>\n";
					}
					else {
						echo "<p>error! sql: ".$update."</p>\n";
					}
				}
				echo "<p>movePlantMainName done!</p>\n";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}

	/**
	 *
	 * Was used once to move the alchemistic uses of the plant table
	 * to the plantText
	 */
	function movePlantAlchemisticUse() {
		echo "<p>move plant alchemistic_use</p>\n";
		$sql = "
		SELECT id, alchemistic_use
		FROM plant;";
		if($result1 = mysql_query($sql)) {
			if(mysql_num_rows($result1) > 0) {
				while($entry = mysql_fetch_array($result1)) {
					if ($entry['alchemistic_use'] != "") {
						$insert = "
						INSERT INTO plantText (text, id_plant, id_plantTextType)
						VALUES ('".$entry['alchemistic_use']."', '".$entry['id']."', '1');";
						if($result2 = mysql_query($insert)) {
							echo "<p>>> moved ".$entry['alchemistic_use']."</p>\n";
						}
						else {
							echo "<p>error! sql: ".$insert."</p>\n";
						}
					}
					else {
						echo "<p>>> field is empty</p>\n";
					}
				}
				echo "<p>movePlantAlchemisticUse done!</p>\n";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}

	/**
	 *
	 * Was used once to move the particularities of the plant table
	 * to the plantText
	 */
	function movePlantParticularity() {
		echo "<p>move plant particularity</p>\n";
		$sql = "
		SELECT id, particularity
		FROM plant;";
		if($result1 = mysql_query($sql)) {
			if(mysql_num_rows($result1) > 0) {
				while($entry = mysql_fetch_array($result1)) {
					if ($entry['particularity'] != "") {
						$insert = "
						INSERT INTO plantText (text, id_plant, id_plantTextType)
						VALUES ('".$entry['particularity']."', '".$entry['id']."', '2');";
						if($result2 = mysql_query($insert)) {
							echo "<p>>> moved ".$entry['particularity']."</p>\n";
						}
						else {
							echo "<p>error! sql: ".$insert."</p>\n";
						}
					}
					else {
						echo "<p>>> field is empty</p>\n";
					}
				}
				echo "<p>movePlantParticularity done!</p>\n";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}

	/**
	 *
	 * Was used once to move the effects of the plant table
	 * to the plantText
	 */
	function movePlantEffect() {
		echo "<p>move plant effect</p>\n";
		$sql = "
		SELECT id, effect
		FROM plant;";
		if($result1 = mysql_query($sql)) {
			if(mysql_num_rows($result1) > 0) {
				while($entry = mysql_fetch_array($result1)) {
					if ($entry['effect'] != "") {
						$insert = "
						INSERT INTO plantText (text, id_plant, id_plantTextType)
						VALUES ('".$entry['effect']."', '".$entry['id']."', '3');";
						if($result2 = mysql_query($insert)) {
							echo "<p>>> moved ".$entry['effect']."</p>\n";
						}
						else {
							echo "<p>error! sql: ".$insert."</p>\n";
						}
					}
					else {
						echo "<p>>> field is empty</p>\n";
					}
				}
				echo "<p>movePlantEffect done!</p>\n";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}
	
	/**
	 *
	 * Was used once to move the plant parts of the plant table
	 * to the plantPart table
	 */
	function movePlantPart() {
		echo "<p>move plant parts</p>\n";
		$sql = "
		SELECT id, basic_set, durability, poison 
		FROM plant;";
		if($result1 = mysql_query($sql)) {
			if(mysql_num_rows($result1) > 0) {
				while($entry = mysql_fetch_array($result1)) {
					$insert = "
					INSERT INTO plantPart (basicSet, durability, poison, id_plant)
					VALUES ('".$entry['basic_set']."', '".$entry['durability']."', '".$entry['poison']."', '".$entry['id']."');";
					if($result2 = mysql_query($insert)) {
						echo "<p>>> moved parts of plant (id=".$entry['id'].")</p>\n";
					}
					else {
						echo "<p>error! sql: ".$insert."</p>\n";
					}
				}
				echo "<p>movePlantPart done!</p>\n";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}

	/**
	 *
	 * Was used to normalize the plant type (with plantType db)
	 */
	function movePlantType() {
		echo "<p>move plant type</p>\n";
		$sql = "
		SELECT id, type
		FROM plant;";
		if($result1 = mysql_query($sql)) {
			if(mysql_num_rows($result1) > 0) {
				while($plant = mysql_fetch_array($result1)) {
					$plantTypeId = 0;
					$select = "
					SELECT id
					FROM plantType
					WHERE name='".$plant['type']."';";
					if($result2 = mysql_query($select)) {
						if(mysql_num_rows($result2) > 0) {
							$plantTypeId = mysql_fetch_array($result2);
							$plantTypeId = $plantTypeId['id'];
						}
						else {
							$insert = "
							INSERT INTO plantType (name)
							VALUES ('".$plant['type']."');";
							if(mysql_query($insert)) {
								echo "<p>>> moved ".$plant['type']."</p>\n";
							}
							else {
								echo "<p>error! sql: ".$insert."</p>\n";
							}
							$plantTypeId = mysql_insert_id();
						}
					}
					else {
						echo "<p>error! sql: ".$select."</p>\n";
					}
					if($plantTypeId != 0) {

						$update = "
						UPDATE plant
						SET id_type='".$plantTypeId."'
						WHERE id='".$plant['id']."';";
						if(mysql_query($update)) {
							echo "<p>>> updated plant ".$plant['id']."</p>\n";
						}
						else {
							echo "<p>error! sql: ".$update."</p>\n";
						}
					}
				}
				echo "<p>movePlantType done!</p>\n";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}
	
	/**
	 *
	 * Was used once to move the plant poison description of the plantPart table
	 * to the plantText table with id_plantTextType = 5
	 */
	function movePlantPoison() {
		echo "<p>move plant poison</p>\n";
		$sql = "
		SELECT poison, id_plant
		FROM plantPart;";
		if($result1 = mysql_query($sql)) {
			if(mysql_num_rows($result1) > 0) {
				while($entry = mysql_fetch_array($result1)) {
					if($entry['poison'] != "") {
						$insert = "
						INSERT INTO plantText (text, id_plant, id_plantTextType)
						VALUES ('".$entry['poison']."', '".$entry['id_plant']."', '5');";
						if($result2 = mysql_query($insert)) {
							echo "<p>>> moved poison description of plant (id=".$entry['id_plant'].")</p>\n";
						}
						else {
							echo "<p>error! sql: ".$insert."</p>\n";
						}
					}
				}
				echo "<p>movePlantPoison done!</p>\n";
			}
			else {
				echo "<p>no entries<p>\n";
			}
		}
		else {
			echo "<p>error! sql: ".$sql."</p>\n";
		}
	}
	
	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $table
	 * @param unknown_type $tableFk
	 * @param unknown_type $id
	 */
	function deleteEntry($table, $tableFk, $id) {
		$delete = "
			DELETE FROM ".$table."
			WHERE id='".$id."';";
		if(!mysql_query($delete)) {
			echo "<p>error! sql: ".$delete."</p>\n";
		}
		$deleteFk = "
			DELETE FROM ".$tableFk."
			WHERE id_".$table."='".$id."';";
		if(!mysql_query($deleteFk)) {
			echo "<p>error! sql: ".$deleteFk."</p>\n";
		}
	}

	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $table
	 * @param unknown_type $cols
	 * @param unknown_type $vals
	 */
	function insertEntry($table, $cols, $vals) {
		$insert = "
			INSERT INTO ".$table."
			(".$cols.")
			VALUES (".$vals.");";
		if(!mysql_query($insert)) {
			echo "<p>error! sql: ".$insert."</p>\n";
		}
		$plantTypeId = mysql_insert_id();
	}

	/**
	 * Update entry in table
	 *
	 * @param string $table: table name
	 * @param string $id: id of entry to be updated
	 * @param string $col: name of column in table
	 * @param string $val: new value
	 */
	function updateEntry ($table, $id, $col, $val) {
		$update = "
			UPDATE ".$table."
			SET ".$col."='".mysql_real_escape_string($val)."'
			WHERE id='".$id."';";
		if(!mysql_query($update)) {
			echo "<p>error! sql: ".$update."</p>\n";
		}
	}

}
?>

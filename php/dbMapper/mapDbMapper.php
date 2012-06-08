<?php
require_once('baseDbMapper.php');

/**
 * Class to handle the communication with the dsa_map-DB
 *
 * @author moiri
 */
class MapDbMapper extends BaseDbMapper {
	var $debug = true;
	/**
	 * Open connection to mysql database
	 *
	 * @param string $server:	address of server
	 * @param string $database:	name of database
	 * @param string $login:	username
	 * @param string $password:	password
	 */
	function MapDbMapper($server="",$database="",$login="",$password=""){
		$this->BaseDbMapper($server,$database,$login,$password);
	}
	
	/**
	 * 
	 */
	function getAllImgs () {
		$sql = "
		SELECT DISTINCT tableName
		FROM mode
		WHERE active='1'
		AND tableName!='';";
		
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";
		$result = mysql_query($sql, $this->handle)
		or die ($errorQuery);
		
		$num_rows = mysql_num_rows($result);
		if($num_rows > 0) {
			$table = array();
			while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
				array_push($table, $row);
			}
		}
		else {
			// no entry
			return false;
		}
		
		
		$retValue = array();
		for ($i = 0; $i < count($table); $i++) {
			$sql = "
			SELECT id, picturePath
			FROM ".$table[$i]['tableName']."
			WHERE picturePath!='';";
			if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
			else $errorQuery = "Error: Invalid mySQL query!";
			$result = mysql_query($sql, $this->handle)
			or die ($errorQuery);
			$num_rows = mysql_num_rows($result);
			if($num_rows >= 1) {
				while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
					$row['table'] = $table[$i]['tableName'];
					array_push($retValue, $row);
				}
			}
		}
		if (count($retValue) == 0) {
			$retValue = false;
		}
		
		return $retValue;
	}

	/**
	 * load mode information from server and build menu structure
	 *
	 * @param int $lvl:			level of the menu item (optional, default=1)
	 * @param int $parentId:	id of parent menu item (optional, default=0)
	 * @return an array with with all menu items of the specified id and parentId and all their
	 * children menu items. This array can be converted into a json string (use json_encode())
	 */
	function getMainMenu ($lvl=1,$parentId=0) {
		$menu = array();
		$sql = "
		SELECT id, parentId, name, iconPath
		FROM mode
		WHERE active=1
		AND lvl=".$lvl."
		AND parentId=".$parentId."
		ORDER BY sequence;";
		
		// set error string
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";

		// execute query
		$result = mysql_query($sql, $this->handle)
		or die ($errorQuery);
		$num_rows = mysql_num_rows($result);

		if($num_rows > 0) {
			while ($elem = mysql_fetch_assoc($result)) {
				array_push($menu, $elem);
				$res = $this->getMainMenu($lvl+1, $elem['id']);
				if($res) {
					$menu[count($menu) - 1]['submenu'] = $res;
				}
			}
		}
		else {
			return false;
		}
		return $menu;
	}

	/**
	 * load mode entries from db
	 *
	 * @param array $mode:	complete mode information (use selectByUid('mode', id))
	 * @param string $pattern: search pattern (optional, default = null)
	 * @return array: an array with with all mode items of the specified mode.
	 * This array can be converted into a json string (use json_encode())
	 */
	function getMainMenuEntries ($mode, $pattern = null) {
		$retValue = false;
		$retValue = array();
		$modeString = 'res';

		$table = mysql_real_escape_string($mode['tableName']);
		$catSel = "";
		$catJoin = "";
		if($mode['category'] != 0) {
			// prepare query if category is avaliable
			$catSel = ", c.name AS category, c.id AS c_id";
			$catJoin = " LEFT JOIN category AS c ON c.id = t.id_category";
		}
		$display = "";
		if($mode['display'] != 0) {
			// do not select entries that must not be displayed
			$display = " AND display = '1'";
		}
		$sepMode = "";
		if($mode['sepMode'] != 0) {
			// prepare query if multiple modes are in one table
			$sepMode = sprintf(" AND t.id_mode = '%d'",
					mysql_real_escape_string($mode['id']));
		}
		$search = "";
		if($pattern != null) {
			// search pattern is set, use it in WHERE
			$modeString = 'search';
			$search = sprintf(" AND t.name LIKE '%s'",
					mysql_real_escape_string("%".$pattern."%"));
		}

		$retValue['main'] = array('name' => 'main', 'id' => 0, 'mode' => $modeString, 'entries' => array());
		if ($mode['freeMode'] == 1) {
			$retValue['main']['mode'] = 'free';
			return $retValue;
		}

		$sql = sprintf("SELECT t.id AS id, t.name AS name%s FROM %s AS t%s WHERE 1%s%s%s ORDER BY t.name;",
				$catSel,
				$table,
				$catJoin,
				$display,
				$sepMode,
				$search);

		// set error string
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";
		// execute query
		$result = mysql_query($sql, $this->handle)
		or die ($errorQuery);
		$num_rows = mysql_num_rows($result);
		if($num_rows > 0) {
			while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
				if (isset($row['category'])) {
					if (!isset($retValue[$row['category']])) {
						$retValue[$row['category']] = array('name' => $row['category'], 'id' => $row['c_id'], 'entries' => array());
					}
					array_push($retValue[$row['category']]['entries'], $row);
				}
				else {
					array_push($retValue['main']['entries'], $row);
				}
			}
		}
		return $retValue;
	}
}

?>
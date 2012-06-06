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
		$i = 0;
		if($result = mysql_query($sql, $this->handle)) {
			if(mysql_num_rows($result) > 0) {
				while ($elem = mysql_fetch_assoc($result)) {
					$menu[$i] = $elem;
					$res = $this->getMainMenu($lvl+1, $elem['id']);
					if($res) {
						$menu[$i]['submenu'] = $res;
					}
					$i++;
				}
			}
			else {
				return false;
			}
		}
		return $menu;
	}

	/**
	 * load mode entries from db
	 *
	 * @param array $mode:	complete mode information (use selectByUid('mode', id))
	 * @return array: an array with with all mode items of the specified mode.
	 * This array can be converted into a json string (use json_encode())
	 */
	function getMainMenuEntries ($mode) {
		$retValue = false;
		if ($mode['freeMode'] == 1) {
			return false;
		}
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
		$sql = sprintf("SELECT t.id AS id, t.name AS name%s FROM %s AS t%s WHERE 1%s%s ORDER BY t.name;",
				$catSel,
				$table,
				$catJoin,
				$display,
				$sepMode);

		// set error string
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";
		// execute query
		$result = mysql_query($sql, $this->handle)
		or die ($errorQuery);
		$num_rows = mysql_num_rows($result);
		if($num_rows >= 1) {
			$retValue = array();
			$retValue['main'] = array('name' => 'main', 'id' => 0, 'entries' => array());
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
		else {
			// no entry
			$retValue = false;
		}
		return $retValue;
	}
}

?>
<?php
require_once('baseDbMapper.php');

/**
 * Class to handle the communication with the dsa_map-DB
 * 
 * @author moiri
 */
class MapDbMapper extends BaseDbMapper {
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
	function getMainMenu($lvl=1,$parentId=0) {
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
}

?>